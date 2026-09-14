import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CookieConsent } from "@/components/CookieConsent";
import { AdsenseLoader } from "@/components/AdsenseLoader";
import "../styles/site.css";

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://analistnediyor.com";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: "Analist Ne Diyor — altın, dolar, borsa ve kriptoda kim ne diyor",
        template: "%s | Analist Ne Diyor",
    },
    // NOT: Açıklamada emir kipi kullanılmıyor. Site tavsiye vermez, sayım yapar;
    // mağaza vitrinindeki cümlenin de sayfadaki duruşla aynı olması gerekiyor.
    description:
        "YouTube ekonomi yorumcularının son videolarındaki görüşleri derliyoruz. " +
        "Altın, dolar, BIST 100 ve kripto için hangi yönde kaç analistin konuştuğunu " +
        "tek ekranda görün; geçmiş görüşlerin tutup tutmadığını isabet karnesinden izleyin.",
    applicationName: "Analist Ne Diyor",
    keywords: [
        "ekonomist yorumları", "altın yorumu", "dolar yorumu", "analist ne diyor",
        "bist 100", "bitcoin analiz", "youtube ekonomist", "piyasa konsensüsü",
        "analist isabet oranı",
    ],
    authors: [{ name: "Analist Ne Diyor" }],
    openGraph: {
        type: "website",
        locale: "tr_TR",
        url: SITE_URL,
        siteName: "Analist Ne Diyor",
        title: "Analist Ne Diyor — altın, dolar, borsa ve kriptoda kim ne diyor",
        description:
            "Takip edilen ekonomi yorumcularının görüşlerinin varlık bazında sayımı ve " +
            "geçmiş görüşlerin isabet karnesi.",
    },
    twitter: {
        card: "summary_large_image",
        title: "Analist Ne Diyor — kim ne diyor, sayımı burada",
        description: "YouTube ekonomi yorumcularının görüşlerinin sayımı ve isabet karnesi.",
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
const THEME_SCRIPT = `try{var t=localStorage.getItem('and-theme');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t}catch(e){}`;

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
                <CookieConsent />

                {/*
                  AdSense yalnızca (1) yayıncı kimliği tanımlıysa ve (2) ziyaretçi
                  çerez onayı verdiyse yüklenir. Onay öncesi hiçbir reklam betiği
                  çalışmaz — KVKK ve AB kullanıcıları için gerekli sıra budur.
                */}
                {adsenseClient && <AdsenseLoader client={adsenseClient} />}

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "WebSite",
                            name: "Analist Ne Diyor",
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
