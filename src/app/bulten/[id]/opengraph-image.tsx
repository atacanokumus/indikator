import { renderOg } from "@/lib/og";
import { getBulletin } from "@/server/read";

export const alt = "Haftalık konsensüs bülteni";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600;

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const b = await getBulletin(id);
    return renderOg({
        eyebrow: "Haftalık bülten",
        title: b?.weekLabel ?? "Haftalık konsensüs bülteni",
        subtitle: b
            ? `${b.channelCount} kanal, ${b.signalCount} görüş, ${b.flips.length} varlıkta yön değişti.`
            : "Her hafta: ekonomistlerin görüşlerinde ne değişti?",
        stat: b ? { big: String(b.flips.length), word: "yön değişimi" } : undefined,
    });
}
