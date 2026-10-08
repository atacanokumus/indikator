/**
 * PAYLAŞIM GÖRSELLERİ (Open Graph / Twitter kartı)
 *
 * Neden: Bir bağlantı WhatsApp'a, X'e, LinkedIn'e ya da Telegram'a yapıştırıldığında
 * görsel yoksa düz bir metin satırı çıkar; tıklanma oranı belirgin biçimde düşer.
 * Türkiye'de bu sitenin trafiğinin büyük bölümü zaten mesajlaşma uygulamalarından
 * paylaşılan bağlantılarla gelir.
 *
 * Yazı tipi: Inter, yerel dosyadan. `next/og` yerleşik yazı tipi Latin-1 ile sınırlı;
 * ğ, ş, İ, Ğ, Ş çizilemiyor ve "Gümüş" "Gümü" olarak çıkıyordu. "latin-ext"
 * alt kümesi eksik harfleri taşır. İKİ AYRI AİLE ADI şart ("Inter" ve "InterExt"):
 * satori aynı ad+ağırlıktaki ikinci dosyayı sessizce yok sayıyor ve eksik harf
 * ince (400) dosyadan geliyordu. `fontFamily: "Inter, InterExt"` harf bazında
 * yedeğe düşer. Lisans: src/assets/fonts/OFL.txt (SIL OFL 1.1).
 */
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Tally } from "@/lib/types";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const C = {
    bg: "#0b1119",
    bgTop: "#0d4d5c",
    text: "#e9eef5",
    soft: "#9fb0c3",
    muted: "#74869b",
    gold: "#e0b263",
    brand: "#4db3c9",
    AL: "#34d399",
    SAT: "#fb7185",
    TUT: "#e3a82b",
    "GÖZLEMLE": "#60a5fa",
} as const;

/** Yön -> renk (paylaşım görselindeki büyük yön kelimesi için). */
export const OG_DIRECTION_COLOR: Record<keyof Tally, string> = {
    AL: C.AL, SAT: C.SAT, TUT: C.TUT, "GÖZLEMLE": C["GÖZLEMLE"],
};

let fontCache: Promise<{ name: string; data: Buffer; weight: 400 | 700; style: "normal" }[]> | null = null;

function loadFonts() {
    if (!fontCache) {
        const dir = path.join(process.cwd(), "src/assets/fonts");
        const file = (n: string) => readFile(path.join(dir, n));
        fontCache = Promise.all([
            file("inter-latin-700-normal.woff"),
            file("inter-latin-ext-700-normal.woff"),
            file("inter-latin-400-normal.woff"),
            file("inter-latin-ext-400-normal.woff"),
        ]).then(([b, bx, r, rx]) => [
            { name: "Inter", data: b, weight: 700 as const, style: "normal" as const },
            { name: "InterExt", data: bx, weight: 700 as const, style: "normal" as const },
            { name: "Inter", data: r, weight: 400 as const, style: "normal" as const },
            { name: "InterExt", data: rx, weight: 400 as const, style: "normal" as const },
        ]);
        // Dosya okunamazsa bir sonraki istek yeniden denesin
        fontCache.catch(() => { fontCache = null; });
    }
    return fontCache;
}

