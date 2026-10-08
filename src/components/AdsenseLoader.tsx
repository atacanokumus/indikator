"use client";

import Script from "next/script";
import { useConsentGranted } from "@/hooks/useConsent";

/**
 * Reklam betiğini yalnızca ziyaretçi çerez onayı verdikten SONRA yükler.
 * Onay yoksa sayfada hiçbir Google betiği çalışmaz.
 *
 * Bu betik AdSense panelinde "Otomatik reklamlar" açıksa reklamları sayfaya
 * kendisi yerleştirir (ayrıca slot kimliği gerekmez); AdSlot yuvaları ise
 * elle yerleştirilen birimlerdir.
 */
export function AdsenseLoader({ client }: { client: string }) {
    const allowed = useConsentGranted();
    if (!allowed) return null;

    return (
        <Script
            id="adsbygoogle"
            async
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
        />
    );
}
