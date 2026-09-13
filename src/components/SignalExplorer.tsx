"use client";

import { useMemo, useState } from "react";
import type { AssetConsensus } from "@/lib/types";
import { assetLabel } from "@/lib/display";
import { AssetCard } from "./AssetCard";
import { AdSlot } from "./AdSlot";

type Filter = "ALL" | "AL" | "SAT" | "BEKLE";
type Sort = "POPULAR" | "RECENT" | "AZ";

const FILTERS: { key: Filter; label: string }[] = [
    { key: "ALL", label: "Tümü" },
    { key: "AL", label: "AL" },
    { key: "SAT", label: "SAT" },
    { key: "BEKLE", label: "Bekle" },
];

export function SignalExplorer({ items }: { items: AssetConsensus[] }) {
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState<Filter>("ALL");
    const [sort, setSort] = useState<Sort>("POPULAR");
    const [limit, setLimit] = useState(18);

    const filtered = useMemo(() => {
        const q = query.trim().toLocaleLowerCase("tr");
        let out = items.filter((it) => {
            if (q && !`${it.asset} ${assetLabel(it.asset)}`.toLocaleLowerCase("tr").includes(q)) return false;
            if (filter === "ALL") return true;
            if (filter === "BEKLE") return it.recommendation === "TUT" || it.recommendation === "GÖZLEMLE";
            return it.recommendation === filter;
        });

        out = [...out];
        if (sort === "AZ") out.sort((a, b) => assetLabel(a.asset).localeCompare(assetLabel(b.asset), "tr"));
        else if (sort === "RECENT") out.sort((a, b) => b.latestSignalAt.localeCompare(a.latestSignalAt));
        else out.sort((a, b) => b.analystCount - a.analystCount || b.latestSignalAt.localeCompare(a.latestSignalAt));

        return out;
    }, [items, query, filter, sort]);

    const visible = filtered.slice(0, limit);

    return (
        <div className="stack gap-16">
            {/* Arama + filtreler */}
            <div className="between wrapflex gap-12">
                <div style={{ position: "relative", flex: "1 1 280px", minWidth: 0 }}>
                    <svg
                        width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)"
                        strokeWidth="2.2" strokeLinecap="round"
                        style={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)" }}
                        aria-hidden="true"
                    >
                        <circle cx="11" cy="11" r="7" /><path d="m20 20-3.6-3.6" />
                    </svg>
                    <input
                        className="input"
                        type="search"
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setLimit(18); }}
                        placeholder="Varlık ara: altın, dolar, bitcoin, THYAO…"
                        aria-label="Varlık ara"
                    />
                </div>

                <div className="row gap-6 wrapflex">
                    {FILTERS.map((f) => (
                        <button
                            key={f.key}
                            className="chip"
                            aria-pressed={filter === f.key}
                            onClick={() => { setFilter(f.key); setLimit(18); }}
                        >
                            {f.label}
                        </button>
                    ))}
                    <select
                        className="chip"
                        value={sort}
                        onChange={(e) => setSort(e.target.value as Sort)}
                        aria-label="Sıralama"
                        style={{ appearance: "none", paddingRight: 14 }}
                    >
                        <option value="POPULAR">En çok konuşulan</option>
                        <option value="RECENT">En güncel</option>
                        <option value="AZ">A → Z</option>
                    </select>
                </div>
            </div>

            <p className="tiny" style={{ margin: 0 }} aria-live="polite">
                {filtered.length} varlık listeleniyor
            </p>

            {/* Kartlar */}
            {visible.length > 0 ? (
                <>
                    <div className="grid-cards">
                        {visible.slice(0, 6).map((item) => <AssetCard key={item.asset} item={item} />)}
                    </div>

                    {visible.length > 6 && (
                        <>
                            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_INFEED} minHeight={120} />
                            <div className="grid-cards">
                                {visible.slice(6).map((item) => <AssetCard key={item.asset} item={item} />)}
                            </div>
                        </>
                    )}

                    {filtered.length > visible.length && (
                        <button className="btn btn-ghost" style={{ alignSelf: "center" }} onClick={() => setLimit((l) => l + 24)}>
                            Daha fazla göster ({filtered.length - visible.length})
                        </button>
                    )}
                </>
            ) : (
                <div className="card card-pad stack gap-8" style={{ textAlign: "center", paddingBlock: 48 }}>
                    <strong>Eşleşen varlık bulunamadı</strong>
                    <span className="small">Farklı bir arama terimi ya da filtre deneyin.</span>
                </div>
            )}
        </div>
    );
}
