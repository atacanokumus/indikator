/**
 * ANALİST (KANAL) SAYFALARI — veri ve dizin kuralları.
 *
 * Sayfa yalnızca ana sayfa anlık görüntüsünden (snapshots/home) beslenir: her
 * yorumcunun, sayım penceresi içinde değindiği her varlık için EN GÜNCEL görüşü.
 * Ek veri tabanı sorgusu yok; kanal listesi ayrıca saatte bir okunur ki pencere
 * içinde hiç konuşmamış kanalın sayfası da 404 olmasın.
 *
 * HUKUKİ / EDİTORYAL SINIRLAR (değiştirmeden önce okuyun, bkz. docs/seo.md):
 *  - Bu sayfalarda İSABET ORANI, PUAN ya da SIRALAMA gösterilmez. Adı geçen kişi
 *    hakkında "başarılı / başarısız" hükmü arama sonucuna taşınmaz; oranlar
 *    yalnızca /analistler ve /karne sayfalarında, yöntem notuyla birlikte durur.
 *  - Sayfa kişiyi değil, kişinin VİDEODA SÖYLEDİĞİNİ anlatır; her özet kaynak
 *    videoya bağlıdır ve "Bu özet yanlış" düğmesi taşır.
 *  - Her sayfada kanal sahibine yönelik kaldırma yolu görünür.
 *
 * DİZİN KURALI: pencere içinde en az MIN_INDEX_SIGNALS varlık için görüşü olan
 * kanalın sayfası dizine girer. Bir iki özetten ibaret sayfa "ince içerik"tir
 * (AdSense'in "düşük değerli içerik" reddinin nedeni); kullanıcıya açık kalır
 * ama `noindex, follow` olur, sitemap'e girmez, reklam yuvası taşımaz.
 */
import type { AnalystSignal, AssetConsensus, HomeSnapshot, Recommendation, Region, Tally } from "@/lib/types";
import { slugify } from "@/lib/slug";

export const MIN_INDEX_SIGNALS = 5;

export interface AnalystView {
    asset: string;
    signal: AnalystSignal;
    /** Bu varlıkta tüm yorumcuların sayımı (karşılaştırma için). */
    consensus: Pick<AssetConsensus, "leading" | "leadingCount" | "analystCount" | "tally">;
}

export interface AnalystProfile {
    id: string;
    title: string;
    slug: string;
    region?: Region;
    thumbnail?: string;
    /** Varlık başına en güncel görüş; yeniden eskiye. */
    views: AnalystView[];
    tally: Tally;
    latestAt: string | null;
}

export function analystSlug(title: string): string {
    return slugify(title);
}

export function analystPath(title: string): string {
    return `/analist/${analystSlug(title)}`;
}

const EMPTY_TALLY = (): Tally => ({ AL: 0, SAT: 0, TUT: 0, "GÖZLEMLE": 0 });

/** Anlık görüntüdeki tüm sinyalleri kanala göre gruplar. */
export function analystsFromSnapshot(snapshot: HomeSnapshot): AnalystProfile[] {
    const map = new Map<string, AnalystProfile>();
    for (const c of snapshot.consensus) {
        for (const s of c.signals) {
            const slug = analystSlug(s.channelTitle);
            if (!slug) continue;
            let p = map.get(s.channelId);
            if (!p) {
                p = {
                    id: s.channelId, title: s.channelTitle, slug,
                    region: s.region, thumbnail: s.channelThumbnail,
                    views: [], tally: EMPTY_TALLY(), latestAt: null,
                };
                map.set(s.channelId, p);
            }
            p.views.push({
                asset: c.asset,
                signal: s,
                consensus: { leading: c.leading, leadingCount: c.leadingCount, analystCount: c.analystCount, tally: c.tally },
            });
            p.tally[s.recommendation] = (p.tally[s.recommendation] ?? 0) + 1;
            if (!p.latestAt || s.date > p.latestAt) p.latestAt = s.date;
        }
    }
    for (const p of map.values()) p.views.sort((a, b) => (a.signal.date < b.signal.date ? 1 : -1));
    return [...map.values()].sort((a, b) => b.views.length - a.views.length || a.title.localeCompare(b.title, "tr"));
}

export function isIndexableAnalyst(p: Pick<AnalystProfile, "views">): boolean {
    return p.views.length >= MIN_INDEX_SIGNALS;
}

const WORD: Record<Recommendation, string> = {
    AL: "alım yönünde",
    SAT: "satış yönlü",
    TUT: "bekle",
    "GÖZLEMLE": "gözlemle",
};

/** "12 varlıkta alım yönünde, 5 varlıkta gözlemle, 2 varlıkta satış yönlü" */
export function analystTallyText(tally: Tally): string {
    return (["AL", "SAT", "TUT", "GÖZLEMLE"] as Recommendation[])
        .map((rec) => ({ rec, n: tally[rec] ?? 0 }))
        .filter((x) => x.n > 0)
        .sort((a, b) => b.n - a.n)
        .map((x) => `${x.n} varlıkta ${WORD[x.rec]}`)
        .join(", ");
}

export function directionWordLower(rec: Recommendation): string {
    return WORD[rec];
}
