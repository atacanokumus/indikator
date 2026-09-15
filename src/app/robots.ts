import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://analistnediyor.com";

/**
 * Yapay zeka asistanlarının tarayıcıları (ClaudeBot, GPTBot, PerplexityBot…)
 * "*" kuralının kapsamında zaten serbest. Yine de açıkça yazıyoruz: ileride
 * biri güvenlik eklentisiyle toplu bir engel koyduğunda, bu satırlar niyetin
 * ne olduğunu gösterir ve kazara engellemeyi zorlaştırır.
 *
 * Engellenenler: yönetim paneli ve API uçları. Bunlar taranırsa hem kota
 * harcanır hem de arama sonuçlarında anlamsız sayfalar çıkar.
 */
const AI_CRAWLERS = [
    "ClaudeBot",
    "Claude-Web",
    "anthropic-ai",
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "PerplexityBot",
    "Google-Extended",
    "Applebot-Extended",
    "CCBot",
];

export default function robots(): MetadataRoute.Robots {
    const disallow = ["/admin", "/admin/", "/api/"];
    return {
        rules: [
            { userAgent: "*", allow: "/", disallow },
            ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/", disallow })),
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    };
}
