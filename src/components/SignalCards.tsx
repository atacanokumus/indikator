"use client";

import { useState, useMemo } from "react";
import { VideoAnalysis } from "@/lib/firestore";
import { normalizeAsset } from "@/lib/asset-utils";
import { formatDate } from "@/lib/utils";

interface SignalCardsProps {
    data: VideoAnalysis[];
    prices?: Record<string, { price: number; currency: string }>;
    news?: any[];
}

interface SignalPoint {
    recommendation: "AL" | "SAT" | "TUT" | "GÖZLEMLE";
    date: string;
    videoId: string;
    videoTitle: string;
    reasoning: string;
    channelTitle: string;
    channelThumbnail?: string;
    asset?: string;
}

const RECOMMENDATION_SCORE: Record<string, number> = {
    AL: 1,
    SAT: -1,
    TUT: 0,
    GÖZLEMLE: 0,
};

const signalConfig: Record<string, { label: string; className: string; emoji: string }> = {
    AL: { label: "AL", className: "signal-al", emoji: "📈" },
    SAT: { label: "SAT", className: "signal-sat", emoji: "📉" },
    TUT: { label: "BEKLE", className: "signal-bekle", emoji: "⏸️" },
    GÖZLEMLE: { label: "GÖZLEMLE", className: "signal-gozlemle", emoji: "🔍" },
};

