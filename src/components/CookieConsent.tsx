"use client";

import { useSyncExternalStore, useState } from "react";
import Link from "next/link";
import { CONSENT_EVENT, CONSENT_KEY, CONSENT_REQUIRED, ADSENSE_CLIENT, GA_MEASUREMENT_ID } from "@/lib/google";

/**
 * Çerez onay bandı.
 *
 * Yalnızca Google AdSense ya da Analytics yapılandırılmışsa görünür — hiçbiri
 * yokken çerez onayı istemek gereksiz sürtünmedir. Onay verilene kadar Google
 * betikleri yüklenmez (bkz. layout.tsx), böylece "önce onay, sonra çerez"
 * sırası korunur.
 */

function subscribe(cb: () => void) {
    window.addEventListener(CONSENT_EVENT, cb);
    return () => window.removeEventListener(CONSENT_EVENT, cb);
}

function readStored(): string {
    try { return localStorage.getItem(CONSENT_KEY) ?? ""; } catch { return "reddedildi"; }
}

export function CookieConsent() {
    const [, force] = useState(0);
    // Sunucuda "pending" döneriz ki bant ilk boyamada görünmesin ve
    // hidrasyon uyuşmazlığı olmasın.
    const decision = useSyncExternalStore(subscribe, readStored, () => "pending");

    const choose = (value: "kabul" | "reddedildi") => {
        try { localStorage.setItem(CONSENT_KEY, value); } catch { /* gizli sekme */ }
        window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
        force((n) => n + 1);
    };

    if (!CONSENT_REQUIRED) return null;
    if (decision !== "") return null; // karar verilmiş ya da henüz okunmamış

    const purpose =
        ADSENSE_CLIENT && GA_MEASUREMENT_ID ? "Reklamları göstermek ve ziyaretleri ölçmek" :
        ADSENSE_CLIENT ? "Reklamları göstermek" : "Ziyaretleri ölçmek";

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
                {purpose} için Google çerezleri kullanıyoruz. Reddederseniz site aynı şekilde çalışır;
                yalnızca zorunlu çerezler kullanılır.{" "}
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

/** Altbilgideki "Çerez tercihleri" bağlantısı: kararı siler, sayfayı yeniler, bant yeniden çıkar. */
export function CookieSettingsLink() {
    if (!CONSENT_REQUIRED) return null;
    return (
        <button
            type="button"
            className="small"
            style={{ background: "none", border: 0, padding: 0, cursor: "pointer", color: "inherit", textAlign: "left", font: "inherit" }}
            onClick={() => {
                try { localStorage.removeItem(CONSENT_KEY); } catch { /* yoksay */ }
                window.location.reload();
            }}
        >
            Çerez tercihleri
        </button>
    );
}
