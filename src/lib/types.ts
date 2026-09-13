/** Hem tarayıcı hem sunucu tarafında kullanılan ortak tipler. */

export type Recommendation = "AL" | "SAT" | "TUT" | "GÖZLEMLE";
export type Timeframe = "KISA" | "ORTA" | "UZUN";
export type EvalStatus = "PENDING" | "SUCCESS" | "FAILURE" | "NEUTRAL";

export interface Analysis {
    asset: string;
    recommendation: Recommendation;
    score?: number;
    timeframe: Timeframe;
    reasoning: string;
    targetPrice?: number | string | null;
    entryPrice?: number | null;
    exitPrice?: number | null;
    evaluatedAt?: string | null;
    isEvaluated?: boolean;
    status?: EvalStatus;
}

export interface VideoAnalysis {
    videoId: string;
    videoTitle: string;
    channelId: string;
    channelTitle: string;
    channelThumbnail?: string;
    thumbnail: string;
    /** ISO 8601 */
    publishedAt: string;
    /** ISO 8601 */
    analyzedAt: string;
    results: Analysis[];
    /** Değerlendirilmemiş sonuç var mı — Evaluator sorgusu bunun üzerinden çalışır. */
    hasPending?: boolean;
}

export interface Channel {
    id: string;
    title: string;
    thumbnail?: string;
    handle?: string;
    addedAt?: string;
    totalScore?: number;
    predictionCount?: number;
    successCount?: number;
    weight?: number;
}

export interface NewsItem {
    id: string;
    title: string;
    link: string;
    pubDate: string;
    source: string;
    summary?: string;
    sentiment?: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
    relatedAssets?: string[];
}

/** Ana sayfanın tek okumada aldığı, sunucuda önceden hesaplanmış özet. */
export interface AssetConsensus {
    asset: string;
    recommendation: Recommendation;
    /** 0-100 */
    confidence: number;
    analystCount: number;
    breakdown: { AL: number; SAT: number; BEKLE: number };
    latestSignalAt: string;
    price?: number | null;
    currency?: string | null;
    signals: {
        channelId: string;
        channelTitle: string;
        channelThumbnail?: string;
        recommendation: Recommendation;
        reasoning: string;
        timeframe: Timeframe;
        videoId: string;
        videoTitle: string;
        date: string;
    }[];
}

export interface HomeSnapshot {
    generatedAt: string;
    /** Analiz edilen toplam video sayısı (pencere içinde) */
    videoCount: number;
    analystCount: number;
    windowDays: number;
    consensus: AssetConsensus[];
    lastVideoAt: string | null;
}

/** Firestore Timestamp / ISO string / Date karışımını ISO string'e çevirir. */
export function toIso(value: unknown): string {
    if (!value) return new Date(0).toISOString();
    if (typeof value === "string") return value;
    if (value instanceof Date) return value.toISOString();
    const v = value as { toDate?: () => Date; seconds?: number; _seconds?: number };
    if (typeof v.toDate === "function") return v.toDate().toISOString();
    const secs = v.seconds ?? v._seconds;
    if (typeof secs === "number") return new Date(secs * 1000).toISOString();
    return new Date(0).toISOString();
}
