"use client";

import Script from "next/script";
import { useConsentGranted } from "@/hooks/useConsent";

/**
 * Google Analytics 4. Çerez bıraktığı için AdSense gibi yalnızca ziyaretçi
 * çerez onayı verdikten SONRA yüklenir. Sayfa geçişlerini GA4'ün "gelişmiş
 * ölçüm" özelliği (history değişimi) kendisi izler; elle page_view gerekmez.
 *
 * (Vercel Analytics ayrı ve çerezsizdir; layout.tsx'te onaydan bağımsız çalışır.)
 */
export function GoogleAnalytics({ measurementId }: { measurementId: string }) {
    const allowed = useConsentGranted();
    if (!allowed) return null;

    return (
        <>
            <Script
                id="ga4-src"
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
            />
            <Script id="ga4-init" strategy="afterInteractive">
                {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${measurementId}');`}
            </Script>
        </>
    );
}
