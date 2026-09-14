/**
 * İSABET KARNESİ
 *
 * Sitenin tek özgün verisi burada: takip edilen kanalların geçmiş görüşlerinin
 * vadesi dolduğunda fiyat gerçekten o yönde hareket etmiş mi?
 *
 * ÖLÇÜM KURALLARI (metodoloji sayfasıyla birebir aynı olmak zorunda):
 *  - Giriş fiyatı: videonun yayın tarihindeki kapanış.
 *  - Çıkış fiyatı: yayın tarihi + vade süresi (KISA 7, ORTA 30, UZUN 180 gün).
 *  - Eşik: %1,5. Bunun altındaki hareket "yatay" sayılır, kimsenin lehine
 *    ya da aleyhine yazılmaz.
 *  - AL için fiyatın yükselmesi, SAT için düşmesi, TUT/GÖZLEMLE için yatay
 *    kalması görüşü doğrular.
 *  - Fiyat kaynağı olmayan varlıklar (KRIPTO, KONUT, MEVDUAT gibi sınıflar)
 *    hiç ölçülmez ve paydaya GİRMEZ.
 *
 * HUKUKİ NOT: Adıyla anılan bir kişi hakkında "tahminlerinin %X'i tuttu"
 * yayımlamak, sayı yanlışsa kişilik hakkı ihlalidir. Bu yüzden:
 *  - MIN_SAMPLE altındaki kanallar için oran HİÇ hesaplanmaz (null döner),
 *  - örneklem sayısı her satırda görünür,
 *  - ölçülemeyen kayıt sayısı gizlenmez, ayrı sütunda durur.
 */
import type { Analysis, Recommendation, Timeframe, VideoAnalysis } from "@/lib/types";
import { toIso } from "@/lib/types";
import { normalizeAsset } from "@/lib/asset-utils";
import { getAnalysesSince, getChannels, setDocData } from "./repo";

/** Bu sayının altında örneklemi olan kanal için oran gösterilmez. */
export const MIN_SAMPLE = 20;
/** Değerlendiricideki eşikle aynı olmak zorunda. */
export const THRESHOLD_PCT = 1.5;
export const TIMEFRAME_DAYS: Record<Timeframe, number> = { KISA: 7, ORTA: 30, UZUN: 180 };

export interface ScoreCounts {
    measured: number;
    hit: number;
    miss: number;
    flat: number;
    unmeasurable: number;
    pending: number;
}

export interface ScorecardRow extends ScoreCounts {
    channelId: string;
    title: string;
    thumbnail?: string;
    region: "TR" | "GLOBAL";
    /** measured < MIN_SAMPLE ise null — bilerek gösterilmiyor. */
    hitRate: number | null;
    byTimeframe: Record<Timeframe, { measured: number; hit: number }>;
    byDirection: Record<Recommendation, { measured: number; hit: number }>;
    topAssets: { asset: string; measured: number; hit: number }[];
    firstSignalAt: string | null;
    lastMeasuredAt: string | null;
}

export interface Scorecard {
    generatedAt: string;
    minSample: number;
    thresholdPct: number;
    totals: ScoreCounts;
    /** Tüm kanalların birleşik yön dağılımı — "herkes ne diyor" sorusunun cevabı. */
    directionTotals: Record<Recommendation, { measured: number; hit: number }>;
    timeframeTotals: Record<Timeframe, { measured: number; hit: number }>;
    rows: ScorecardRow[];
}

const emptyCounts = (): ScoreCounts => ({
    measured: 0, hit: 0, miss: 0, flat: 0, unmeasurable: 0, pending: 0,
});
const emptyTf = () => ({
    KISA: { measured: 0, hit: 0 },
    ORTA: { measured: 0, hit: 0 },
    UZUN: { measured: 0, hit: 0 },
});
const emptyDir = () => ({
    AL: { measured: 0, hit: 0 },
    SAT: { measured: 0, hit: 0 },
    TUT: { measured: 0, hit: 0 },
    "GÖZLEMLE": { measured: 0, hit: 0 },
});

function tally(c: ScoreCounts, a: Analysis) {
    switch (a.status) {
        case "SUCCESS": c.hit++; c.measured++; break;
        case "FAILURE": c.miss++; c.measured++; break;
        case "NEUTRAL": c.flat++; c.measured++; break;
        case "OLCULEMEZ": c.unmeasurable++; break;
        default: c.pending++;
    }
}

