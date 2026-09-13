/**
 * Ana sayfa anlık görüntüsü (snapshot).
 *
 * NEDEN: Eskiden her ziyaretçi tarayıcıdan `analyses` koleksiyonunun TAMAMINI
 * çekiyordu (limit yok). Bu hem yavaş hem de Firestore faturasını ziyaretçi
 * sayısıyla çarpan bir tasarımdı. Artık analiz sonrası sunucuda tek bir özet
 * doküman üretiyoruz; ziyaretçi 1 doküman okuyor.
 */
import { normalizeAsset } from "@/lib/asset-utils";
import type { AssetConsensus, HomeSnapshot, Recommendation, VideoAnalysis } from "@/lib/types";
import { toIso } from "@/lib/types";
import { getAnalysesSince, getChannels, getStoredPrices, setDocData } from "./repo";

const WINDOW_DAYS = Number(process.env.SNAPSHOT_WINDOW_DAYS || 30);
const SCORE: Record<string, number> = { AL: 1, SAT: -1, TUT: 0, "GÖZLEMLE": 0 };

function timeWeight(dateIso: string): number {
    const days = (Date.now() - new Date(dateIso).getTime()) / 864e5;
    if (days <= 2) return 1;
    if (days <= 7) return 0.8;
    if (days <= 14) return 0.55;
    return 0.3;
}

export async function buildHomeSnapshot(): Promise<HomeSnapshot> {
    const [analyses, channels, prices] = await Promise.all([
        getAnalysesSince(WINDOW_DAYS, 800),
        getChannels(),
        getStoredPrices(),
    ]);

    const channelById = new Map(channels.map((c) => [c.id, c]));
    // Anahtar: varlık -> (kanal -> en güncel sinyal)
    const byAsset = new Map<string, Map<string, AssetConsensus["signals"][number]>>();
    const analysts = new Set<string>();
    let lastVideoAt: string | null = null;

    for (const video of analyses as VideoAnalysis[]) {
        const publishedAt = toIso(video.publishedAt);
        if (!lastVideoAt || publishedAt > lastVideoAt) lastVideoAt = publishedAt;
        analysts.add(video.channelId);

        for (const r of video.results || []) {
            const asset = normalizeAsset(r.asset);
            if (!asset || asset === "BİLİNMEYEN") continue;

            if (!byAsset.has(asset)) byAsset.set(asset, new Map());
            const perChannel = byAsset.get(asset)!;
            const existing = perChannel.get(video.channelId);
            if (existing && existing.date >= publishedAt) continue;

            perChannel.set(video.channelId, {
                channelId: video.channelId,
                channelTitle: video.channelTitle,
                channelThumbnail: video.channelThumbnail || channelById.get(video.channelId)?.thumbnail,
                recommendation: r.recommendation,
                reasoning: r.reasoning,
                timeframe: r.timeframe,
                videoId: video.videoId,
                videoTitle: video.videoTitle,
                date: publishedAt,
            });
        }
    }

    const consensus: AssetConsensus[] = [];

    for (const [asset, perChannel] of byAsset) {
        const signals = Array.from(perChannel.values()).sort((a, b) => b.date.localeCompare(a.date));
        const breakdown = { AL: 0, SAT: 0, BEKLE: 0 };
        let weighted = 0;
        let totalWeight = 0;

        for (const s of signals) {
            const analystWeight = channelById.get(s.channelId)?.weight ?? 1;
            const w = timeWeight(s.date) * Math.max(0.2, Math.min(2, analystWeight));
            weighted += (SCORE[s.recommendation] ?? 0) * w;
            totalWeight += w;
            if (s.recommendation === "AL") breakdown.AL++;
            else if (s.recommendation === "SAT") breakdown.SAT++;
            else breakdown.BEKLE++;
        }

        const avg = totalWeight > 0 ? weighted / totalWeight : 0;
        let recommendation: Recommendation = "TUT";
        if (avg > 0.3) recommendation = "AL";
        else if (avg < -0.3) recommendation = "SAT";
        else if (breakdown.BEKLE === signals.length) recommendation = "GÖZLEMLE";

        // Güven = baskın görüşün payı
        const dominant = Math.max(breakdown.AL, breakdown.SAT, breakdown.BEKLE);
        const confidence = signals.length ? Math.round((dominant / signals.length) * 100) : 0;

        const priceInfo = prices[asset];

        consensus.push({
            asset,
            recommendation,
            confidence,
            analystCount: signals.length,
            breakdown,
            latestSignalAt: signals[0]?.date ?? new Date(0).toISOString(),
            price: priceInfo?.price ?? null,
            currency: priceInfo?.currency ?? null,
            signals: signals.slice(0, 12),
        });
    }

    // Sıralama: önce çok konuşulan, sonra güncel
    consensus.sort(
        (a, b) => b.analystCount - a.analystCount || b.latestSignalAt.localeCompare(a.latestSignalAt)
    );

    return {
        generatedAt: new Date().toISOString(),
        videoCount: analyses.length,
        analystCount: analysts.size,
        windowDays: WINDOW_DAYS,
        consensus,
        lastVideoAt,
    };
}

export async function writeHomeSnapshot(): Promise<HomeSnapshot> {
    const snapshot = await buildHomeSnapshot();
    await setDocData("snapshots", "home", snapshot as unknown as Record<string, unknown>);
    console.log(
        `[SNAPSHOT] Güncellendi: ${snapshot.consensus.length} varlık, ${snapshot.videoCount} video, ${snapshot.analystCount} analist`
    );
    return snapshot;
}
