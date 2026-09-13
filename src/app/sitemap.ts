import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ecotube.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();
    const pages: [string, number, MetadataRoute.Sitemap[number]["changeFrequency"]][] = [
        ["", 1, "hourly"],
        ["/konsensus", 0.9, "hourly"],
        ["/analistler", 0.8, "daily"],
        ["/hakkimizda", 0.4, "monthly"],
        ["/iletisim", 0.3, "monthly"],
        ["/gizlilik", 0.2, "yearly"],
    ];
    return pages.map(([path, priority, changeFrequency]) => ({
        url: `${SITE_URL}${path}`,
        lastModified: now,
        changeFrequency,
        priority,
    }));
}
