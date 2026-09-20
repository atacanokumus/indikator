import { unstable_cache } from "next/cache";
import type { HomeSnapshot } from "@/lib/types";
import type { Scorecard } from "./scorecard";
import type { Bulletin } from "./bulletin";
import type { HistoryPoint } from "./history";
import { getDocData } from "./repo";

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
            return (await getDocData<HomeSnapshot>("snapshots", "home")) ?? EMPTY;
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
            return await getDocData<Scorecard>("snapshots", "scorecard");
        } catch (err) {
            console.error("[READ] karne okunamadı:", (err as Error).message);
            return null;
        }
    },
    ["scorecard"],
    { revalidate: 300, tags: ["scorecard"] }
);

/** Haftalık bülten — tek bülten, liste ve en güncel. */
export const getBulletin = unstable_cache(
    async (id: string): Promise<Bulletin | null> => {
        try {
            return await getDocData<Bulletin>("bulletins", id);
        } catch {
            return null;
        }
    },
    ["bulletin"],
    { revalidate: 3600, tags: ["bulletin"] }
);

export const getLatestBulletin = unstable_cache(
    async (): Promise<Bulletin | null> => {
        try {
            return await getDocData<Bulletin>("bulletins", "latest");
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
            return await getDocData("bulletins", "index");
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