/** Sitenin logo işareti (public/logo.svg ile aynı çizim), veri adresi olarak. */
export const LOGO_MARK_SVG =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">` +
    `<rect width="48" height="48" rx="13" fill="#0d4d5c"/>` +
    `<path d="M16.4 12.6q0-2.4 2-1.2l18.2 11.4q1.9 1.2 0 2.4L18.4 36.6q-2 1.2-2-1.2Z" fill="#fff"/>` +
    `<path d="M22 30.6V19.4M19 22.4l3-3 3 3" stroke="#16a34a" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="M29.2 20.2v6.6M27.2 24.9l2 2 2-2" stroke="#dc2626" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
    `</svg>`;

const LOGO_DATA_URI = `data:image/svg+xml;base64,${Buffer.from(LOGO_MARK_SVG).toString("base64")}`;

export function LogoImg({ size }: { size: number }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={LOGO_DATA_URI} width={size} height={size} alt="" />;
}

/** "₺62,15" -> "62,15 TL". Inter'de ₺ simgesi yok; kutucuk (tofu) çıkıyordu. */
export function ogPrice(formatted: string | null): string | null {
    if (!formatted) return null;
    return formatted.startsWith("₺") ? `${formatted.slice(1)} TL` : formatted;
}

type TallyKey = keyof Tally;

export interface OgCardProps {
    eyebrow?: string;
    title: string;
    subtitle?: string;
    /** Sağ blokta büyük sayı: örn. "11 / 21" */
    stat?: { big: string; word?: string; color?: string };
    tally?: Tally;
    footer?: string;
}

/** Başlığın uzunluğuna göre punto: uzun başlık taşmasın. */
function titleSize(title: string, hasStat: boolean) {
    const n = title.length;
    if (hasStat) return n > 44 ? 50 : n > 30 ? 58 : 66;
    return n > 70 ? 52 : n > 48 ? 60 : 70;
}

function OgCard({ eyebrow, title, subtitle, stat, tally, footer }: OgCardProps) {
    const parts = tally
        ? (["AL", "SAT", "TUT", "GÖZLEMLE"] as TallyKey[])
              .map((k) => ({ k, n: tally[k] ?? 0 }))
              .filter((p) => p.n > 0)
        : [];
    const sum = parts.reduce((a, p) => a + p.n, 0) || 1;

    return (
        <div
            style={{
                width: "100%", height: "100%", display: "flex", flexDirection: "column",
                justifyContent: "space-between", padding: "56px 64px",
                background: `linear-gradient(135deg, ${C.bg} 0%, ${C.bg} 45%, #0e3340 100%)`,
                fontFamily: "Inter, InterExt", color: C.text,
            }}
        >
            {/* Üst: marka */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <LogoImg size={52} />
                    <div style={{ display: "flex", fontSize: 34, fontWeight: 700, letterSpacing: -1 }}>
                        <span style={{ color: C.brand }}>analist</span>
                        <span style={{ color: C.gold }}>nediyor</span>
                    </div>
                </div>
                {eyebrow && (
                    <div style={{ display: "flex", fontSize: 24, fontWeight: 700, color: C.soft, letterSpacing: 3, textTransform: "uppercase" }}>
                        {eyebrow}
                    </div>
                )}
            </div>

            {/* Orta: başlık + isteğe bağlı sayı */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 40 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 20, flex: 1 }}>
                    <div
                        style={{
                            display: "flex", fontSize: titleSize(title, Boolean(stat)), fontWeight: 700,
                            letterSpacing: -2, lineHeight: 1.08,
                        }}
                    >
                        {title}
                    </div>
                    {subtitle && (
                        <div style={{ display: "flex", fontSize: 30, fontWeight: 400, color: C.soft, lineHeight: 1.35 }}>
                            {subtitle}
                        </div>
                    )}
                </div>

                {stat && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                        <div style={{ display: "flex", fontSize: 128, fontWeight: 700, letterSpacing: -5, lineHeight: 1 }}>
                            {stat.big}
                        </div>
                        {stat.word && (
                            <div style={{ display: "flex", fontSize: 44, fontWeight: 700, color: stat.color ?? C.gold, marginTop: 4 }}>
                                {stat.word}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Alt: sayım çubuğu + alt yazı */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {parts.length > 0 && (
                    <div style={{ display: "flex", width: "100%", height: 18, borderRadius: 9, overflow: "hidden", background: "#1a2532" }}>
                        {parts.map((p) => (
                            <div key={p.k} style={{ display: "flex", width: `${(p.n / sum) * 100}%`, height: "100%", background: C[p.k] }} />
                        ))}
                    </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: C.muted }}>
                    <span>{footer ?? "analistnediyor.com"}</span>
                    <span>Yatırım tavsiyesi değildir · sayımdır</span>
                </div>
            </div>
        </div>
    );
}

export async function renderOg(props: OgCardProps) {
    return new ImageResponse(<OgCard {...props} />, {
        ...OG_SIZE,
        fonts: await loadFonts(),
    });
}

/** Kare simge (favicon, apple-touch-icon, logo.png): köşeleri yuvarlak marka işareti. */
export async function renderIcon(size: number) {
    return new ImageResponse(
        (
            <div style={{ width: "100%", height: "100%", display: "flex" }}>
                <LogoImg size={size} />
            </div>
        ),
        { width: size, height: size }
    );
}
