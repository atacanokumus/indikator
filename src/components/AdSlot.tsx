"use client";

import { useEffect, useRef } from "react";

/**
 * Google AdSense reklam yuvası.
 *
 * Reklam kimliği tanımlı değilse HİÇBİR ŞEY göstermez — böylece site
 * onaylanmadan önce boş gri kutular görünmez (AdSense incelemesinde
 * "değersiz trafik/boş alan" olarak işaretlenmesini de önler).
 *
 * Kullanım: <AdSlot slot="1234567890" />
 * Reklam birimini AdSense panelinden oluşturup slot ID'sini buraya verin.
 */
export function AdSlot({
    slot,
    format = "auto",
    minHeight = 96,
    label = true,
}: {
    slot?: string;
    format?: string;
    minHeight?: number;
    label?: boolean;
}) {
    const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
    const ref = useRef<HTMLModElement>(null);
    const pushed = useRef(false);

    useEffect(() => {
        if (!client || !slot || pushed.current) return;
        pushed.current = true;
        try {
            const w = window as unknown as { adsbygoogle?: unknown[] };
            (w.adsbygoogle = w.adsbygoogle || []).push({});
        } catch { /* reklam engelleyici */ }
    }, [client, slot]);

    if (!client || !slot) return null;

    return (
        <div className="wrap ad-slot" style={{ minHeight, marginBlock: 24 }} aria-hidden="true">
            {label && <span className="ad-label sr-only">Reklam</span>}
            <ins
                ref={ref}
                className="adsbygoogle"
                style={{ display: "block", width: "100%" }}
                data-ad-client={client}
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive="true"
            />
        </div>
    );
}
