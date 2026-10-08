import { renderOg } from "@/lib/og";

export const alt = "Analist Ne Diyor — altın, dolar, borsa ve kriptoda kim ne diyor";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
    return renderOg({
        eyebrow: "Ekonomist yorumları",
        title: "Ekonomistler ne diyor?",
        subtitle: "Altın, dolar, BIST 100 ve Bitcoin için kaç analist hangi yönde konuşuyor? Tavsiye yok, sayım.",
    });
}
