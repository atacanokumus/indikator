/**
 * Ana sayfa anlık görüntüsü (snapshot).
 *
 * NEDEN: Eskiden her ziyaretçi tarayıcıdan `analyses` koleksiyonunun TAMAMINI
 * çekiyordu (limit yok). Bu hem yavaş hem de Firestore faturasını ziyaretçi
 * sayısıyla çarpan bir tasarımdı. Artık analiz sonrası sunucuda tek bir özet
 * doküman üretiyoruz; ziyaretçi 1 doküman okuyor.
 *
 * HUKUKİ NOT: Bu dosya bilinçli olarak ECOTUBE adına yatırım tavsiyesi ÜRETMEZ.
 * Eskiden her varlık için ağırlıklı bir puan hesaplayıp "AL/SAT" tavsiyesi
 * basıyorduk; bu, siteyi III-37.1 sayılı Tebliğ anlamında "genel yatırım
 * tavsiyesi sunan" konuma sokuyordu. Artık yalnızca SAYIM yapılıyor: hangi
 * yönde kaç analist konuşmuş. Yorum tamamen okuyucuya ait.
 */
import { isClassAsset, normalizeAsset } from "@/lib/asset-utils";
import { ASSET_LABEL } from "@/lib/display";
import type {
    AnalystSignal,
    AssetConsensus,
    HomeSnapshot,
    Recommendation,
    Tally,
    Timeframe,
    VideoAnalysis,
} from "@/lib/types";
import { toIso } from "@/lib/types";
import {
    getAnalysesSince,
    getChannels,
    getStoredPrices,
    getSuppressedSignals,
    setDocData,
} from "./repo";

const WINDOW_DAYS = Number(process.env.SNAPSHOT_WINDOW_DAYS || 30);
/** Tebliğ m.78/2-c: geçmiş 12 ayda değişen tavsiyelerin gösterilmesi */
const HISTORY_DAYS = 365;

/** Tebliğ m.78/2-a: tavsiyenin yenilenme sıklığı açıkça belirtilmeli */
const UPDATE_FREQUENCY =
    "Takip edilen bir kanal video yayınladığı anda analiz edilir; tipik gecikme 1-2 dakikadır. " +
    "Kaçan içerik kalmaması için 3 saatte bir tarama, günde bir kez de derin tarama yapılır. " +
    "Fiyatlar en az 3 saatte bir yenilenir.";

const ORDER: Recommendation[] = ["AL", "SAT", "TUT", "GÖZLEMLE"];

interface Entry {
    rec: Recommendation;
    date: string;
    videoId: string;
    video: VideoAnalysis;
    reasoning: string;
    timeframe: Timeframe;
}

