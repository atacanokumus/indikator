"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";

export const HERO_SEARCH_EVENT = "and-hero-search";

/**
 * Giriş bölümündeki arama. Ziyaretçinin ilk sorusu "şu varlık için ne diyorlar?";
 * arama eskiden dört büyük kartın altındaydı.
 *
 * Yazılan ad bir varlıkla birebir eşleşiyorsa doğrudan o varlığın sayfasına gider.
 * Eşleşmiyorsa aşağıdaki "Tüm varlıklar" listesini süzer ve oraya kaydırır
 * (SignalExplorer bu olayı dinler).
 */
export function HeroSearch({ options }: { options: { label: string; slug: string }[] }) {
    const [q, setQ] = useState("");
    const router = useRouter();
    const listId = useId();

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const text = q.trim().toLocaleLowerCase("tr");
        if (!text) return;
        const exact = options.find((o) => o.label.toLocaleLowerCase("tr") === text);
        if (exact) {
            router.push(`/varlik/${exact.slug}`);
            return;
        }
        window.dispatchEvent(new CustomEvent(HERO_SEARCH_EVENT, { detail: q.trim() }));
        document.getElementById("tum-sinyaller")?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <form className="hero-search" role="search" onSubmit={submit}>
            <svg
                width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)"
                strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"
                style={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)" }}
            >
                <circle cx="11" cy="11" r="7" /><path d="m20 20-3.6-3.6" />
            </svg>
            <input
                className="input"
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                list={listId}
                placeholder="Varlık ara: altın, dolar, Bitcoin…"
                aria-label="Varlık ara"
                autoComplete="off"
            />
            <datalist id={listId}>
                {options.map((o) => <option key={o.slug} value={o.label} />)}
            </datalist>
            <button type="submit">Ara</button>
        </form>
    );
}
