"use client";

import { useSyncExternalStore } from "react";

type Mode = "light" | "dark";

/**
 * TEMA DUGMESI
 *
 * DUZELTILEN HATA: Bilesen render sirasinda window.matchMedia okuyordu.
 * Sunucuda window yok, tarayicida var; isletim sistemi koyu temadayken
 * sunucu "Koyu temaya geç", tarayici "Açık temaya geç" yaziyordu. Ikisi
 * aria-label ozniteligi oldugu icin metin karsilastirmasinda gorunmuyor ama
 * React hidrasyonu "Minified React error #418" ile patliyordu. Patlayinca
 * sayfadaki TUM istemci bilesenleri sessizce calismaz hale geliyordu —
 * somut sonucu Vercel Analytics betiginin sayfaya hic eklenmemesiydi.
 *
 * COZUM: Isletim sistemi tercihi de dis kaynaga tasindi. React hidrasyon
 * sirasinda ilk render icin getServerSnapshot'i kullanir; iki taraf ayni
 * degeri gorur, hidrasyondan hemen sonra gercek deger okunur.
 */
function subscribe(cb: () => void) {
    const obs = new MutationObserver(cb);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", cb);
    return () => {
        obs.disconnect();
        mq.removeEventListener("change", cb);
    };
}

function getSnapshot(): Mode {
    const attr = document.documentElement.dataset.theme;
    if (attr === "dark" || attr === "light") return attr;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Sunucu her zaman ayni degeri dondurur; hidrasyon bu deger uzerinden eslesir. */
function getServerSnapshot(): Mode {
    return "light";
}

export function ThemeToggle() {
    const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    const isDark = mode === "dark";

    const toggle = () => {
        document.documentElement.dataset.theme = isDark ? "light" : "dark";
        try {
            localStorage.setItem("and-theme", isDark ? "light" : "dark");
        } catch { /* gizli sekme */ }
    };

    return (
        <button
            onClick={toggle}
            className="chip"
            style={{ padding: "7px 9px" }}
            aria-label={isDark ? "Açık temaya geç" : "Koyu temaya geç"}
            title="Tema"
        >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
            </svg>
        </button>
    );
}