export async function buildHomeSnapshot(): Promise<HomeSnapshot> {
    const [recent, history, channels, prices, suppressed] = await Promise.all([
        getAnalysesSince(WINDOW_DAYS, 800),
        getAnalysesSince(HISTORY_DAYS, 3000),
        getChannels(),
        getStoredPrices(),
        getSuppressedSignals().catch(() => new Set<string>()),
    ]);

    /* --- 1) 12 aylık geçmiş: (varlık, kanal) bazında tüm görüşler --- */
    const byAssetChannel = new Map<string, Entry[]>();

    for (const video of history as VideoAnalysis[]) {
        const publishedAt = toIso(video.publishedAt);
        for (const r of video.results || []) {
            const asset = normalizeAsset(r.asset);
            if (!asset) continue;
            // Kullanıcı "bu özet yanlış" demişse sinyali hiç gösterme
            if (suppressed.has(`${video.videoId}::${r.asset}`)) continue;
            const key = `${asset}::${video.channelId}`;
            const list = byAssetChannel.get(key);
            const entry: Entry = {
                rec: r.recommendation,
                date: publishedAt,
                videoId: video.videoId,
                video,
                reasoning: r.reasoning,
                timeframe: r.timeframe,
            };
            if (list) list.push(entry);
            else byAssetChannel.set(key, [entry]);
        }
    }
    for (const list of byAssetChannel.values()) list.sort((a, b) => b.date.localeCompare(a.date));

    /* --- 2) Güncel pencere: sayıma girecek (varlık, kanal) çiftleri --- */
    const activePairs = new Set<string>();
    const analysts = new Set<string>();
    let lastVideoAt: string | null = null;
    const cutoff = new Date(Date.now() - WINDOW_DAYS * 864e5).toISOString();

    for (const video of recent as VideoAnalysis[]) {
        const publishedAt = toIso(video.publishedAt);
        if (!lastVideoAt || publishedAt > lastVideoAt) lastVideoAt = publishedAt;
        analysts.add(video.channelId);
        for (const r of video.results || []) {
            const asset = normalizeAsset(r.asset);
            if (!asset) continue;
            if (suppressed.has(`${video.videoId}::${r.asset}`)) continue;
            activePairs.add(`${asset}::${video.channelId}`);
        }
    }

    /* --- 3) Varlık başına SAYIM (tavsiye değil) --- */
    const consensus: AssetConsensus[] = [];
    const assets = new Set(Array.from(activePairs).map((k) => k.split("::")[0]));
    const channelById = new Map(channels.map((c) => [c.id, c]));

    for (const asset of assets) {
        const signals: AnalystSignal[] = [];
        const tally: Tally = { AL: 0, SAT: 0, TUT: 0, "GÖZLEMLE": 0 };
        let changedCount = 0;

        for (const pair of activePairs) {
            if (!pair.startsWith(`${asset}::`)) continue;
            const channelId = pair.slice(asset.length + 2);
            const list = byAssetChannel.get(pair);
            if (!list?.length) continue;

            const latest = list[0];
            if (latest.date < cutoff) continue;

            // Tebliğ m.78/2-c — aynı analistin bu varlık için değişen görüşü
            const prior = list.find((e) => e.date < latest.date && e.rec !== latest.rec);
            if (prior) changedCount++;

            tally[latest.rec] = (tally[latest.rec] ?? 0) + 1;
            signals.push({
                channelId,
                channelTitle: latest.video.channelTitle || channelById.get(channelId)?.title || "",
                channelThumbnail:
                    latest.video.channelThumbnail || channelById.get(channelId)?.thumbnail,
                recommendation: latest.rec,
                reasoning: latest.reasoning,
                timeframe: latest.timeframe,
                videoId: latest.videoId,
                videoTitle: latest.video.videoTitle,
                date: latest.date,
                previous: prior
                    ? { recommendation: prior.rec, date: prior.date, videoId: prior.videoId }
                    : null,
            });
        }

        if (signals.length === 0) continue;
        signals.sort((a, b) => b.date.localeCompare(a.date));

        // Baskın yön = en çok analistin konuştuğu yön. Eşitlik halinde EN GÜNCEL
        // sinyalin yönü kazanır; böylece keyfi bir tercih (ör. hep AL) yapmıyoruz.
        let leading: Recommendation = signals[0].recommendation;
        let leadingCount = tally[leading] ?? 0;
        for (const rec of ORDER) {
            if ((tally[rec] ?? 0) > leadingCount) {
                leading = rec;
                leadingCount = tally[rec] ?? 0;
            }
        }

        const priceInfo = prices[asset];
        consensus.push({
            asset,
            leading,
            leadingCount,
            share: Math.round((leadingCount / signals.length) * 100),
            analystCount: signals.length,
            tally,
            latestSignalAt: signals[0].date,
            price: priceInfo?.price ?? null,
            currency: priceInfo?.currency ?? null,
            priceAt: priceInfo?.updatedAt ?? null,
            changedCount,
            signals: signals.slice(0, 15),
        });
    }

    // Serbest metin artıklarını ele: yapay zeka bazen varlık yerine cümle
    // döndürüyor ("Manipülatif sığ hisseler"). Tanıdığımız bir kod değilse ve
    // tek analist söylediyse listeye alma.
    const cleaned = consensus.filter((c) => {
        if (ASSET_LABEL[c.asset] || isClassAsset(c.asset)) return true;
        if (c.analystCount >= 2) return true;
        return /^[A-Z0-9.=/-]{2,10}$/.test(c.asset);
    });

    cleaned.sort(
        (a, b) => b.analystCount - a.analystCount || b.latestSignalAt.localeCompare(a.latestSignalAt)
    );

    return {
        generatedAt: new Date().toISOString(),
        updateFrequency: UPDATE_FREQUENCY,
        videoCount: recent.length,
        analystCount: analysts.size,
        windowDays: WINDOW_DAYS,
        consensus: cleaned,
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
