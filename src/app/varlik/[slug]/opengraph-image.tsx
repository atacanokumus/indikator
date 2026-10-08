import { assetSeoName } from "@/lib/asset-seo";
import { DIRECTION, formatPrice, tallyText } from "@/lib/display";
import { OG_DIRECTION_COLOR, ogPrice, renderOg } from "@/lib/og";
import { monthYearTr } from "@/lib/seo";
import { resolveAssetSlug } from "@/lib/slug";
import { loadAssets } from "@/server/known-assets";

export const alt = "Ekonomistler ne diyor? Varlık bazında analist sayımı";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const { snapshot, known } = await loadAssets();
    const hit = resolveAssetSlug(known, slug);
    const asset = hit?.asset ?? slug;
    const name = hit ? assetSeoName(hit.asset) : slug;
    const item = snapshot.consensus.find((c) => c.asset === asset);

    if (!item) {
        return renderOg({
            eyebrow: "Yorumlar",
            title: `${name} için ekonomistler ne diyor?`,
            subtitle: "Geçmiş görüşlerin seyri ve temel bilgiler.",
        });
    }

    const price = ogPrice(formatPrice(item.price, item.currency));
    return renderOg({
        eyebrow: `${monthYearTr(snapshot.generatedAt)}`,
        title: `${name} için ekonomistler ne diyor?`,
        subtitle: `${tallyText(item.tally, item.analystCount)}.${price ? `  ·  ${price}` : ""}`,
        stat: {
            big: `${item.leadingCount} / ${item.analystCount}`,
            word: DIRECTION[item.leading],
            color: OG_DIRECTION_COLOR[item.leading],
        },
        tally: item.tally,
    });
}
