import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "../styles/site.css";

import { BackgroundDecoration } from "@/components/BackgroundDecoration";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "ECOTUBE – Ekonomistler Ne Diyor?",
  description: "YouTube ekonomistlerinin sinyallerini yapay zeka ile analiz eden platform. AL, SAT, BEKLE sinyallerini tek merkezden takip edin.",
  keywords: "ekonomist, borsa, altın, dolar, bitcoin, sinyal, al, sat, yatırım, analiz",
  icons: {
    icon: '/logo-main.png',
    apple: '/logo-main.png',
  },
  openGraph: {
    title: "ECOTUBE – Ekonomistler Ne Diyor?",
    description: "YouTube ekonomistlerinin sinyallerini yapay zeka ile analiz eden platform.",
    type: "website",
    images: ['/logo-main.png'],
  },
};

import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        {/* Google AdSense Structure (Replace client id with actual publisher id when ready) */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7838551368632112"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body suppressHydrationWarning>
        <BackgroundDecoration />
        {children}
      </body>
    </html>
  );
}
