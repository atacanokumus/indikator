"use client";

import { useSyncExternalStore, useState } from "react";
import Link from "next/link";

/**
 * Çerez onay bandı.
 *
 * Yalnızca AdSense yapılandırılmışsa görünür — reklam yokken çerez onayı
 * istemek gereksiz sürtünmedir. Onay verilene kadar reklam betiği yüklenmez
 * (bkz. layout.tsx), böylece "önce onay, sonra çerez" sırası korunur.
 */
const KEY = "and-cookie-consent";

function subscribe(cb: () => void) {
    window.addEventListener("and-consent", cb);
    return () => window.removeEventListener("and-consent", cb);
}

function readStored(): string {
    try { return localStorage.getItem(KEY) ?? ""; } catch { return "reddedildi"; }
}

export function CookieConsent() {
    const [, force] = useState(0);
    // Sunucuda "pending" döneriz ki bant ilk boyamada görünmesin ve
    // hidrasyon uyuşmazlığı olmasın.
    const decision = useSyncExternalStore(subscribe, readStored, () => "pending");

    const choose = (value: "kabul" | "reddedildi") => {
        try { localStorage.setItem(KEY, value); } catch { /* gizli sekme */ }
        window.dispatchEvent(new CustomEvent("and-consent", { detail: value }));
        force((n) => n + 1);
    };

    if (!process.env.NEXT_PUBLIC_ADSENSE_CLIENT) return null;
    if (decision !== "") return null; // karar verilmiş ya da henüz okunmamış

    return (
        <div
            role="dialog"
            aria-label="Çerez tercihi"
            style={{
                position: "fixed", insetInline: 12, bottom: 12, zIndex: 200,
                maxWidth: 620, marginInline: "auto",
                background: "var(--bg-elevated)", border: "1px solid var(--border-strong)",
                borderRadius: "var(--r-lg)", boxShadow: "var(--shadow-lg)",
                padding: 18,
            }}
        >
            <p className="small" style={{ margin: 0, color: "var(--text)" }}>
                Reklamları göstermek için çerez kullanıyoruz. Kişiselleştirilmiş reklamları
                reddederseniz site aynı şekilde çalışır, reklamlar ilgi alanınıza göre seçilmez.{" "}
                <Link href="/gizlilik">Ayrıntı</Link>
            </p>
            <div className="row gap-8 wrapflex" style={{ marginTop: 12 }}>
                <button className="btn btn-primary" style={{ padding: "9px 18px", fontSize: 14 }} onClick={() => choose("kabul")}>
                    Kabul et
                </button>
                <button className="btn btn-ghost" style={{ padding: "9px 18px", fontSize: 14 }} onClick={() => choose("reddedildi")}>
                    Sadece zorunlu çerezler
                </button>
            </div>
        </div>
    );
}
