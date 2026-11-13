"use client";

import { RelativeTime } from "@/components/RelativeTime";
import { useState } from "react";
import Link from "next/link";
import type { AnalystSignal, AssetConsensus } from "@/lib/types";
import {
    assetLabel,
    DIRECTION,
    DIRECTION_PHRASE,
    formatDateTr,
    formatPrice,
} from "@/lib/display";
import { analystPath } from "@/lib/analyst";
import { assetSlug } from "@/lib/slug";
import { TallyBar, TallyHeadline, TallyLegend } from "./Tally";
import { ReportButton } from "./ReportButton";
import { RegionBadge, RegionSplit } from "./RegionSplit";

export function AssetCard({ item }: { item: AssetConsensus }) {
    const [open, setOpen] = useState(false);
    const price = formatPrice(item.price, item.currency);

    return (
        <article className="card card-hover" id={`varlik-${assetSlug(item.asset)}`} style={{ scrollMarginTop: 80 }}>
            <div className="card-pad stack gap-12">
                <div className="between" style={{ alignItems: "flex-start" }}>
                    <h3 className="h3">
                        <Link href={`/varlik/${assetSlug(item.asset)}`} style={{ textDecoration: "none" }}>
                            {assetLabel(item.asset)}
                        </Link>
                    </h3>
                    <div className="stack" style={{ alignItems: "flex-end" }}>
                        {price ? (
                            <span className="mono" style={{ fontSize: 15, fontWeight: 700 }}>{price}</span>
                        ) : (
                            <span className="tiny">fiyat yok</span>
                        )}
                        {/* Tebliğ m.78/2-b: fiyatın alındığı an açıkça belirtilmeli */}
                        {item.priceAt && <RelativeTime iso={item.priceAt} className="tiny" />}
                    </div>
                </div>

                <TallyHeadline
                    leading={item.leading}
                    leadingCount={item.leadingCount}
                    total={item.analystCount}
                />

                <TallyBar tally={item.tally} total={item.analystCount} />

                <TallyLegend tally={item.tally} />

                <RegionSplit split={item.regionSplit} />

                {/* Tebliğ m.78/2-c: son 12 ayda görüşünü değiştirenler */}
                {item.changedCount > 0 && (
                    <span className="tiny">
                        Son 12 ayda {item.changedCount} analist bu varlıkta görüşünü değiştirdi.
                    </span>
                )}
            </div>

            <hr className="divider" />

            <button
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className="between"
                style={{
                    width: "100%", padding: "11px 20px", background: "none", border: 0,
                    cursor: "pointer", color: "inherit", font: "inherit",
                }}
            >
                <span className="tiny">Son görüş: <RelativeTime iso={item.latestSignalAt} /></span>
                <span className="small" style={{ color: "var(--brand)", fontWeight: 650 }}>
                    {open ? "Kapat ▲" : `Kim ne dedi (${item.analystCount}) ▼`}
                </span>
            </button>

            {open && (
                <div style={{ borderTop: "1px solid var(--border)", maxHeight: 420, overflowY: "auto" }}>
                    <AiNote style={{ padding: "10px 20px 0" }} />
                    {item.signals.map((s, i) => (
                        <SignalRow key={`${s.videoId}-${i}`} signal={s} asset={item.asset} first={i === 0} />
                    ))}
                </div>
            )}
        </article>
    );
}

export function SignalRow({
    signal: s,
    asset,
    first,
}: {
    signal: AnalystSignal;
    asset: string;
    first: boolean;
}) {
    return (
        <div
            className="row gap-12"
            style={{
                padding: "14px 20px", alignItems: "flex-start",
                borderTop: first ? "none" : "1px solid var(--border)",
            }}
        >
            <ChannelAvatar title={s.channelTitle} src={s.channelThumbnail} />

            <div className="stack gap-6" style={{ flex: 1, minWidth: 0 }}>
                <div className="between gap-8">
                    <span className="small truncate row gap-6" style={{ fontWeight: 700, color: "var(--text)" }}>
                        <RegionBadge region={s.region} />
                        <Link href={analystPath(s.channelTitle)} style={{ color: "inherit", textDecoration: "none" }}>
                            {s.channelTitle}
                        </Link>
                    </span>
                    <span className={`dir-chip chip-${s.recommendation}`}>{DIRECTION[s.recommendation]}</span>
                </div>

                {/*
                  Emir kipi yok: analistin ne yaptığı anlatılıyor. Kanal adı üst satırda
                  zaten yazdığı için cümle özneyi tekrar etmez.
                */}
                <p className="small clamp-3" style={{ margin: 0, color: "var(--text-soft)" }}>
                    <strong style={{ color: "var(--text)" }}>{capitalizeTr(DIRECTION_PHRASE[s.recommendation])}.</strong>{" "}
                    {s.reasoning}
                </p>

                {/* Tebliğ m.78/2-c: aynı analistin önceki görüşü */}
                {s.previous && (
                    <span className="prev-note">
                        Önceki görüşü: <s>{DIRECTION[s.previous.recommendation]}</s> ({formatDateTr(s.previous.date)})
                    </span>
                )}

                <div className="row gap-12 wrapflex" style={{ marginTop: 2 }}>
                    <span className="tiny">{formatDateTr(s.date)}</span>
                    <a
                        className="tiny"
                        style={{ color: "var(--brand)", fontWeight: 650 }}
                        href={`https://www.youtube.com/watch?v=${s.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Videoda dinle →
                    </a>
                    <ReportButton videoId={s.videoId} asset={asset} channelTitle={s.channelTitle} />
                </div>

            </div>
        </div>
    );
}

function capitalizeTr(text: string): string {
    return text.charAt(0).toLocaleUpperCase("tr") + text.slice(1);
}

/**
 * Yapay zeka uyarısı. Eskiden HER görüş satırının altında yazıyordu; on dört
 * satırlık listede on dört kez. Artık listenin başında bir kez durur: uyarı
 * görünür kalır, liste kısalır.
 */
export function AiNote({ style }: { style?: React.CSSProperties }) {
    return (
        <span className="ai-note" style={style}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" />
            </svg>
            Özetler yapay zeka ile çıkarılır, hata içerebilir; kaynağı videodan teyit edin.
        </span>
    );
}

/** Kanal görseli; yoksa baş harfler ve kanala özgü sabit bir renk. */
const AVATAR_COLORS = ["#0d6b7f", "#7c5cc4", "#b4570f", "#2f7d4f", "#b03a5b", "#3b63c4", "#8a6d1f", "#5b6b7d"];

export function ChannelAvatar({ title, src, size = 34 }: { title: string; src?: string; size?: number }) {
    if (src) {
        // eslint-disable-next-line @next/next/no-img-element
        return <img src={src} alt="" width={size} height={size} className="avatar" loading="lazy" />;
    }
    const words = title.replace(/[^\p{L}\p{N} ]/gu, " ").split(/\s+/).filter(Boolean);
    const initials = ((words[0]?.[0] ?? "") + (words[1]?.[0] ?? "")).toLocaleUpperCase("tr") || "?";
    let hash = 0;
    for (const ch of title) hash = (hash * 31 + ch.codePointAt(0)!) >>> 0;
    return (
        <span
            className="avatar-initials"
            style={{ width: size, height: size, background: AVATAR_COLORS[hash % AVATAR_COLORS.length] }}
            aria-hidden="true"
        >
            {initials}
        </span>
    );
}
