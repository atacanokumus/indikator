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

export type Region = "TR" | "GLOBAL";

export interface Channel {
    id: string;
    title: string;
    /** Yayın dili — altyazı seçimi ve arayüzdeki TR/Global ayrımı için */
    language?: "tr" | "en";
    region?: Region;
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

export interface AnalystSignal {
    channelId: string;
    channelTitle: string;
    region?: Region;
    channelThumbnail?: string;
    recommendation: Recommendation;
    reasoning: string;
    timeframe: Timeframe;
    videoId: string;
    videoTitle: string;
    date: string;
    /** Videonun kaçıncı saniyesinde bu konuya girildiği (varsa) */
    startSeconds?: number | null;
    /** Aynı analistin bu varlık için bir önceki görüşü — Tebliğ m.78/2-c */
    previous?: { recommendation: Recommendation; date: string; videoId: string } | null;
}

/** Her yönde kaç analist konuşmuş — sitenin gösterdiği tek sayısal gerçek. */
export interface Tally {
    AL: number;
    SAT: number;
    TUT: number;
    "GÖZLEMLE": number;
}

/**
 * Ana sayfanın tek okumada aldığı, sunucuda önceden hesaplanmış özet.
 *
 * NOT: Burada kasıtlı olarak `recommendation` alanı YOKTUR. Site kendi
 * yatırım tavsiyesini üretmez; yalnızca analistlerin görüşlerini sayar.
 * `leading` sadece "en çok hangi yönde konuşuldu" bilgisidir, bir öneri değildir.
 */
export interface AssetConsensus {
    asset: string;
    /** En çok analistin konuştuğu yön — tavsiye değil, sayımın sonucu */
    leading: Recommendation;
    /** Baskın yönde konuşan analist sayısı */
    leadingCount: number;
    /** Baskın yönün toplam içindeki payı, 0-100 */
    share: number;
    analystCount: number;
    tally: Tally;
    latestSignalAt: string;
    price?: number | null;
    currency?: string | null;
    /** Fiyatın alındığı an — Tebliğ m.78/2-b */
    priceAt?: string | null;
    /** Son 12 ayda görüşünü değiştiren analist sayısı — Tebliğ m.78/2-c */
    changedCount: number;
    /** Yerli / yabancı analist dağılımı — çeşitliliği görünür kılar */
    regionSplit: { TR: number; GLOBAL: number };
    signals: AnalystSignal[];
}

export interface HomeSnapshot {
    generatedAt: string;
    /** Tebliğ m.78/2-a — tavsiyenin yenilenme sıklığı */
    updateFrequency: string;
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
