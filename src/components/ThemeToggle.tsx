"use client";

import { useState, useSyncExternalStore } from "react";

type Mode = "light" | "dark";

/** Kök elementteki data-theme değerini okur (SSR uyumlu). */
function subscribe(cb: () => void) {
    const obs = new MutationObserver(cb);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
}

export function ThemeToggle() {
    const [, force] = useState(0);
    const current = useSyncExternalStore(
        subscribe,
        () => document.documentElement.dataset.theme ?? "",
        () => ""
    );

    const isDark =
        current === "dark" ||
        (current === "" &&
            typeof window !== "undefined" &&
            window.matchMedia?.("(prefers-color-scheme: dark)").matches);

    const toggle = () => {
        const next: Mode = isDark ? "light" : "dark";
        document.documentElement.dataset.theme = next;
        try { localStorage.setItem("and-theme", next); } catch { /* gizli sekme */ }
        force((n) => n + 1);
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
