import type { MetadataRoute } from "next";
import { PROFILED_ASSETS } from "@/content/assets";
import { GUIDES } from "@/content/guides";
import { isIndexableAsset } from "@/lib/asset-seo";
import { LEGAL_PAGES_UPDATED, SITE_URL } from "@/lib/seo";
import { assetSlug } from "@/lib/slug";
import { getBulletinIndex, getHomeSnapshot, getScorecard } from "@/server/read";

export const revalidate = 3600;

/**
 * `lastModified` GERÇEK değişiklik tarihini taşımalı.
 *
 * Eskiden her satıra `new Date()` yazılıyordu: sitemap her çekildiğinde 205 adresin
 * tamamı "az önce değişti" görünüyordu. Google, güvenilmez bulduğu lastmod değerlerini
 * tümüyle yok sayar; yani gerçekten değişen sayfaları ayırt etme imkânını kaybederiz.
 * Burada dinamik sayfalar kendi verisinin tarihini, sabit sayfalar elle tutulan
 * son-değişiklik tarihini kullanır.
 */
const CONTENT_UPDATED = "2026-10-08"; // bu SEO çalışmasında içeriği değişen sayfalar

type Freq = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

/** "2026-W41" -> o haftanın pazartesisi (UTC). Bültenin yayın günü. */
function isoWeekMonday(id: string): Date | null {
    const m = /^(\d{4})-W(\d{2})$/.exec(id);
    if (!m) return null;
    const year = Number(m[1]);
    const week = Number(m[2]);
    const jan4 = new Date(Date.UTC(year, 0, 4));
    const dayOfWeek = jan4.getUTCDay() || 7;
    const week1Monday = new Date(jan4.getTime() - (dayOfWeek - 1) * 864e5);
    return new Date(week1Monday.getTime() + (week - 1) * 7 * 864e5);
}

function validDate(iso: string | undefined | null): Date | null {
    if (!iso) return null;
    const d = new Date(iso);
    // 1970 = veri yok (boş anlık görüntü); bunu "değişti" diye bildirmeyelim.
    return Number.isNaN(d.getTime()) || d.getFullYear() < 2020 ? null : d;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [snapshot, scorecard, bulletinIndex] = await Promise.all([
        getHomeSnapshot().catch(() => null),
        getScorecard().catch(() => null),
        getBulletinIndex().catch(() => null),
    ]);

    const snapshotDate = validDate(snapshot?.generatedAt) ?? new Date(CONTENT_UPDATED);
    const scorecardDate = validDate(scorecard?.generatedAt) ?? new Date(CONTENT_UPDATED);
    const newestBulletin = (bulletinIndex?.items ?? [])
        .map((b) => isoWeekMonday(b.id))
        .filter((d): d is Date => d !== null)
        .sort((a, b) => b.getTime() - a.getTime())[0];
    const newestGuide = GUIDES.reduce((m, g) => (g.updated > m ? g.updated : m), "2000-01-01");

    const pages: [string, Date, Freq, number][] = [
        ["", snapshotDate, "hourly", 1],
        ["/konsensus", snapshotDate, "hourly", 0.9],
        ["/rehber", new Date(newestGuide), "weekly", 0.8],
        ["/karne", scorecardDate, "daily", 0.8],
        ["/analistler", scorecardDate, "daily", 0.7],
        ["/bulten", newestBulletin ?? new Date(CONTENT_UPDATED), "weekly", 0.7],
        ["/sozluk", new Date(CONTENT_UPDATED), "monthly", 0.5],
        ["/metodoloji", new Date(CONTENT_UPDATED), "monthly", 0.6],
        ["/hakkimizda", new Date(CONTENT_UPDATED), "monthly", 0.4],
        ["/iletisim", new Date(LEGAL_PAGES_UPDATED), "yearly", 0.3],
        ["/kaldirma", new Date(LEGAL_PAGES_UPDATED), "yearly", 0.3],
        ["/kvkk", new Date(LEGAL_PAGES_UPDATED), "yearly", 0.2],
        ["/gizlilik", new Date(LEGAL_PAGES_UPDATED), "yearly", 0.2],
    ];
    const statics: MetadataRoute.Sitemap = pages.map(([path, lastModified, changeFrequency, priority]) => ({
        url: `${SITE_URL}${path}`,
        lastModified,
        changeFrequency,
        priority,
    }));

    const guides: MetadataRoute.Sitemap = GUIDES.map((g) => ({
        url: `${SITE_URL}/rehber/${g.slug}`,
        lastModified: new Date(g.updated),
        changeFrequency: "monthly",
        priority: 0.7,
    }));

    /**
     * Varlık sayfaları — yalnızca dizine girmeye değer olanlar (bkz. MIN_ANALYSTS_FOR_INDEX).
     * Tek analistin konuştuğu yüzlerce sayfayı sitemap'e koymak, Google'a "bunlar sitenin
     * en önemli sayfaları" demek olur.
     */
    const consensus = snapshot?.consensus ?? [];
    const withData = new Set(consensus.map((c) => c.asset));
    const assets: MetadataRoute.Sitemap = [
        ...consensus
            .filter((c) => isIndexableAsset(c.asset, c.analystCount))
            .map((c) => ({
                url: `${SITE_URL}/varlik/${assetSlug(c.asset)}`,
                lastModified: validDate(c.latestSignalAt) ?? snapshotDate,
                changeFrequency: "daily" as const,
                priority: PROFILED_ASSETS.includes(c.asset) ? 0.9 : 0.6,
            })),
        // Profili yazılı ama şu an kimsenin değinmediği varlıklar da dizinde kalır.
        ...PROFILED_ASSETS.filter((a) => !withData.has(a)).map((a) => ({
            url: `${SITE_URL}/varlik/${assetSlug(a)}`,
            lastModified: new Date(CONTENT_UPDATED),
            changeFrequency: "weekly" as const,
            priority: 0.5,
        })),
    ];

    const bulletins: MetadataRoute.Sitemap = (bulletinIndex?.items ?? []).map((b) => ({
        url: `${SITE_URL}/bulten/${b.id}`,
        lastModified: isoWeekMonday(b.id) ?? new Date(CONTENT_UPDATED),
        changeFrequency: "yearly" as const,
        priority: 0.5,
    }));

    return [...statics, ...guides, ...assets, ...bulletins];
}
