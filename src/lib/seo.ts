/**
 * SEO — tek kaynak.
 *
 * Her sayfa başlığını, açıklamasını ve adresini buradaki yardımcıdan geçirir.
 * Neden: Next.js'te sayfanın `openGraph` / `twitter` alanı üst düzeydekini
 * KISMEN DEĞİL, TAMAMEN ezer. Eskiden yalnızca kök düzende tanımlıydı ve
 * alt sayfalar onu aynen miras alıyordu: her sayfada og:url ana sayfanın
 * adresiydi, og:title de ana sayfanın başlığı. Paylaşım önizlemeleri ve bazı
 * tarayıcılar için bu, "bu sayfa ana sayfanın kopyası" demek.
 *
 * Aynı nedenle kök düzende `alternates.canonical` YOKTUR: canonical'ı tanımlamayı
 * unutan bir sayfa kendini ana sayfaya kanonikleştirir ve dizinden düşer.
 */
import type { Metadata } from "next";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://analistnediyor.com").replace(/\/+$/, "");
export const SITE_NAME = "Analist Ne Diyor";

/** Sosyal ve arama sonucu önizlemelerinde kullanılan varsayılan cümle. */
export const SITE_DESCRIPTION =
    "YouTube'daki ekonomi yorumcularının altın, dolar, BIST 100 ve Bitcoin için ne dediğini " +
    "tek ekranda görün: kaç analist hangi yönde konuşuyor, geçmiş görüşler tuttu mu? " +
    "Yatırım tavsiyesi değil, sayım.";

/**
 * Bir varlık sayfasının arama dizinine girmesi için gereken en az analist sayısı.
 *
 * NEDEN: Sitemap'te 189 varlık sayfası vardı; çoğunda tek bir analist konuşmuş
 * ("Chipotle", "Tesco", "Near"). Tek cümlelik, otomatik üretilmiş yüzlerce sayfa
 * Google'ın kalite sistemlerinde TÜM siteyi aşağı çeker (özellikle para konularında).
 * Altı çizili ilke: az ama dolu sayfa. Eşiğin altındaki sayfa kullanıcıya açık kalır
 * (`noindex, follow`), sitemap'ten çıkar; analist sayısı eşiği aştığında kendiliğinden
 * dizine girer.
 */
export const MIN_ANALYSTS_FOR_INDEX = 3;

/**
 * Hukuki sayfaların (gizlilik, KVKK, kaldırma, iletişim) metni en son değiştiği tarih.
 * Gizlilik sayfasında "Son güncelleme" olarak görünür ve sitemap'in `lastmod` değeridir.
 * Bu sayfaların metnini GERÇEKTEN değiştirdiğinizde güncelleyin; her render'da
 * "bugün" yazmak okuyucuyu yanıltır ve arama motoruna sahte bir tazelik sinyali verir.
 */
export const LEGAL_PAGES_UPDATED = "2026-09-14";

