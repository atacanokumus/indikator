/**
 * Geliştirme için sahte veri.
 * Firebase servis hesabı olmadan arayüzü çalıştırabilmek içindir.
 * Yalnızca `npm run dev` + ECOTUBE_MOCK=1 ile devreye girer; üretimde asla çalışmaz.
 */
import type { HomeSnapshot, Recommendation } from "@/lib/types";

const ANALYSTS = [
    "Ekonomi Masası", "Piyasa Notları", "Finans Günlüğü", "Kriptolog",
    "Borsa Radarı", "Makro Bakış", "Altın Analiz",
];

const ASSETS: [string, Recommendation, number, string][] = [
    ["ALTIN", "AL", 5482.4, "TRY"],
    ["USD/TRY", "TUT", 47.92, "TRY"],
    ["BTC", "AL", 98450, "USD"],
    ["XU100", "SAT", 11240, "TRY"],
    ["GÜMÜŞ", "AL", 62.15, "TRY"],
    ["EUR/TRY", "TUT", 52.4, "TRY"],
    ["THYAO", "AL", 312.75, "TRY"],
    ["ETH", "GÖZLEMLE", 3420, "USD"],
    ["ASELS", "AL", 89.4, "TRY"],
    ["CL=F", "SAT", 68.2, "USD"],
];

export function mockSnapshot(): HomeSnapshot {
    const now = Date.now();
    return {
        generatedAt: new Date().toISOString(),
        videoCount: 64,
        analystCount: ANALYSTS.length,
        windowDays: 30,
        lastVideoAt: new Date(now - 42 * 60_000).toISOString(),
        consensus: ASSETS.map(([asset, rec, price, currency], idx) => {
            const count = 3 + ((idx * 2) % 5);
            const signals = Array.from({ length: count }, (_, i) => {
                const r: Recommendation =
                    i === 0 ? rec : (["AL", "SAT", "TUT", "GÖZLEMLE"] as Recommendation[])[(idx + i) % 4];
                return {
                    channelId: `mock-${i}`,
                    channelTitle: ANALYSTS[(idx + i) % ANALYSTS.length],
                    recommendation: r,
                    reasoning:
                        "Konuşmacı, mevcut faiz patikası ve küresel risk iştahının bu varlık üzerinde belirleyici olduğunu, kısa vadede bu seviyelerin korunmasını beklediğini belirtti.",
                    timeframe: (["KISA", "ORTA", "UZUN"] as const)[i % 3],
                    videoId: "dQw4w9WgXcQ",
                    videoTitle: "Piyasalarda bu hafta ne olacak?",
                    date: new Date(now - (i + 1) * 9 * 3600_000).toISOString(),
                };
            });
            const breakdown = { AL: 0, SAT: 0, BEKLE: 0 };
            signals.forEach((s) =>
                s.recommendation === "AL" ? breakdown.AL++ : s.recommendation === "SAT" ? breakdown.SAT++ : breakdown.BEKLE++
            );
            return {
                asset,
                recommendation: rec,
                confidence: Math.round((Math.max(breakdown.AL, breakdown.SAT, breakdown.BEKLE) / count) * 100),
                analystCount: count,
                breakdown,
                latestSignalAt: signals[0].date,
                price,
                currency,
                signals,
            };
        }),
    };
}
