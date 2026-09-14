"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const KEY = "ecotube-cookie-consent";

/**
 * Reklam betiğini yalnızca ziyaretçi çerez onayı verdikten SONRA yükler.
 * Onay yoksa sayfada hiçbir Google betiği çalışmaz.
 */
export function AdsenseLoader({ client }: { client: string }) {
    const [allowed, setAllowed] = useState(false);

    useEffect(() => {
        const read = () => {
            try { setAllowed(localStorage.getItem(KEY) === "kabul"); } catch { setAllowed(false); }
        };
        read();
        const onConsent = (e: Event) => setAllowed((e as CustomEvent).detail === "kabul");
        window.addEventListener("ecotube-consent", onConsent);
        return () => window.removeEventListener("ecotube-consent", onConsent);
    }, []);

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
