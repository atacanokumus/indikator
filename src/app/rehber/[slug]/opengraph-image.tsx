import { getGuide } from "@/content/guides";
import { renderOg } from "@/lib/og";

export const alt = "Analist Ne Diyor ekonomi rehberi";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const g = getGuide(slug);
    return renderOg({
        eyebrow: g?.category ?? "Rehber",
        title: g?.title ?? "Ekonomi rehberi",
        subtitle: "Analist Ne Diyor · ekonomi rehberi",
    });
}
