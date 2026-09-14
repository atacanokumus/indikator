"use client";

import { useState } from "react";
import Link from "next/link";
import type { AnalystSignal, AssetConsensus } from "@/lib/types";
import {
    assetLabel,
    DIRECTION,
    DIRECTION_PHRASE,
    formatDateTr,
    formatPrice,
    relativeTime,
} from "@/lib/display";
import { assetSlug } from "@/lib/slug";
import { TallyBar, TallyHeadline, TallySentence } from "./Tally";
import { ReportButton } from "./ReportButton";

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
                        {item.priceAt && <span className="tiny">{relativeTime(item.priceAt)}</span>}
                    </div>
                </div>

                <TallyHeadline
                    leading={item.leading}
                    leadingCount={item.leadingCount}
                    total={item.analystCount}
                />

                <TallyBar tally={item.tally} total={item.analystCount} />

                <TallySentence tally={item.tally} total={item.analystCount} size="sm" />

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
                <span className="tiny">Son görüş: {relativeTime(item.latestSignalAt)}</span>
                <span className="small" style={{ color: "var(--brand)", fontWeight: 650 }}>
                    {open ? "Kapat ▲" : `Kim ne dedi (${item.analystCount}) ▼`}
                </span>
            </button>

            {open && (
                <div style={{ borderTop: "1px solid var(--border)", maxHeight: 420, overflowY: "auto" }}>
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
            {s.channelThumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.channelThumbnail} alt="" width={32} height={32} className="avatar" loading="lazy" />
            ) : (
                <span
                    className="avatar row"
                    style={{ width: 32, height: 32, justifyContent: "center", color: "var(--brand)", fontWeight: 800, fontSize: 13 }}
                >
                    {s.channelTitle.charAt(0)}
                </span>
            )}

            <div className="stack gap-6" style={{ flex: 1, minWidth: 0 }}>
                <div className="between gap-8">
                    <span className="small truncate" style={{ fontWeight: 700, color: "var(--text)" }}>
                        {s.channelTitle}
                    </span>
                    <span className={`dir-chip chip-${s.recommendation}`}>{DIRECTION[s.recommendation]}</span>
                </div>

                {/* Emir kipi yok: analistin ne yaptığı anlatılıyor */}
                <p className="small" style={{ margin: 0 }}>
                    <strong style={{ color: "var(--text)" }}>{s.channelTitle}</strong>{" "}
                    {DIRECTION_PHRASE[s.recommendation]}.
                </p>

                <p className="small clamp-3" style={{ margin: 0, color: "var(--text-soft)" }}>
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

                <span className="ai-note">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" />
                    </svg>
                    Yapay zeka özeti — hata içerebilir, videodan teyit edin
                </span>
            </div>
        </div>
    );
}
