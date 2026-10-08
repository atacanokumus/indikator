"use client";

import { useEffect, useState } from "react";
import { CONSENT_EVENT, CONSENT_KEY } from "@/lib/google";

/**
 * Ziyaretçi çerez onayı verdi mi? Onay öncesi (ve sunucuda) false döner;
 * böylece Google betikleri "önce onay, sonra çerez" sırasıyla yüklenir.
 */
export function useConsentGranted(): boolean {
    const [allowed, setAllowed] = useState(false);

    useEffect(() => {
        const read = () => {
            try { setAllowed(localStorage.getItem(CONSENT_KEY) === "kabul"); } catch { setAllowed(false); }
        };
        read();
        const onConsent = (e: Event) => setAllowed((e as CustomEvent).detail === "kabul");
        window.addEventListener(CONSENT_EVENT, onConsent);
        return () => window.removeEventListener(CONSENT_EVENT, onConsent);
    }, []);

    return allowed;
}
