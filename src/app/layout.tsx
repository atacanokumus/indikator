import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CookieConsent } from "@/components/CookieConsent";
import { AdsenseLoader } from "@/components/AdsenseLoader";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { JsonLd } from "@/components/JsonLd";
import { ADSENSE_CLIENT, GA_MEASUREMENT_ID } from "@/lib/google";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, organizationLd, websiteLd } from "@/lib/seo";
import "../styles/site.css";

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: "Analist Ne Diyor: Altın, Dolar, Borsa ve Bitcoin Yorumları",
        template: "%s | Analist Ne Diyor",
    },
    // NOT: Açıklamada emir kipi kullanılmıyor. Site tavsiye vermez, sayım yapar;
    // mağaza vitrinindeki cümlenin de sayfadaki duruşla aynı olması gerekiyor.
    description: SITE_DESCRIPTION,
    applicationName: SITE_NAME,
    keywords: [
        "ekonomist yorumları", "altın yorumları", "dolar yorumları", "analist ne diyor",
        "bist 100 yorumları", "bitcoin yorumları", "youtube ekonomist", "piyasa konsensüsü",
        "analist isabet oranı",
    ],
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: "finance",
    formatDetection: { telephone: false, email: false, address: false },
    /**
     * DİKKAT — burada `alternates.canonical` ve `openGraph.url` YOK.
     * Next.js'te sayfanın kendi `alternates` / `openGraph` alanı bunları
     * tamamen ezer; kökte bırakılan canonical, kendi canonical'ını tanımlamayı
     * unutan her sayfayı ana sayfaya kanonikleştirir. Sayfalar bunları
     * src/lib/seo.ts içindeki pageMetadata() ile alır.
     */
    openGraph: {
        type: "website",
        locale: "tr_TR",
        siteName: SITE_NAME,
        title: "Analist Ne Diyor: Altın, Dolar, Borsa ve Bitcoin Yorumları",
        description: SITE_DESCRIPTION,
    },
    twitter: {
        card: "summary_large_image",
        title: "Analist Ne Diyor: kim ne diyor, sayımı burada",
        description: SITE_DESCRIPTION,
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
    /**
     * Arama konsolu doğrulamaları. Kodlar ortam değişkeninden gelir; koda
     * gömülmez ki farklı ortamlarda farklı mülkler doğrulanabilsin.
     * Tanımlı olmayan etiket hiç basılmaz.
     */
    verification: {
        google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
        yandex: process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION || undefined,
        other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
            ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
            : undefined,
    },
    /**
     * AdSense site sahipliği: bu etiket çerez bırakmaz, onaydan bağımsız basılır.
     * AdSense tarayıcı botu çerez onayı vermediği için reklam betiğini
     * göremez; siteyi hesaba bağlamak için bu etiketi okur.
     */
    other: ADSENSE_CLIENT ? { "google-adsense-account": ADSENSE_CLIENT } : undefined,
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
                  Ziyaretci olcumu. Vercel Analytics CEREZ KULLANMAZ ve kisiyi
                  tanimlayan bir kimlik saklamaz; bu yuzden onay bandinin
                  arkasinda beklemesi gerekmiyor ve KVKK acisindan reklam
                  betiginden farkli bir konumda. Google Analytics ise cerez koydugu
                  icin asagida yalnizca onaydan sonra yuklenir.
                */}
                <Analytics />
                <SpeedInsights />

                {/*
                  AdSense yalnızca (1) yayıncı kimliği tanımlıysa ve (2) ziyaretçi
                  çerez onayı verdiyse yüklenir. Onay öncesi hiçbir reklam betiği
                  çalışmaz — KVKK ve AB kullanıcıları için gerekli sıra budur.
                */}
                {ADSENSE_CLIENT && <AdsenseLoader client={ADSENSE_CLIENT} />}

                {/* Google Analytics 4: ölçüm kimliği tanımlıysa ve onay verildiyse yüklenir. */}
                {GA_MEASUREMENT_ID && <GoogleAnalytics measurementId={GA_MEASUREMENT_ID} />}

                {/*
                  Yapılandırılmış veri. Arama motorları ve yapay zeka asistanları
                  siteyi burayı okuyarak tarif ediyor; bu yüzden buradaki cümle
                  sayfalardaki duruşla birebir aynı olmak zorunda. Eskiden burada
                  "yapay zeka ile çıkarılan yatırım sinyalleri" yazıyordu — sayfalardan
                  temizlediğimiz tavsiye dili en çok alıntılanan yerde kalmıştı.
                */}
                <JsonLd data={[websiteLd(), organizationLd()]} />
            </body>
        </html>
    );
}
