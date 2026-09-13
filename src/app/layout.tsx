import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "../styles/site.css";

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ecotube.vercel.app";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: "ECOTUBE — Ekonomistler ne diyor?",
        template: "%s | ECOTUBE",
    },
    description:
        "YouTube ekonomi yorumcularının son videolarını yapay zeka ile analiz ediyoruz. Altın, dolar, BIST 100 ve kripto için AL/SAT/BEKLE sinyallerini tek ekranda takip edin.",
    applicationName: "ECOTUBE",
    keywords: [
        "ekonomist yorumları", "altın yorumu", "dolar yorumu", "borsa sinyali",
        "bist 100", "bitcoin analiz", "youtube ekonomist", "piyasa konsensüsü",
    ],
    authors: [{ name: "ECOTUBE" }],
    openGraph: {
        type: "website",
        locale: "tr_TR",
        url: SITE_URL,
        siteName: "ECOTUBE",
        title: "ECOTUBE — Ekonomistler ne diyor?",
        description:
            "YouTube ekonomi yorumcularının sinyalleri, yapay zeka ile derlenmiş tek ekranda.",
    },
    twitter: {
        card: "summary_large_image",
        title: "ECOTUBE — Ekonomistler ne diyor?",
        description: "YouTube ekonomi yorumcularının sinyalleri tek ekranda.",
    },
    robots: { index: true, follow: true },
    alternates: { canonical: "/" },
};

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#f6f8fa" },
        { media: "(prefers-color-scheme: dark)", color: "#0b1119" },
    ],
    width: "device-width",
    initialScale: 1,
};

/** Tema tercihini ilk boyamadan önce uygular (yanıp sönmeyi önler). */
const THEME_SCRIPT = `try{var t=localStorage.getItem('ecotube-theme');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

    return (
        <html lang="tr" className={`${inter.variable} ${mono.variable}`} suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
            </head>
            <body>
                <a href="#icerik" className="sr-only">İçeriğe geç</a>
                <Navbar />
                <main id="icerik">{children}</main>
                <Footer />

                {/* AdSense yalnızca yayıncı kimliği tanımlıysa yüklenir */}
                {adsenseClient && (
                    <Script
                        id="adsbygoogle"
                        async
                        strategy="afterInteractive"
                        crossOrigin="anonymous"
                        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
                    />
                )}

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "WebSite",
                            name: "ECOTUBE",
                            url: SITE_URL,
                            inLanguage: "tr-TR",
                            description:
                                "YouTube ekonomi yorumcularının videolarından yapay zeka ile çıkarılan yatırım sinyalleri.",
                        }),
                    }}
                />
            </body>
        </html>
    );
}
