import type { MetadataRoute } from "next";
import { PROFILED_ASSETS } from "@/content/assets";
import { GUIDES } from "@/content/guides";
import { TOOLS } from "@/content/tools";
import { analystsFromSnapshot, isIndexableAnalyst } from "@/lib/analyst";
import { isIndexableAsset } from "@/lib/asset-seo";
import { LEGAL_PAGES_UPDATED, MIN_INDEX_BULLETIN_SIGNALS, SITE_URL } from "@/lib/seo";
import { assetSlug } from "@/lib/slug";
import { getBulletinIndex, getHomeSnapshot } from "@/server/read";

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
const CONTENT_UPDATED = "2026-10-08"; // Ekim 2026 SEO çalışmasında içeriği değişen sayfalar
const TRUST_PAGES_UPDATED = "2026-11-13"; // hakkımızda, iletişim, metodoloji, sözlük: metin değişti

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
    const [snapshot, bulletinIndex] = await Promise.all([
        getHomeSnapshot().catch(() => null),
        getBulletinIndex().catch(() => null),
    ]);

    const snapshotDate = validDate(snapshot?.generatedAt) ?? new Date(CONTENT_UPDATED);
    const newestBulletin = (bulletinIndex?.items ?? [])
        .map((b) => isoWeekMonday(b.id))
        .filter((d): d is Date => d !== null)
        .sort((a, b) => b.getTime() - a.getTime())[0];
    const newestGuide = GUIDES.reduce((m, g) => (g.updated > m ? g.updated : m), "2000-01-01");
    const newestTool = TOOLS.reduce((m, t) => (t.updated > m ? t.updated : m), "2000-01-01");

    const pages: [string, Date, Freq, number][] = [
        ["", snapshotDate, "hourly", 1],
        ["/konsensus", snapshotDate, "hourly", 0.9],
        ["/rehber", new Date(newestGuide), "weekly", 0.8],
        ["/bulten", newestBulletin ?? new Date(CONTENT_UPDATED), "weekly", 0.7],
        ["/sozluk", new Date(TRUST_PAGES_UPDATED), "monthly", 0.5],
        ["/araclar", new Date(newestTool), "monthly", 0.7],
        ["/metodoloji", new Date(TRUST_PAGES_UPDATED), "monthly", 0.6],
        ["/hakkimizda", new Date(TRUST_PAGES_UPDATED), "monthly", 0.4],
        ["/iletisim", new Date(TRUST_PAGES_UPDATED), "yearly", 0.3],
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
     * Varlık sayfaları — yalnızca dizine girmeye değer olanlar (bkz. isIndexableAsset).
     * Tek analistin konuştuğu yüzlerce sayfayı sitemap'e koymak, Google'a "bunlar sitenin
     * en önemli sayfaları" demek olur.
     */
    const consensus = snapshot?.consensus ?? [];
    const withData = new Set(consensus.map((c) => c.asset));
    const assets: MetadataRoute.Sitemap = [
        ...consensus
            .filter((c) => isIndexableAsset(c.asset))
            .map((c) => ({
                url: `${SITE_URL}/varlik/${assetSlug(c.asset)}`,
                lastModified: validDate(c.latestSignalAt) ?? snapshotDate,
                changeFrequency: "daily" as const,
                priority: 0.9,
            })),
        // Profili yazılı ama şu an kimsenin değinmediği varlıklar da dizinde kalır.
        ...PROFILED_ASSETS.filter((a) => !withData.has(a)).map((a) => ({
            url: `${SITE_URL}/varlik/${assetSlug(a)}`,
            lastModified: new Date(CONTENT_UPDATED),
            changeFrequency: "weekly" as const,
            priority: 0.5,
        })),
    ];

    const bulletins: MetadataRoute.Sitemap = (bulletinIndex?.items ?? [])
        .filter((b) => b.signalCount >= MIN_INDEX_BULLETIN_SIGNALS)
        .map((b) => ({
        url: `${SITE_URL}/bulten/${b.id}`,
        lastModified: isoWeekMonday(b.id) ?? new Date(CONTENT_UPDATED),
        changeFrequency: "yearly" as const,
        priority: 0.5,
    }));

    const tools: MetadataRoute.Sitemap = TOOLS.map((t) => ({
        url: `${SITE_URL}/araclar/${t.slug}`,
        lastModified: new Date(t.updated),
        changeFrequency: "monthly",
        priority: 0.7,
    }));

    /** Analist sayfaları: yalnızca yeterli görüşü olanlar (bkz. isIndexableAnalyst). */
    const analysts: MetadataRoute.Sitemap = snapshot
        ? analystsFromSnapshot(snapshot)
              .filter(isIndexableAnalyst)
              .map((p) => ({
                  url: `${SITE_URL}/analist/${p.slug}`,
                  lastModified: validDate(p.latestAt) ?? snapshotDate,
                  changeFrequency: "daily" as const,
                  priority: 0.8,
              }))
        : [];

    return [...statics, ...guides, ...tools, ...assets, ...analysts, ...bulletins];
}
