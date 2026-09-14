/**
 * Video analiz hattı (sunucu tarafı).
 * Akış: transkript dene → olmazsa ses indir + Gemini File API → sonuçları kaydet.
 * Başarısız videolar işaretlenir, 3 denemeden sonra bir daha denenmez.
 */
import { getChannelVideos, getVideoDurationSeconds, getVideoTranscript } from "@/services/youtube";
import { analyzeTranscript } from "@/lib/gemini";
import { PriceService } from "@/services/price-service";
import type { Analysis, VideoInfo } from "@/lib/types-video";
import {
    clearFailure,
    recordFailure,
    saveAnalysis,
    setSyncStatus,
    shouldSkipVideo,
    videoAlreadyAnalyzed,
} from "./repo";

export interface SyncResult {
    success: boolean;
    videosProcessed: number;
    totalFindings: number;
    logs: string[];
    error?: string;
}

const makeLogger = () => {
    const logs: string[] = [];
    return {
        logs,
        log: (m: string) => {
            console.log(m);
            logs.push(m);
        },
    };
};

/** Bundan kısa videolar analiz edilmez: Shorts ve klipler sinyal taşımaz, kota harcar. */
const MIN_DURATION_SECONDS = Number(process.env.MIN_VIDEO_SECONDS || 240);

export async function processVideo(
    video: VideoInfo,
    channelId: string,
    channelTitle: string,
    channelThumbnail: string | undefined,
    log: (m: string) => void,
    language: "tr" | "en" = "tr"
): Promise<{ success: boolean; findings: number }> {
    log(`[SYNC] İşleniyor: ${video.title} (${video.id})`);

    if (await videoAlreadyAnalyzed(video.id)) {
        log(`[SYNC] Zaten analiz edilmiş, atlanıyor.`);
        return { success: false, findings: 0 };
    }
    if (await shouldSkipVideo(video.id)) {
        log(`[SYNC] 3 kez başarısız oldu, kalıcı olarak atlanıyor.`);
        return { success: false, findings: 0 };
    }

    // Shorts filtresi — resmi YouTube Data API ile (1 kota birimi)
    const duration = await getVideoDurationSeconds(video.id);
    if (duration !== null && duration < MIN_DURATION_SECONDS) {
        log(`[SYNC] Video çok kısa (${duration} sn) — Shorts/klip, atlanıyor.`);
        await recordFailure(video.id, `Çok kısa: ${duration} sn`);
        return { success: false, findings: 0 };
    }

    await setSyncStatus({ isAnalyzing: true, currentChannel: channelTitle, currentVideo: video.title });

    let results: Analysis[] = [];
    let lastError = "";

    // Tek yol: altyazı. Ses indirme yolu, YouTube Kullanım Şartları nedeniyle
    // kaldırıldı; altyazısı olmayan video analiz edilmeden atlanır.
    try {
        log(`[SYNC] Altyazı alınıyor...`);
        const transcript = await getVideoTranscript(video.id, language);
        if (transcript && transcript.length > 200) {
            log(`[SYNC] Altyazı bulundu (${transcript.length} karakter).`);
            results = await analyzeTranscript(transcript, video.title);
            log(`[AI] Analiz: ${results.length} sonuç`);
        } else {
            lastError = "Altyazı çok kısa veya boş";
            log(`[SYNC] ${lastError} — video atlanıyor.`);
        }
    } catch (err) {
        lastError = `Altyazı alınamadı: ${(err as Error).message}`;
        log(`[SYNC] ${lastError} — video atlanıyor.`);
    }

    if (results.length === 0) {
        await recordFailure(video.id, lastError || "Sinyal bulunamadı");
        log(`[SYNC] ${video.id} için sonuç yok. Deneme sayacı artırıldı.`);
        return { success: false, findings: 0 };
    }

    // Giriş fiyatlarını işaretle (başarı takibi için)
    for (const r of results) {
        try {
            const p = await PriceService.getCurrentPrice(r.asset);
            if (p) r.entryPrice = p.price;
        } catch { /* fiyat yoksa devam */ }
        r.isEvaluated = false;
        r.status = "PENDING";
    }

    await saveAnalysis({
        videoId: video.id,
        videoTitle: video.title,
        channelId,
        channelTitle,
        channelThumbnail: channelThumbnail || "",
        thumbnail: video.thumbnail || `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`,
        publishedAt: video.publishedAt,
        analyzedAt: new Date().toISOString(),
        results,
    });
    await clearFailure(video.id);

    log(`[SYNC] ✓ Kaydedildi: ${results.length} sinyal`);
    return { success: true, findings: results.length };
}

/** Tek bir videoyu analiz et (push bildirimi veya admin paneli için). */
export async function syncVideo(
    videoId: string,
    channelId: string,
    channelTitle: string,
    channelThumbnail?: string,
    videoMeta?: Partial<VideoInfo>,
    language: "tr" | "en" = "tr"
): Promise<SyncResult> {
    const { log, logs } = makeLogger();
    try {
        const video: VideoInfo = {
            id: videoId,
            title: videoMeta?.title || "Video",
            thumbnail: videoMeta?.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            publishedAt: videoMeta?.publishedAt || new Date().toISOString(),
        };
        const r = await processVideo(video, channelId, channelTitle, channelThumbnail, log, language);
        return { success: true, videosProcessed: r.success ? 1 : 0, totalFindings: r.findings, logs };
    } catch (err) {
        const message = (err as Error).message;
        log(`[CRITICAL] ${message}`);
        return { success: false, videosProcessed: 0, totalFindings: 0, error: message, logs };
    } finally {
        await setSyncStatus({ isAnalyzing: false, currentChannel: "", currentVideo: "" });
    }
}

/** Bir kanalın son videolarını tara. */
export async function syncChannel(
    channelId: string,
    channelTitle: string,
    channelThumbnail?: string,
    opts: { maxVideos?: number; timeBudgetMs?: number; language?: "tr" | "en" } = {}
): Promise<SyncResult> {
    const { log, logs } = makeLogger();
    const start = Date.now();
    const maxVideos = opts.maxVideos ?? 5;

    try {
        log(`[SYNC] ${channelTitle} taranıyor...`);
        const videos = (await getChannelVideos(channelId, log)).slice(0, maxVideos);
        log(`[SYNC] Kontrol edilecek video: ${videos.length}`);

        let processed = 0;
        let findings = 0;

        for (const video of videos) {
            if (opts.timeBudgetMs && Date.now() - start > opts.timeBudgetMs) {
                log(`[SYNC] Süre bütçesi doldu, kalanlar sonraki turda.`);
                break;
            }
            const r = await processVideo(video, channelId, channelTitle, channelThumbnail, log, opts.language ?? "tr");
            if (r.success) processed++;
            findings += r.findings;
        }

        return { success: true, videosProcessed: processed, totalFindings: findings, logs };
    } catch (err) {
        const message = (err as Error).message;
        log(`[CRITICAL] ${message}`);
        return { success: false, videosProcessed: 0, totalFindings: 0, error: message, logs };
    } finally {
        await setSyncStatus({ isAnalyzing: false, currentChannel: "", currentVideo: "" });
    }
}