export async function buildScorecard(): Promise<Scorecard> {
    // Karne tüm geçmişe bakar; ana sayfadaki 30 günlük pencere burada geçerli değil.
    const [videos, channels] = await Promise.all([
        getAnalysesSince(3650, 4000),
        getChannels(),
    ]);
    const meta = new Map(channels.map((c) => [c.id, c]));

    const rows = new Map<string, ScorecardRow>();
    const assetTally = new Map<string, Map<string, { measured: number; hit: number }>>();
    const totals = emptyCounts();
    const directionTotals = emptyDir();
    const timeframeTotals = emptyTf();

    for (const video of videos as VideoAnalysis[]) {
        const id = video.channelId;
        if (!id) continue;
        const publishedAt = toIso(video.publishedAt);

        let row = rows.get(id);
        if (!row) {
            const c = meta.get(id);
            row = {
                ...emptyCounts(),
                channelId: id,
                title: c?.title || video.channelTitle || "Bilinmeyen kanal",
                thumbnail: c?.thumbnail || video.channelThumbnail,
                region: c?.region ?? "TR",
                hitRate: null,
                byTimeframe: emptyTf(),
                byDirection: emptyDir(),
                topAssets: [],
                firstSignalAt: publishedAt,
                lastMeasuredAt: null,
            };
            rows.set(id, row);
        }
        if (!row.firstSignalAt || publishedAt < row.firstSignalAt) row.firstSignalAt = publishedAt;

        for (const a of video.results || []) {
            tally(row, a);
            tally(totals, a);

            const measured = a.status === "SUCCESS" || a.status === "FAILURE" || a.status === "NEUTRAL";
            if (!measured) continue;
            const hit = a.status === "SUCCESS" ? 1 : 0;

            const tf = (TIMEFRAME_DAYS[a.timeframe] ? a.timeframe : "ORTA") as Timeframe;
            row.byTimeframe[tf].measured++; row.byTimeframe[tf].hit += hit;
            timeframeTotals[tf].measured++; timeframeTotals[tf].hit += hit;

            const dir = a.recommendation;
            if (row.byDirection[dir]) {
                row.byDirection[dir].measured++; row.byDirection[dir].hit += hit;
                directionTotals[dir].measured++; directionTotals[dir].hit += hit;
            }

            const asset = normalizeAsset(a.asset);
            if (asset) {
                let per = assetTally.get(id);
                if (!per) { per = new Map(); assetTally.set(id, per); }
                const cur = per.get(asset) ?? { measured: 0, hit: 0 };
                cur.measured++; cur.hit += hit;
                per.set(asset, cur);
            }

            if (a.measuredAt && (!row.lastMeasuredAt || a.measuredAt > row.lastMeasuredAt)) {
                row.lastMeasuredAt = a.measuredAt;
            }
        }
    }

    const list = [...rows.values()];
    for (const row of list) {
        row.hitRate = row.measured >= MIN_SAMPLE
            ? Math.round((row.hit / row.measured) * 100)
            : null;
        row.topAssets = [...(assetTally.get(row.channelId) ?? new Map()).entries()]
            .map(([asset, v]) => ({ asset, ...v }))
            .sort((a, b) => b.measured - a.measured)
            .slice(0, 4);
    }

    // Sıralama: önce oranı gösterilebilenler (isabete göre), sonra örneklemi az
    // olanlar. Oranı olmayan kanalı üste taşımak yanıltıcı olurdu.
    list.sort((a, b) => {
        if (a.hitRate === null && b.hitRate === null) return b.measured - a.measured;
        if (a.hitRate === null) return 1;
        if (b.hitRate === null) return -1;
        return b.hitRate - a.hitRate || b.measured - a.measured;
    });

    return {
        generatedAt: new Date().toISOString(),
        minSample: MIN_SAMPLE,
        thresholdPct: THRESHOLD_PCT,
        totals,
        directionTotals,
        timeframeTotals,
        rows: list,
    };
}

export async function writeScorecard(): Promise<Scorecard> {
    const card = await buildScorecard();
    await setDocData("snapshots", "scorecard", card as unknown as Record<string, unknown>);
    console.log(
        `[KARNE] ${card.rows.length} kanal, ${card.totals.measured} ölçülmüş görüş, ` +
        `${card.totals.unmeasurable} ölçülemez, ${card.totals.pending} vadesi dolmamış`
    );
    return card;
}
