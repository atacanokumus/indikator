import { getChannelVideos } from "@/services/youtube";
import { getVideoTranscript, downloadAudioLocally } from "@/services/youtube";
import { analyzeTranscript, analyzeAudioFileLocally } from "@/lib/gemini";
import { saveAnalysis, checkVideoAnalysisExists } from "@/lib/firestore";
import { Timestamp } from "firebase/firestore";
import { PriceService } from "@/services/price-service";
import * as fs from "fs";


export const syncVideo = async (videoId: string, channelId: string, channelTitle: string, channelThumbnail?: string) => {
    const logs: string[] = [];
    const addLog = (m: string) => {
        console.log(m);
        logs.push(m);
    };

    try {
        addLog(`[SYNC] Manual sync started for video: ${videoId}`);

        const video = {
            id: videoId,
            title: "Manual Sync Video",
            thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            publishedAt: new Date().toISOString()
        };

        const result = await processVideo(video, channelId, channelTitle, channelThumbnail, addLog);

        return {
            success: true,
            videosProcessed: result.success ? 1 : 0,
            totalFindings: result.findings,
            logs
        };
    } catch (error: any) {
        addLog(`[CRITICAL] Video sync error: ${error.message}`);
        return { success: false, error: error.message, logs };
    }
};

import { setSyncStatus } from "./system-status";

const processVideo = async (
    video: { id: string, title: string, thumbnail: string, publishedAt: string },
    channelId: string,
    channelTitle: string,
    channelThumbnail: string | undefined,
    addLog: (m: string) => void
) => {
    addLog(`[SYNC] Processing: ${video.title} (${video.id})`);

    // 1. Daha önce analiz edilmiş mi kontrol et
    const exists = await checkVideoAnalysisExists(video.id);
    if (exists) {
        addLog(`[SYNC] Video already analyzed. Skipping.`);
        return { success: false, findings: 0 };
    }

    // Durumu veritabanına yaz
    await setSyncStatus({
        isAnalyzing: true,
        currentChannel: channelTitle,
        currentVideo: video.title
    });

    try {
        let analysisResults: any[] | null = null;

        // ==========================================
        // STRATEJI: Transkript ÖNCE (hızlı, ~5 saniye)
        // Başarısızsa video URL analizi (yavaş, ~40 saniye)
        // ==========================================

        // YÖNTEM 1: Transkript ile hızlı analiz (~5-8 saniye toplam)
        try {
            addLog(`[SYNC] Trying transcript extraction (fast path)...`);
            const transcript = await getVideoTranscript(video.id);

            if (transcript && transcript.length > 100) {
                addLog(`[SYNC] Transcript found (${transcript.length} chars). Analyzing with Gemini text...`);
                analysisResults = await analyzeTranscript(transcript);
                addLog(`[AI] Transcript analysis: ${analysisResults?.length || 0} results`);
            } else {
                addLog(`[SYNC] Transcript too short or empty. Falling back to video URL.`);
            }
        } catch (transcriptErr: any) {
            addLog(`[SYNC] Transcript failed: ${transcriptErr.message}. Trying video URL...`);
        }

        // YÖNTEM 2: Local Audio Download + Gemini File API (Autonomous Fallback)
        if (!analysisResults || analysisResults.length === 0) {
            let audioPath: string | null = null;
            try {
                addLog(`[SYNC] Transcript failed. Falling back to autonomous audio download & File API...`);
                
                // 1. Indir (Geçici)
                audioPath = await downloadAudioLocally(video.id);
                
                // 2. Yükle & Analiz Et & Sil (Gemini üzerinden)
                addLog(`[SYNC] Audio downloaded. Analyzing via Gemini File API...`);
                analysisResults = await analyzeAudioFileLocally(audioPath) as any[];
                
                addLog(`[AI] Audio analysis: ${analysisResults?.length || 0} results`);
            } catch (videoErr: any) {
                addLog(`[ERROR] Audio File analysis failed: ${videoErr.message}`);
                // ERROR: Eğer burada fail olursa empty array olarak kaydetmemiz lazım yoksa loopa girer
                analysisResults = [];
            } finally {
                // 3. Yerel Dosyayı Sil
                if (audioPath && fs.existsSync(audioPath)) {
                    try {
                        fs.unlinkSync(audioPath);
                        addLog(`[SYNC] Cleaned up local audio file: ${audioPath}`);
                    } catch (cleanupErr: any) {
                        console.warn(`[SYNC] Failed to clean up local audio file:`, cleanupErr.message);
                    }
                }
            }
        }

        if (analysisResults && analysisResults.length > 0) {
            // Fiyatları zenginleştir
            for (const result of analysisResults) {
                try {
                    const priceInfo = await PriceService.getCurrentPrice(result.asset);
                    if (priceInfo) {
                        result.entryPrice = priceInfo.price;
                    }
                } catch { /* fiyat alınamazsa devam et */ }
                result.isEvaluated = false;
                result.status = 'PENDING';
            }

            await saveAnalysis({
                videoId: video.id,
                videoTitle: video.title,
                channelId: channelId,
                channelTitle: channelTitle,
                channelThumbnail: channelThumbnail || "",
                thumbnail: video.thumbnail,
                publishedAt: video.publishedAt,
                analyzedAt: Timestamp.now(),
                results: analysisResults
            });
            
            return { success: true, findings: analysisResults.length };
        }

        // Sonuç bulunamadıysa kaydetme — bir sonraki turda tekrar denenecek
        addLog(`[SYNC] No findings for ${video.id}. Will retry next run.`);
        return { success: false, findings: 0 };
    } catch (err: any) {
        addLog(`[ERROR] ${video.id} failed: ${err.message}`);
        return { success: false, findings: 0 };
    }
};

export const syncChannel = async (channelId: string, channelTitle: string, channelThumbnail?: string, timeBudgetMs?: number) => {
    const logs: string[] = [];
    const startTime = Date.now();
    const addLog = (m: string) => {
        console.log(m);
        logs.push(m);
    };

    try {
        addLog(`[SYNC] Started for ${channelTitle}`);
        const allVideos = await getChannelVideos(channelId, addLog);
        const videos = allVideos.slice(0, 15); // Son 15 video
        addLog(`[SYNC] Total videos to check (capped at 15): ${videos.length}`);

        let analyzedCount = 0;
        let totalFindings = 0;

        for (const video of videos) {
            if (timeBudgetMs && (Date.now() - startTime) > timeBudgetMs) {
                addLog(`[SYNC] Time budget reached. Remaining videos next run.`);
                break;
            }

            const result = await processVideo(video, channelId, channelTitle, channelThumbnail, addLog);
            if (result.success) analyzedCount++;
            totalFindings += result.findings;
        }

        return { success: true, videosProcessed: analyzedCount, totalFindings, logs };
    } catch (error: any) {
        addLog(`[CRITICAL] Error: ${error.message}`);
        return { success: false, error: error.message, logs };
    }
};
