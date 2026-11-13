import { getTool } from "@/content/tools";
import { renderOg } from "@/lib/og";

export const alt = "Analist Ne Diyor hesaplama aracı";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const t = getTool(slug);
    return renderOg({
        eyebrow: "Hesaplama aracı",
        title: t?.title ?? "Hesaplama araçları",
        subtitle: "Analist Ne Diyor · rakamı siz girin, formül açıkta",
    });
}
