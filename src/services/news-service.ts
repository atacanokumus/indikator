import Parser from "rss-parser";
import { analyzeNewsBatch } from "@/lib/gemini";
import { getDocData, setDocData } from "@/server/repo";
import type { NewsItem } from "@/lib/types";

const parser = new Parser({ timeout: 8000 });

const SOURCES = [
    { name: "Uzmanpara", url: "https://www.milliyet.com.tr/rss/rssuzmanpara.xml" },
    { name: "Investing TR", url: "https://tr.investing.com/rss/news_25.rss" },
    { name: "Cointelegraph", url: "https://cointelegraph.com/rss" },
    { name: "CoinDesk", url: "https://www.coindesk.com/arc/outboundfeeds/rss/" },
];

const CACHE_ID = "latest";
const CACHE_TTL_MS = 15 * 60 * 1000;
const MAX_ITEMS = 12;

/**
 * ÖNEMLİ MALİYET DÜZELTMESİ
 * Eski sürüm her sayfa yüklemesinde 10 ayrı Gemini isteği atıyordu. 100 ziyaretçi
 * = 1000 istek. Artık haberler 15 dakikada bir TEK toplu istekle analiz edilip
 * Firestore'da önbelleğe alınıyor.
 */
export async function getNews(): Promise<NewsItem[]> {
    const cached = await getDocData<{ items: NewsItem[]; fetchedAt: string }>("news_cache", CACHE_ID);
    if (cached?.fetchedAt && Date.now() - new Date(cached.fetchedAt).getTime() < CACHE_TTL_MS) {
        return cached.items ?? [];
    }

    /**
     * ONBELLEK BAYATSA BILE ZIYARETCIYI BEKLETME.
     *
     * Asagidaki tazeleme sekiz RSS kaynagini (her biri 8 sn zaman asimi) ve
     * ustune bir Gemini toplu istegini iceriyor. Bu zincir sunucusuz fonksiyon
     * suresini asabiliyordu ve ana sayfa ile /konsensus'ta araliklı 502
     * goruluyordu. Artik bayat da olsa elde veri varsa o donuyor; tazeleme
     * arka planda kosuyor ve bir sonraki ziyaretci yenisini goruyor.
     */
    if (cached?.items?.length) {
        void refresh(cached).catch(() => { /* arka plan; ziyaretciyi ilgilendirmez */ });
        return cached.items;
    }

    return refresh(cached);
}

async function refresh(
    cached: { items: NewsItem[]; fetchedAt: string } | null
): Promise<NewsItem[]> {

    let items: NewsItem[] = [];
    const settled = await Promise.allSettled(SOURCES.map((s) => parser.parseURL(s.url)));
    settled.forEach((res, i) => {
        if (res.status !== "fulfilled") return;
        items.push(
            ...res.value.items.slice(0, 5).map((item) => ({
                id: item.guid || item.link || Math.random().toString(36),
                title: item.title || "",
                link: item.link || "",
                pubDate: item.pubDate || new Date().toISOString(),
                source: SOURCES[i].name,
            }))
        );
    });

    items = items
        .filter((i) => i.title && i.link)
        .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
        .slice(0, MAX_ITEMS);

    if (items.length === 0) return cached?.items ?? [];

    try {
        const analyses = await analyzeNewsBatch(items.map((i) => i.title));
        items = items.map((item, i) => ({
            ...item,
            summary: analyses[i]?.summary,
            sentiment: analyses[i]?.sentiment as NewsItem["sentiment"],
            relatedAssets: analyses[i]?.relatedAssets ?? [],
        }));
    } catch (err) {
        console.warn("[NEWS] Analiz atlandı:", (err as Error).message);
    }

    await setDocData("news_cache", CACHE_ID, { items, fetchedAt: new Date().toISOString() }).catch(
        () => { }
    );
    return items;
}
