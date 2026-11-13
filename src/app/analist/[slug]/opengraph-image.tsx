import { analystTallyText, analystsFromSnapshot } from "@/lib/analyst";
import { renderOg } from "@/lib/og";
import { getHomeSnapshot } from "@/server/read";

export const alt = "Yorumcunun son videolarında hangi varlık için ne dediğinin özeti";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const snapshot = await getHomeSnapshot();
    const p = analystsFromSnapshot(snapshot).find((a) => a.slug === decodeURIComponent(slug));
    return renderOg({
        eyebrow: "Yorumcu görüşleri",
        title: p ? `${p.title} ne diyor?` : "Yorumcular ne diyor?",
        subtitle: p
            ? `Son ${snapshot.windowDays} günde ${p.views.length} varlık: ${analystTallyText(p.tally)}. Tavsiye değil, özet.`
            : "Analist Ne Diyor · YouTube ekonomi yorumcularının görüşleri",
    });
}
