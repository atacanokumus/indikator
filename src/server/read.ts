import { unstable_cache } from "next/cache";
import type { HomeSnapshot } from "@/lib/types";
import type { Scorecard } from "./scorecard";
import type { Bulletin } from "./bulletin";
import type { HistoryPoint } from "./history";
import { getChannels, getDocData } from "./repo";

/**
 * Geçici Firestore hatalarında (zaman aşımı, bağlantı kopması) okumayı yeniden dener.
 *
 * NEDEN: Bu dosyadaki okumalar hatayı yutup boş değer döndürüyor ve o boş değer
 * önbelleğe giriyor. Tek bir geçici hata, sayfanın dakikalarca (bültende bir saat)
 * boş ya da 404 sunulması demek; o sırada gelen Googlebot "sayfa yok" diye kaydeder.
 * Kasım 2026'da yerel derlemede /bulten/2026-W40 tam olarak böyle 404 üretildi.
 */
async function withRetry<T>(read: () => Promise<T>, attempts = 3): Promise<T> {
    let lastError: unknown;
    for (let i = 0; i < attempts; i++) {
        try {
            return await read();
        } catch (err) {
            lastError = err;
            if (i < attempts - 1) await new Promise((r) => setTimeout(r, 250 * (i + 1)));
        }
    }
    throw lastError;
}

const EMPTY: HomeSnapshot = {
    generatedAt: new Date(0).toISOString(),
    videoCount: 0,
    analystCount: 0,
    windowDays: 30,
    updateFrequency: "",
    consensus: [],
    lastVideoAt: null,
    lastScanAt: null,
};

/**
 * Ana sayfa verisi.
 * Sunucuda 60 saniye önbelleğe alınır: 10.000 ziyaretçi gelse bile
 * Firestore'a dakikada en fazla 1 okuma gider.
 */
export const getHomeSnapshot = unstable_cache(
    async (): Promise<HomeSnapshot> => {
        if (process.env.NODE_ENV !== "production" && process.env.ECOTUBE_MOCK === "1") {
            const { mockSnapshot } = await import("./mock");
            return mockSnapshot();
        }
        try {
            return (await withRetry(() => getDocData<HomeSnapshot>("snapshots", "home"))) ?? EMPTY;
        } catch (err) {
            console.error("[READ] snapshot okunamadı:", (err as Error).message);
            return EMPTY;
        }
    },
    ["home-snapshot"],
    { revalidate: 60, tags: ["snapshot"] }
);

/**
 * İsabet karnesi verisi. Ana sayfa anlık görüntüsüyle aynı mantık:
 * sunucuda önbelleğe alınır, ziyaretçi başına Firestore okuması yapılmaz.
 */
export const getScorecard = unstable_cache(
    async (): Promise<Scorecard | null> => {
        try {
            return await withRetry(() => getDocData<Scorecard>("snapshots", "scorecard"));
        } catch (err) {
            console.error("[READ] karne okunamadı:", (err as Error).message);
            return null;
        }
    },
    ["scorecard"],
    { revalidate: 300, tags: ["scorecard"] }
);

/**
 * Haftalık bülten — tek bülten, liste ve en güncel.
 *
 * `null` yalnızca "böyle bir bülten yok" demektir ve sayfa 404 döner. Okuma HATASI
 * ise bilerek fırlatılır: fırlatılan hata önbelleğe girmez ve Next.js sayfanın
 * önceki sağlam halini sunmaya devam eder. Eskiden hata da `null` dönüyordu;
 * var olan bülten bir saat boyunca 404 olarak önbelleğe alınabiliyordu.
 */
export const getBulletin = unstable_cache(
    async (id: string): Promise<Bulletin | null> => withRetry(() => getDocData<Bulletin>("bulletins", id)),
    ["bulletin"],
    { revalidate: 3600, tags: ["bulletin"] }
);

export const getLatestBulletin = unstable_cache(
    async (): Promise<Bulletin | null> => {
        try {
            return await withRetry(() => getDocData<Bulletin>("bulletins", "latest"));
        } catch {
            return null;
        }
    },
    ["bulletin-latest"],
    { revalidate: 600, tags: ["bulletin"] }
);

export const getBulletinIndex = unstable_cache(
    async (): Promise<{ items: { id: string; weekLabel: string; signalCount: number }[] } | null> => {
        try {
            return await withRetry(() => getDocData<{ items: { id: string; weekLabel: string; signalCount: number }[] }>("bulletins", "index"));
        } catch {
            return null;
        }
    },
    ["bulletin-index"],
    { revalidate: 600, tags: ["bulletin"] }
);


/** Varlık bazında aylık konsensüs geçmişi. Tek doküman, uzun önbellek. */
export const getAssetHistory = unstable_cache(
    async (): Promise<Record<string, HistoryPoint[]>> => {
        try {
            const doc = await getDocData<{ history: Record<string, HistoryPoint[]> }>(
                "snapshots", "history"
            );
            return doc?.history ?? {};
        } catch (err) {
            console.error("[READ] geçmiş okunamadı:", (err as Error).message);
            return {};
        }
    },
    ["asset-history"],
    { revalidate: 900, tags: ["history"] }
);


/**
 * Takip edilen kanalların adı ve bölgesi (analist sayfaları için).
 * Puan / isabet alanları BİLEREK alınmaz: bkz. src/lib/analyst.ts.
 * Saatte bir okunur; hata olursa boş liste döner ve sayfalar anlık görüntüyle çalışır.
 */
export const getChannelDirectory = unstable_cache(
    async (): Promise<{ id: string; title: string; region?: "TR" | "GLOBAL"; thumbnail?: string }[]> => {
        try {
            const channels = await withRetry(() => getChannels());
            return channels.map((c) => ({ id: c.id, title: c.title, region: c.region, thumbnail: c.thumbnail }));
        } catch (err) {
            console.error("[READ] kanal listesi okunamadı:", (err as Error).message);
            return [];
        }
    },
    ["channel-directory"],
    { revalidate: 3600, tags: ["channels"] }
);
