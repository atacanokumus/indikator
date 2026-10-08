import { renderIcon } from "@/lib/og";

/**
 * Kuruluş logosu (structured data için). Google, Organization logosu olarak SVG
 * kabul etmez; PNG/JPG/WebP ve en az 112×112 ister. /logo.svg olduğu gibi duruyor.
 */
export const dynamic = "force-static";

export async function GET() {
    const res = await renderIcon(512);
    res.headers.set("Cache-Control", "public, max-age=604800, s-maxage=2592000, immutable");
    return res;
}
