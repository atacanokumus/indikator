import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ecotube.vercel.app";

import { getHomeSnapshot } from "@/server/read";
import { assetSlug } from "@/lib/slug";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();
    const pages: [string, number, MetadataRoute.Sitemap[number]["changeFrequency"]][] = [
        ["", 1, "hourly"],
        ["/konsensus", 0.9, "hourly"],
        ["/analistler", 0.8, "daily"],
        ["/metodoloji", 0.6, "monthly"],
        ["/hakkimizda", 0.4, "monthly"],
        ["/kaldirma", 0.3, "monthly"],
        ["/kvkk", 0.2, "yearly"],
        ["/iletisim", 0.3, "monthly"],
        ["/gizlilik", 0.2, "yearly"],
    ];
    const statics: MetadataRoute.Sitemap = pages.map(([path, priority, changeFrequency]) => ({
        url: `${SITE_URL}${path}`,
        lastModified: now,
        changeFrequency,
        priority,
    }));

    // Varlık sayfaları — arama trafiğinin asıl geldiği yer
    let assets: MetadataRoute.Sitemap = [];
    try {
        const { consensus } = await getHomeSnapshot();
        assets = consensus.map((c) => ({
            url: `${SITE_URL}/varlik/${assetSlug(c.asset)}`,
            lastModified: new Date(c.latestSignalAt),
            changeFrequency: "daily" as const,
            priority: 0.8,
        }));
    } catch { /* snapshot yoksa sadece statik sayfalar */ }

    return [...statics, ...assets];
}