export function absoluteUrl(path = "/"): string {
    if (!path || path === "/") return SITE_URL;
    return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** "2026-10-08T…" -> "Ekim 2026" (İstanbul saatine göre). */
export function monthYearTr(iso: string | Date | undefined | null): string {
    const d = iso ? new Date(iso) : new Date();
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("tr-TR", { month: "long", year: "numeric", timeZone: "Europe/Istanbul" });
}

/** Başlığı arama sonucunda kesilmeyecek uzunlukta (≈60 karakter) tutar. */
export function fitTitle(preferred: string, ...fallbacks: string[]): string {
    for (const t of [preferred, ...fallbacks]) if (t.length <= 62) return t;
    return fallbacks.length ? fallbacks[fallbacks.length - 1] : preferred;
}

/** Meta açıklamasını ≈155 karakterde, kelime ortasında kesmeden kısaltır. */
export function fitDescription(text: string, max = 158): string {
    const clean = text.replace(/\s+/g, " ").trim();
    if (clean.length <= max) return clean;
    const cut = clean.slice(0, max - 1);
    const lastSpace = cut.lastIndexOf(" ");
    return `${cut.slice(0, lastSpace > 80 ? lastSpace : cut.length).replace(/[,;:\-–—\s]+$/, "")}…`;
}

export interface PageMeta {
    /** Sayfanın başlığı. `absoluteTitle` verilmezse "… | Analist Ne Diyor" eklenir. */
    title: string;
    description: string;
    /** Kök-göreli yol: "/karne", "/varlik/altin". Ana sayfa için "/". */
    path: string;
    /** Marka ekini ekleme (başlık zaten markayı taşıyorsa ya da uzunsa). */
    absoluteTitle?: boolean;
    type?: "website" | "article";
    publishedTime?: string;
    modifiedTime?: string;
    /** Dizine girmesin ama bağlantıları izlensin. */
    noindex?: boolean;
    /** Paylaşım başlığı farklıysa (örn. marka eki olmadan). */
    ogTitle?: string;
}

export function pageMetadata(p: PageMeta): Metadata {
    const url = absoluteUrl(p.path);
    const ogTitle = p.ogTitle ?? p.title;
    const description = fitDescription(p.description);

    return {
        title: p.absoluteTitle ? { absolute: p.title } : p.title,
        description,
        alternates: {
            canonical: url,
            // Haftalık bülten beslemesi: okuyucuların ve toplayıcıların otomatik keşfi için.
            types: { "application/rss+xml": absoluteUrl("/bulten/rss.xml") },
        },
        // Yalnızca noindex'te yazılır: `robots: undefined` yazmak kökteki robots (googleBot
        // önizleme yönergeleri dahil) ayarını da siliyordu.
        ...(p.noindex ? { robots: { index: false, follow: true } } : {}),
        openGraph: {
            type: p.type ?? "website",
            locale: "tr_TR",
            siteName: SITE_NAME,
            url,
            title: ogTitle,
            description,
            ...(p.type === "article"
                ? { publishedTime: p.publishedTime, modifiedTime: p.modifiedTime ?? p.publishedTime }
                : {}),
        },
        twitter: {
            card: "summary_large_image",
            title: ogTitle,
            description,
        },
    };
}

/* ------------------------------------------------------------------ */
/* JSON-LD                                                             */
/* ------------------------------------------------------------------ */

/**
 * JSON-LD'yi <script> içine güvenle gömer. JSON.stringify "</script>" dizisini
 * kaçırmaz; veri tabanından gelen bir metinde bulunsa sayfa yapısını bozar
 * (ve XSS kapısı olur). "<" karakterini \u003c ile değiştirmek ayrıştırıcı
 * için aynı anlama gelir ama etiketi kapatamaz.
 */
export function serializeJsonLd(data: unknown): string {
    return JSON.stringify(data).replace(/</g, "\\u003c").replace(/\u2028|\u2029/g, "");
}

export const ORG_ID = `${SITE_URL}#org`;
export const WEBSITE_ID = `${SITE_URL}#website`;

/**
 * Logo, Google'ın kuralı gereği RASTER olmak zorunda (SVG kabul edilmiyor):
 * en az 112×112 px, PNG/JPG/WebP. /logo.png rotası bunu üretir.
 */
export const LOGO_URL = `${SITE_URL}/logo.png`;

export function organizationLd() {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": ORG_ID,
        name: SITE_NAME,
        url: SITE_URL,
        logo: { "@type": "ImageObject", url: LOGO_URL, width: 512, height: 512 },
        description:
            "Takip edilen YouTube ekonomi yorumcularının görüşlerini varlık bazında sayan, " +
            "geçmiş görüşlerin sonradan tutup tutmadığını fiyat verisiyle ölçen bağımsız bir yayın.",
        knowsLanguage: ["tr", "en"],
        areaServed: "TR",
        contactPoint: {
            "@type": "ContactPoint",
            contactType: "editorial and corrections",
            email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "iletisim@analistnediyor.com",
            availableLanguage: ["tr"],
        },
        publishingPrinciples: absoluteUrl("/metodoloji"),
        ethicsPolicy: absoluteUrl("/hakkimizda#yayin-ilkeleri"),
        correctionsPolicy: absoluteUrl("/hakkimizda#duzeltme-politikasi"),
    };
}

export function websiteLd() {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: SITE_NAME,
        alternateName: ["Analist Ne Diyor?", "analistnediyor.com"],
        url: SITE_URL,
        inLanguage: "tr-TR",
        description:
            "YouTube ekonomi yorumcularının videolarında hangi varlık için hangi yönde " +
            "konuştuğunun sayımı ve geçmiş görüşlerin isabet karnesi. Yatırım tavsiyesi değildir.",
        publisher: { "@id": ORG_ID },
    };
}

export interface Crumb {
    name: string;
    /** Kök-göreli yol. */
    path: string;
}

export function breadcrumbLd(crumbs: Crumb[]) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.name,
            item: absoluteUrl(c.path),
        })),
    };
}

export function articleLd(a: {
    headline: string;
    description: string;
    path: string;
    datePublished: string;
    dateModified?: string;
    section?: string;
    keywords?: string[];
    wordCount?: number;
}) {
    const url = absoluteUrl(a.path);
    return {
        "@context": "https://schema.org",
        "@type": "Article",
        "@id": `${url}#article`,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        headline: a.headline,
        description: a.description,
        inLanguage: "tr-TR",
        datePublished: a.datePublished,
        dateModified: a.dateModified ?? a.datePublished,
        author: { "@id": ORG_ID },
        publisher: { "@id": ORG_ID },
        isPartOf: { "@id": WEBSITE_ID },
        image: [`${url}/opengraph-image`],
        ...(a.section ? { articleSection: a.section } : {}),
        ...(a.keywords?.length ? { keywords: a.keywords.join(", ") } : {}),
        ...(a.wordCount ? { wordCount: a.wordCount } : {}),
    };
}

export function faqLd(items: { q: string; a: string }[]) {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
    };
}

export function webPageLd(p: {
    type?: "WebPage" | "CollectionPage" | "AboutPage" | "ContactPage";
    name: string;
    description: string;
    path: string;
    dateModified?: string;
    about?: { name: string }[];
}) {
    const url = absoluteUrl(p.path);
    return {
        "@context": "https://schema.org",
        "@type": p.type ?? "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: p.name,
        description: p.description,
        inLanguage: "tr-TR",
        isPartOf: { "@id": WEBSITE_ID },
        publisher: { "@id": ORG_ID },
        ...(p.dateModified ? { dateModified: p.dateModified } : {}),
        ...(p.about?.length ? { about: p.about.map((a) => ({ "@type": "Thing", name: a.name })) } : {}),
    };
}