export const SignalCards = ({ data, prices, news }: SignalCardsProps) => {
    const [viewMode, setViewMode] = useState<"ASSET" | "ANALYST">("ASSET");
    const [sortBy, setSortBy] = useState<string>("DEFAULT");
    const [searchQuery, setSearchQuery] = useState("");
    const [filterSignal, setFilterSignal] = useState<string>("ALL");
    const [expandedCard, setExpandedCard] = useState<string | null>(null);

    const groups = useMemo(() => {
        let result = [];
        if (viewMode === "ASSET") {
            const rawGroups = data.reduce(
                (acc, video) => {
                    video.results.forEach((res) => {
                        const normalizedAsset = normalizeAsset(res.asset);
                        const groupKey = normalizedAsset;

                        if (!acc[groupKey]) {
                            acc[groupKey] = {
                                name: groupKey,
                                originalName: res.asset,
                                signals: [],
                                latestDate: video.publishedAt,
                            };
                        }

                        acc[groupKey].signals.push({
                            recommendation: res.recommendation,
                            date: video.publishedAt,
                            videoId: video.videoId,
                            videoTitle: video.videoTitle,
                            reasoning: res.reasoning,
                            channelTitle: video.channelTitle,
                            channelThumbnail: video.channelThumbnail,
                        });

                        if (new Date(video.publishedAt) > new Date(acc[groupKey].latestDate)) {
                            acc[groupKey].latestDate = video.publishedAt;
                        }
                    });
                    return acc;
                },
                {} as Record<
                    string,
                    { name: string; originalName: string; signals: SignalPoint[]; latestDate: string }
                >
            );
            result = Object.values(rawGroups);

            if (sortBy === "AZ") {
                result.sort((a, b) => a.name.localeCompare(b.name, "tr"));
            } else if (sortBy === "POPULAR") {
                result.sort((a, b) => b.signals.length - a.signals.length);
            } else {
                result.sort((a, b) => new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime());
            }
        } else {
            // ANALYST View
            const rawGroups = data.reduce(
                (acc, video) => {
                    const groupKey = video.channelTitle;

                    if (!acc[groupKey]) {
                        acc[groupKey] = {
                            name: groupKey,
                            originalName: groupKey,
                            signals: [],
                            latestDate: video.publishedAt,
                            channelThumbnail: video.channelThumbnail
                        };
                    }

                    video.results.forEach((res) => {
                        acc[groupKey].signals.push({
                            recommendation: res.recommendation,
                            date: video.publishedAt,
                            videoId: video.videoId,
                            videoTitle: video.videoTitle,
                            reasoning: res.reasoning,
                            channelTitle: video.channelTitle,
                            channelThumbnail: video.channelThumbnail,
                            asset: res.asset
                        });
                    });

                    if (new Date(video.publishedAt) > new Date(acc[groupKey].latestDate)) {
                        acc[groupKey].latestDate = video.publishedAt;
                    }
                    return acc;
                },
                {} as Record<
                    string,
                    { name: string; originalName: string; signals: (SignalPoint & { asset?: string })[]; latestDate: string; channelThumbnail?: string }
                >
            );
            result = Object.values(rawGroups);

            if (sortBy === "AZ") {
                result.sort((a, b) => a.name.localeCompare(b.name, "tr"));
            } else {
                result.sort((a, b) => new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime());
            }
        }
        return result;
    }, [data, viewMode, sortBy]);

    const consensusMap = useMemo(() => {
        const map: Record<string, { recommendation: string; score: number; breakdown: Record<string, number> }> = {};
        groups.forEach((group) => {
            let totalScore = 0;
            let totalWeight = 0;
            const breakdown: Record<string, number> = { AL: 0, SAT: 0, TUT: 0, GÖZLEMLE: 0 };

            // Her analist için sadece en son sinyali al (aynı varlık için çakışma önleme)
            const latestPerAnalyst = new Map<string, SignalPoint>();
            group.signals.forEach((sig) => {
                const existing = latestPerAnalyst.get(sig.channelTitle);
                if (!existing || new Date(sig.date) > new Date(existing.date)) {
                    latestPerAnalyst.set(sig.channelTitle, sig);
                }
            });

            latestPerAnalyst.forEach((sig) => {
                const score = RECOMMENDATION_SCORE[sig.recommendation];

                // 7 günlük pencerede ağırlık
                const daysOld = (Date.now() - new Date(sig.date).getTime()) / (1000 * 60 * 60 * 24);
                let weight = 1.0;
                if (daysOld > 5) weight = 0.7;
                else if (daysOld > 3) weight = 0.85;

                if (score !== undefined) {
                    totalScore += (score * weight);
                    totalWeight += weight;
                }
                breakdown[sig.recommendation] = (breakdown[sig.recommendation] || 0) + 1;
            });

            const avgScore = totalWeight > 0 ? totalScore / totalWeight : 0;
            let recommendation = "TUT";
            if (avgScore > 0.3) recommendation = "AL";
            else if (avgScore < -0.3) recommendation = "SAT";

            map[group.name] = { recommendation, score: avgScore, breakdown };
        });
        return map;
    }, [groups]);

    const filteredGroups = useMemo(() => {
        return groups.filter((g) => {
            const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase());

            if (!matchesSearch) return false;

            if (filterSignal !== "ALL") {
                const consensus = consensusMap[g.name];
                const rec = consensus?.recommendation;
                if (filterSignal === "BEKLE") {
                    if (rec !== "TUT" && rec !== "GÖZLEMLE") return false;
                } else {
                    if (rec !== filterSignal) return false;
                }
            }

            return true;
        });
    }, [groups, searchQuery, filterSignal, consensusMap]);

    return (
        <div>
            {/* Search and Filters */}
            <div style={{
                marginBottom: 48,
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                width: "100%"
            }}>
                <div style={{
                    position: "relative",
                    width: "100%",
                    maxWidth: 800
                }}>
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--text-muted)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", opacity: 0.7 }}
                    >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        placeholder={viewMode === "ASSET" ? "Varlık ara... (Altın, BTC, THYAO...)" : "Yorumcu ara... (Atilla Yeşilada, Devrim Akyıl...)"}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "20px 24px 20px 60px",
                            borderRadius: 20,
                            border: "2px solid var(--border)",
                            background: "var(--bg-surface)",
                            fontSize: 18,
                            fontWeight: 600,
                            color: "var(--text-primary)",
                            outline: "none",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = "var(--brand-teal)";
                            e.target.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
                            e.target.style.transform = "translateY(-2px)";
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = "var(--border)";
                            e.target.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)";
                            e.target.style.transform = "translateY(0)";
                        }}
                    />
                </div>

                <div style={{
                    display: "flex",
                    gap: 16,
                    alignItems: "center",
                    marginBottom: 12,
                    padding: "6px",
                    background: "rgba(0,0,0,0.04)",
                    borderRadius: 18,
                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)"
                }}>
                    <button
                        onClick={() => { setViewMode("ASSET"); setSortBy("DEFAULT"); }}
                        style={{
                            padding: "12px 32px",
                            borderRadius: 14,
                            border: "none",
                            background: viewMode === "ASSET" ? "var(--brand-teal)" : "transparent",
                            color: viewMode === "ASSET" ? "white" : "var(--text-secondary)",
                            fontWeight: 800,
                            fontSize: 15,
                            cursor: "pointer",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            boxShadow: viewMode === "ASSET" ? "0 4px 12px rgba(20, 184, 166, 0.3)" : "none",
                        }}>
                        🏠 Varlık Bazlı
                    </button>
                    <button
                        onClick={() => { setViewMode("ANALYST"); setSortBy("DEFAULT"); }}
                        style={{
                            padding: "12px 32px",
                            borderRadius: 14,
                            border: "none",
                            background: viewMode === "ANALYST" ? "var(--brand-teal)" : "transparent",
                            color: viewMode === "ANALYST" ? "white" : "var(--text-secondary)",
                            fontWeight: 800,
                            fontSize: 15,
                            cursor: "pointer",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            boxShadow: viewMode === "ANALYST" ? "0 4px 12px rgba(20, 184, 166, 0.3)" : "none",
                        }}>
                        👤 Yorumcu Bazlı
                    </button>
                </div>

                <div style={{
                    display: "flex",
                    gap: 24,
                    alignItems: "center",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    width: "100%"
                }}>
                    {/* Sort Selector */}
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "6px 16px",
                        background: "var(--bg-surface)",
                        borderRadius: 12,
                        border: "1px solid var(--border)",
                    }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)" }}>Sırala:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{
                                background: "none",
                                border: "none",
                                fontSize: 13,
                                fontWeight: 700,
                                color: "var(--text-primary)",
                                outline: "none",
                                cursor: "pointer",
                                padding: "4px 0"
                            }}
                        >
                            {viewMode === "ASSET" ? (
                                <>
                                    <option value="DEFAULT">En Güncel</option>
                                    <option value="AZ">A'dan Z'ye</option>
                                    <option value="POPULAR">En Çok Yorumlanan</option>
                                </>
                            ) : (
                                <>
                                    <option value="DEFAULT">En Güncel Analiz</option>
                                    <option value="AZ">A'dan Z'ye</option>
                                </>
                            )}
                        </select>
                    </div>

                    {/* Filter Pills */}
                    <div style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                        justifyContent: "center"
                    }}>
                        <button
                            onClick={() => setFilterSignal("ALL")}
                            style={{
                                padding: "8px 16px",
                                borderRadius: 20,
                                border: `1px solid ${filterSignal === "ALL" ? "var(--brand-teal)" : "var(--border)"}`,
                                background: filterSignal === "ALL" ? "var(--brand-teal)" : "var(--bg-surface)",
                                color: filterSignal === "ALL" ? "white" : "var(--text-secondary)",
                                fontWeight: 600,
                                fontSize: 13,
                                cursor: "pointer",
                                transition: "all 0.2s",
                                boxShadow: filterSignal === "ALL" ? "0 2px 4px rgba(0,0,0,0.1)" : "none"
                            }}>
                            Tümü
                        </button>
                        <button
                            onClick={() => setFilterSignal("AL")}
                            style={{
                                padding: "8px 16px",
                                borderRadius: 20,
                                border: `1px solid ${filterSignal === "AL" ? "var(--signal-al)" : "var(--border)"}`,
                                background: filterSignal === "AL" ? "var(--signal-al-bg)" : "var(--bg-surface)",
                                color: filterSignal === "AL" ? "var(--signal-al)" : "var(--text-secondary)",
                                fontWeight: 600,
                                fontSize: 13,
                                cursor: "pointer",
                                transition: "all 0.2s"
                            }}>
                            📈 Sadece AL
                        </button>
                        <button
                            onClick={() => setFilterSignal("SAT")}
                            style={{
                                padding: "8px 16px",
                                borderRadius: 20,
                                border: `1px solid ${filterSignal === "SAT" ? "var(--signal-sat)" : "var(--border)"}`,
                                background: filterSignal === "SAT" ? "var(--signal-sat-bg)" : "var(--bg-surface)",
                                color: filterSignal === "SAT" ? "var(--signal-sat)" : "var(--text-secondary)",
                                fontWeight: 600,
                                fontSize: 13,
                                cursor: "pointer",
                                transition: "all 0.2s"
                            }}>
                            📉 Sadece SAT
                        </button>
                        <button
                            onClick={() => setFilterSignal("BEKLE")}
                            style={{
                                padding: "8px 16px",
                                borderRadius: 20,
                                border: `1px solid ${filterSignal === "BEKLE" ? "var(--signal-bekle)" : "var(--border)"}`,
                                background: filterSignal === "BEKLE" ? "var(--signal-bekle-bg)" : "var(--bg-surface)",
                                color: filterSignal === "BEKLE" ? "var(--signal-bekle)" : "var(--text-secondary)",
                                fontWeight: 600,
                                fontSize: 13,
                                cursor: "pointer",
                                transition: "all 0.2s"
                            }}>
                            ⏸️ Bekle / Gözlemle
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div style={{
                display: "flex",
                gap: 16,
                marginBottom: 24,
                flexWrap: "wrap",
            }}>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 16px",
                    background: "var(--bg-surface)",
                    borderRadius: "var(--radius-full)",
                    border: "1px solid var(--border)",
                    fontSize: 13,
                    color: "var(--text-secondary)",
                }}>
                    📊 <strong style={{ color: "var(--text-primary)" }}>{filteredGroups.length}</strong> {viewMode === "ASSET" ? "varlık" : "yorumcu"} takipte
                </div>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 16px",
                    background: "var(--bg-surface)",
                    borderRadius: "var(--radius-full)",
                    border: "1px solid var(--border)",
                    fontSize: 13,
                    color: "var(--text-secondary)",
                }}>
                    🎯 <strong style={{ color: "var(--text-primary)" }}>{data.length}</strong> video analiz edildi
                </div>
            </div>

            {/* Card Grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                gap: 16,
            }}>
                {filteredGroups.map((group, i) => {
                    const price = prices?.[group.name.toUpperCase()];
                    const consensus = consensusMap[group.name];
                    const config = signalConfig[consensus?.recommendation] || signalConfig.TUT;
                    const isExpanded = expandedCard === group.name;
                    const totalSignals = group.signals.length;

                    return (
                        <div
                            key={group.name}
                            className="card"
                            style={{
                                padding: 0,
                                overflow: "hidden",
                                cursor: "pointer",
                            }}
                            onClick={() => setExpandedCard(isExpanded ? null : group.name)}
                        >
                            {/* Card Header */}
                            <div style={{
                                padding: "20px 24px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                            }}>
                                <div>
                                    <div style={{
                                        fontSize: 18,
                                        fontWeight: 800,
                                        color: "var(--text-primary)",
                                        letterSpacing: "-0.02em",
                                        marginBottom: 4,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10
                                    }}>
                                        {viewMode === "ANALYST" && (
                                            <div style={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: "50%",
                                                overflow: "hidden",
                                                flexShrink: 0,
                                                background: "var(--brand-teal)",
                                            }}>
                                                {group.signals[0]?.channelThumbnail ? (
                                                    <img src={group.signals[0].channelThumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                ) : (
                                                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12 }}>{group.name.charAt(0)}</div>
                                                )}
                                            </div>
                                        )}
                                        {group.name}
                                    </div>
                                    {viewMode === "ASSET" ? (
                                        <>
                                            {price && (
                                                <div className="font-mono-data" style={{
                                                    fontSize: 15,
                                                    fontWeight: 700,
                                                    color: "var(--brand-teal)",
                                                }}>
                                                    {price.price.toLocaleString("tr-TR", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}{" "}
                                                    <span style={{ fontSize: 12, opacity: 0.5 }}>{price.currency}</span>
                                                </div>
                                            )}
                                            {!price && (
                                                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                                                    Fiyat bilgisi yükleniyor...
                                                </div>
                                            )}

                                            {/* AI Sentiment for Asset */}
                                            {news && news.some(n => n.relatedAssets?.includes(group.name)) && (
                                                <div style={{
                                                    marginTop: 4,
                                                    fontSize: 11,
                                                    fontWeight: 700,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 4,
                                                    color: news.find(n => n.relatedAssets?.includes(group.name))?.sentiment === 'POSITIVE' ? 'var(--signal-al)' :
                                                        news.find(n => n.relatedAssets?.includes(group.name))?.sentiment === 'NEGATIVE' ? 'var(--signal-sat)' : 'var(--text-muted)'
                                                }}>
                                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}></span>
                                                    AI Haber Duyarlılığı: {
                                                        news.find(n => n.relatedAssets?.includes(group.name))?.sentiment === 'POSITIVE' ? 'POZİTİF' :
                                                            news.find(n => n.relatedAssets?.includes(group.name))?.sentiment === 'NEGATIVE' ? 'NEGATİF' : 'NÖTR'
                                                    }
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                                            {totalSignals} güncel yorum
                                        </div>
                                    )}
                                </div>

                                {/* Signal Badge (Only for Asset Mode or summary for Analyst) */}
                                <div
                                    className={config.className}
                                    style={{
                                        padding: "8px 16px",
                                        borderRadius: 8,
                                        fontWeight: 800,
                                        fontSize: 15,
                                        letterSpacing: "0.05em",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 6,
                                    }}
                                >
                                    <span>{config.emoji}</span>
                                    {viewMode === "ASSET" ? config.label : (
                                        // For Analyst, show the predominant recent signal or just "DETAY"
                                        "PROFİL"
                                    )}
                                </div>
                            </div>

                            {/* Consensus Details / Analyst Asset List */}
                            <div style={{
                                padding: "0 24px 16px",
                                display: "flex",
                                flexDirection: "column",
                                gap: 12,
                            }}>
                                {viewMode === "ASSET" ? (
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <div style={{
                                            flex: 1,
                                            height: 6,
                                            borderRadius: 3,
                                            background: "#e2e8f0",
                                            overflow: "hidden",
                                            display: "flex",
                                        }}>
                                            {consensus?.breakdown && totalSignals > 0 && (
                                                <>
                                                    {consensus.breakdown.AL > 0 && (
                                                        <div style={{
                                                            width: `${(consensus.breakdown.AL / totalSignals) * 100}%`,
                                                            background: "var(--signal-al)",
                                                            transition: "width 0.5s ease",
                                                        }} />
                                                    )}
                                                    {consensus.breakdown.SAT > 0 && (
                                                        <div style={{
                                                            width: `${(consensus.breakdown.SAT / totalSignals) * 100}%`,
                                                            background: "var(--signal-sat)",
                                                            transition: "width 0.5s ease",
                                                        }} />
                                                    )}
                                                    {(consensus.breakdown.TUT + consensus.breakdown.GÖZLEMLE) > 0 && (
                                                        <div style={{
                                                            width: `${((consensus.breakdown.TUT + consensus.breakdown.GÖZLEMLE) / totalSignals) * 100}%`,
                                                            background: "var(--signal-bekle)",
                                                            transition: "width 0.5s ease",
                                                        }} />
                                                    )}
                                                </>
                                            )}
                                        </div>
                                        <span style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                                            {totalSignals} sinyal
                                        </span>
                                    </div>
                                ) : (
                                    // Analyst View: Show featured assets they commented on
                                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                        {Array.from(new Set(group.signals.map(s => s.asset))).slice(0, 4).map(asset => (
                                            <span key={asset} style={{
                                                fontSize: 11,
                                                fontWeight: 700,
                                                background: "var(--border-light)",
                                                padding: "4px 8px",
                                                borderRadius: 6,
                                                color: "var(--brand-teal)"
                                            }}>
                                                {asset}
                                            </span>
                                        ))}
                                        {new Set(group.signals.map(s => s.asset)).size > 4 && (
                                            <span style={{ fontSize: 11, color: "var(--text-muted)", alignSelf: "center" }}>
                                                +{new Set(group.signals.map(s => s.asset)).size - 4} daha
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Signal Breakdown Chips (Only for Asset Mode) */}
                            {viewMode === "ASSET" && (
                                <div style={{
                                    padding: "0 24px 16px",
                                    display: "flex",
                                    gap: 8,
                                    flexWrap: "wrap",
                                }}>
                                    {consensus?.breakdown?.AL > 0 && (
                                        <span style={{
                                            fontSize: 12,
                                            fontWeight: 600,
                                            color: "var(--signal-al)",
                                            background: "var(--signal-al-bg)",
                                            padding: "4px 10px",
                                            borderRadius: 6,
                                        }}>
                                            {consensus.breakdown.AL} AL
                                        </span>
                                    )}
                                    {consensus?.breakdown?.SAT > 0 && (
                                        <span style={{
                                            fontSize: 12,
                                            fontWeight: 600,
                                            color: "var(--signal-sat)",
                                            background: "var(--signal-sat-bg)",
                                            padding: "4px 10px",
                                            borderRadius: 6,
                                        }}>
                                            {consensus.breakdown.SAT} SAT
                                        </span>
                                    )}
                                    {((consensus?.breakdown?.TUT || 0) + (consensus?.breakdown?.GÖZLEMLE || 0)) > 0 && (
                                        <span style={{
                                            fontSize: 12,
                                            fontWeight: 600,
                                            color: "var(--signal-bekle)",
                                            background: "var(--signal-bekle-bg)",
                                            padding: "4px 10px",
                                            borderRadius: 6,
                                        }}>
                                            {(consensus?.breakdown?.TUT || 0) + (consensus?.breakdown?.GÖZLEMLE || 0)} BEKLE
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Footer */}
                            <div style={{
                                borderTop: "1px solid var(--border-light)",
                                padding: "12px 24px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                background: "#fafbfc",
                            }}>
                                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                    Son güncelleme: {formatDate(group.latestDate)}
                                </span>
                                <span style={{
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: "var(--brand-teal)",
                                }}>
                                    {isExpanded ? "Kapat ▲" : "Detaylar ▼"}
                                </span>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div style={{
                                    borderTop: "1px solid var(--border)",
                                    background: "#fafbfc",
                                    maxHeight: 400,
                                    overflowY: "auto",
                                }}>
                                    <div style={{ padding: "16px 24px 8px" }}>
                                        <div style={{
                                            fontSize: 13,
                                            fontWeight: 700,
                                            color: "var(--text-primary)",
                                            marginBottom: 12,
                                        }}>
                                            {viewMode === "ASSET" ? "Analist Görüşleri" : "Yorum Yaptığı Varlıklar"}
                                        </div>
                                    </div>
                                    {group.signals.map((sig, si) => (
                                        <div
                                            key={si}
                                            style={{
                                                padding: "12px 24px",
                                                borderTop: si > 0 ? "1px solid var(--border-light)" : "none",
                                                display: "flex",
                                                gap: 12,
                                                alignItems: "flex-start",
                                            }}
                                        >
                                            {/* Left Icon (Analyst for Asset Mode, Asset for Analyst Mode) */}
                                            <div style={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: viewMode === "ASSET" ? "50%" : "8px",
                                                overflow: "hidden",
                                                flexShrink: 0,
                                                background: viewMode === "ASSET" ? "var(--brand-teal)" : "var(--bg-surface)",
                                                border: viewMode === "ANALYST" ? "1px solid var(--border)" : "none",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}>
                                                {viewMode === "ASSET" ? (
                                                    sig.channelThumbnail ? (
                                                        <img
                                                            src={sig.channelThumbnail}
                                                            alt={sig.channelTitle}
                                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                        />
                                                    ) : (
                                                        <span style={{ color: "white", fontSize: 13, fontWeight: 700 }}>
                                                            {sig.channelTitle.charAt(0)}
                                                        </span>
                                                    )
                                                ) : (
                                                    <span style={{ color: "var(--brand-teal)", fontSize: 11, fontWeight: 800 }}>
                                                        {sig.asset?.substring(0, 3).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>

                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    marginBottom: 4,
                                                }}>
                                                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                                                        {viewMode === "ASSET" ? sig.channelTitle : sig.asset}
                                                    </span>
                                                    <span
                                                        className={signalConfig[sig.recommendation]?.className || "signal-bekle"}
                                                        style={{
                                                            padding: "2px 8px",
                                                            borderRadius: 4,
                                                            fontWeight: 700,
                                                            fontSize: 11,
                                                        }}
                                                    >
                                                        {signalConfig[sig.recommendation]?.label || sig.recommendation}
                                                    </span>
                                                </div>
                                                <p style={{
                                                    fontSize: 13,
                                                    color: "var(--text-secondary)",
                                                    lineHeight: 1.5,
                                                    margin: "0 0 6px",
                                                }}>
                                                    {sig.reasoning}
                                                </p>
                                                <div style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 8,
                                                }}>
                                                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                                                        {formatDate(sig.date)}
                                                    </span>
                                                    <a
                                                        href={`https://youtube.com/watch?v=${sig.videoId}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        style={{
                                                            fontSize: 11,
                                                            color: "var(--brand-teal)",
                                                            fontWeight: 600,
                                                            textDecoration: "none",
                                                        }}
                                                    >
                                                        🎬 Videoyu izle
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {filteredGroups.length === 0 && (
                <div style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    color: "var(--text-muted)",
                }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                    <p style={{ fontSize: 16, fontWeight: 600 }}>Sonuç bulunamadı</p>
                    <p style={{ fontSize: 14 }}>Farklı bir arama terimi deneyin.</p>
                </div>
            )}
        </div>
    );
};
