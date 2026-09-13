"use client";

import { useState } from "react";
import type { AssetConsensus } from "@/lib/types";
import { assetLabel, formatPrice, relativeTime, signalClass, SIGNAL_LABEL, SIGNAL_SENTENCE } from "@/lib/display";

export function AssetCard({ item }: { item: AssetConsensus }) {
    const [open, setOpen] = useState(false);
    const price = formatPrice(item.price, item.currency);
    const total = Math.max(1, item.breakdown.AL + item.breakdown.SAT + item.breakdown.BEKLE);

    return (
        <article className="card card-hover" id={`varlik-${encodeURIComponent(item.asset)}`} style={{ scrollMarginTop: 80 }}>
            <div className="card-pad stack gap-12">
                <div className="between" style={{ alignItems: "flex-start" }}>
                    <div className="stack">
                        <h3 className="h3">{assetLabel(item.asset)}</h3>
                        {price ? (
                            <span className="mono" style={{ fontSize: 17, fontWeight: 700, marginTop: 2 }}>{price}</span>
                        ) : (
                            <span className="tiny">fiyat bilgisi yok</span>
                        )}
                    </div>
                    <span className={signalClass(item.recommendation)}>{SIGNAL_LABEL[item.recommendation]}</span>
                </div>

                <p className="small" style={{ margin: 0 }}>{SIGNAL_SENTENCE[item.recommendation]}</p>

                <div className="meter" aria-hidden="true">
                    {item.breakdown.AL > 0 && <i className="m-al" style={{ width: `${(item.breakdown.AL / total) * 100}%` }} />}
                    {item.breakdown.SAT > 0 && <i className="m-sat" style={{ width: `${(item.breakdown.SAT / total) * 100}%` }} />}
                    {item.breakdown.BEKLE > 0 && <i className="m-bekle" style={{ width: `${(item.breakdown.BEKLE / total) * 100}%` }} />}
                </div>

                <div className="row gap-6 wrapflex">
                    {item.breakdown.AL > 0 && <span className="sig sig-AL">{item.breakdown.AL} AL</span>}
                    {item.breakdown.SAT > 0 && <span className="sig sig-SAT">{item.breakdown.SAT} SAT</span>}
                    {item.breakdown.BEKLE > 0 && <span className="sig sig-TUT">{item.breakdown.BEKLE} BEKLE</span>}
                </div>
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
                <span className="tiny">Son sinyal: {relativeTime(item.latestSignalAt)}</span>
                <span className="small" style={{ color: "var(--brand)", fontWeight: 650 }}>
                    {open ? "Kapat" : `${item.analystCount} analist görüşü`} {open ? "▲" : "▼"}
                </span>
            </button>

            {open && (
                <div style={{ borderTop: "1px solid var(--border)", maxHeight: 380, overflowY: "auto" }}>
                    {item.signals.map((s, i) => (
                        <div
                            key={`${s.videoId}-${i}`}
                            className="row gap-12"
                            style={{
                                padding: "13px 20px", alignItems: "flex-start",
                                borderTop: i > 0 ? "1px solid var(--border)" : "none",
                            }}
                        >
                            {s.channelThumbnail ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={s.channelThumbnail} alt="" width={30} height={30} className="avatar" loading="lazy" />
                            ) : (
                                <span
                                    className="avatar row"
                                    style={{
                                        width: 30, height: 30, justifyContent: "center",
                                        color: "var(--brand)", fontWeight: 800, fontSize: 12,
                                    }}
                                >
                                    {s.channelTitle.charAt(0)}
                                </span>
                            )}

                            <div className="stack gap-4" style={{ flex: 1, minWidth: 0 }}>
                                <div className="between gap-8">
                                    <span className="small truncate" style={{ fontWeight: 700, color: "var(--text)" }}>
                                        {s.channelTitle}
                                    </span>
                                    <span className={signalClass(s.recommendation)} style={{ fontSize: 11, padding: "3px 8px" }}>
                                        {SIGNAL_LABEL[s.recommendation]}
                                    </span>
                                </div>
                                <p className="small clamp-3" style={{ margin: 0 }}>{s.reasoning}</p>
                                <div className="row gap-8 wrapflex">
                                    <span className="tiny">{relativeTime(s.date)}</span>
                                    <a
                                        className="tiny"
                                        style={{ color: "var(--brand)", fontWeight: 650 }}
                                        href={`https://www.youtube.com/watch?v=${s.videoId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Videoyu izle →
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </article>
    );
}
