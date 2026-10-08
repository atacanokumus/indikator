import { SITE_NAME, absoluteUrl } from "@/lib/seo";
import { getBulletinIndex } from "@/server/read";

/**
 * Haftalık bülten beslemesi (RSS 2.0).
 *
 * Neden: Bülten her hafta kalıcı, kendi adresi olan yeni bir sayfa üretiyor. Besleme,
 * hem okuyucuların hem de haber toplayıcıların ve yapay zeka asistanlarının yeni
 * bülteni beklemeden keşfetmesini sağlar; sayfaya doğrudan, tarayıcı gerektirmeyen
 * bir bağlantı olur.
 */
export const revalidate = 1800;

const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** "2026-W41" -> o haftanın pazartesisi. */
function mondayOf(id: string): Date {
    const m = /^(\d{4})-W(\d{2})$/.exec(id);
    if (!m) return new Date();
    const jan4 = new Date(Date.UTC(Number(m[1]), 0, 4));
    const dow = jan4.getUTCDay() || 7;
    return new Date(jan4.getTime() - (dow - 1) * 864e5 + (Number(m[2]) - 1) * 7 * 864e5);
}

export async function GET() {
    const index = await getBulletinIndex().catch(() => null);
    const items = (index?.items ?? []).slice(0, 30);

    const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${esc(SITE_NAME)} — haftalık konsensüs bülteni</title>
<link>${absoluteUrl("/bulten")}</link>
<atom:link href="${absoluteUrl("/bulten/rss.xml")}" rel="self" type="application/rss+xml"/>
<description>Her hafta: takip edilen ekonomi yorumcularının görüşlerinde ne değişti, hangi varlıkta yön döndü? Yatırım tavsiyesi değildir.</description>
<language>tr-TR</language>
${items
    .map((b) => {
        const url = absoluteUrl(`/bulten/${b.id}`);
        return `<item>
<title>${esc(b.weekLabel)} — haftalık konsensüs bülteni</title>
<link>${url}</link>
<guid isPermaLink="true">${url}</guid>
<pubDate>${mondayOf(b.id).toUTCString()}</pubDate>
<description>${esc(`${b.weekLabel} haftasında ${b.signalCount} görüş sayıldı. Hangi varlıkta baskın yön değişti, kim fikir değiştirdi?`)}</description>
</item>`;
    })
    .join("\n")}
</channel>
</rss>
`;

    return new Response(body, {
        headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=900, s-maxage=1800",
        },
    });
}
