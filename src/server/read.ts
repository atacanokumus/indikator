import { unstable_cache } from "next/cache";
import type { HomeSnapshot } from "@/lib/types";
import { getDocData } from "./repo";

const EMPTY: HomeSnapshot = {
    generatedAt: new Date(0).toISOString(),
    videoCount: 0,
    analystCount: 0,
    windowDays: 30,
    updateFrequency: "",
    consensus: [],
    lastVideoAt: null,
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
