"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface ConsensusItem {
    asset: string;
    recommendation: "AL" | "SAT" | "TUT" | "GÖZLEMLE";
    confidence: number;
    totalAnalysts: number;
    latestSignal: string;
    price?: number;
    currency?: string;
}

const signalConfig: Record<string, { label: string; labelTr: string; className: string; emoji: string }> = {
    AL: { label: "AL", labelTr: "Alım Yönlü", className: "signal-al", emoji: "📈" },
    SAT: { label: "SAT", labelTr: "Satış Yönlü", className: "signal-sat", emoji: "📉" },
    TUT: { label: "BEKLE", labelTr: "Nötr / Bekle", className: "signal-bekle", emoji: "⏸️" },
    GÖZLEMLE: { label: "GÖZLEMLE", labelTr: "İzleme Altında", className: "signal-gozlemle", emoji: "🔍" },
};

export default function ForecastsPage() {
    const [consensus, setConsensus] = useState<ConsensusItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [prices, setPrices] = useState<Record<string, { price: number; currency: string }>>({});

    useEffect(() => {
        const loadConsensus = async () => {
            setLoading(true);
            try {
                const [consensusResp, storedPricesModule] = await Promise.all([
                    fetch("/api/consensus"),
                    import('@/lib/firestore').then(m => m.getStoredPrices())
                ]);

                const consensusData = await consensusResp.json();
                if (consensusData.success) {
                    setConsensus(consensusData.consensus);
                    setPrices(storedPricesModule); // Use stored prices initially

                    const assets = consensusData.consensus.map((c: any) => c.asset);
                    if (assets.length > 0) {
                        const livePricesResp = await fetch("/api/prices", {
                            method: "POST",
                            body: JSON.stringify({ assets }),
                        });
                        const livePricesData = await livePricesResp.json();
                        if (livePricesData.success) {
                            setPrices(prevPrices => ({ ...prevPrices, ...livePricesData.prices })); // Merge live prices
                        }
                    }
                }
            } catch (err) {
                console.error("Konsensüs yükleme hatası:", err);
            } finally {
                setLoading(false);
            }
        };
        loadConsensus();
    }, []);

    return (
        <main style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
            {/* Navigation */}
            <nav className="navbar">
                <Link href="/" className="nav-logo">
                    <div style={{
                        width: 36,
                        height: 36,
                        background: "var(--brand-teal)",
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                        </svg>
                    </div>
                    <span style={{ fontSize: 20, fontWeight: 800, color: "var(--brand-teal)", letterSpacing: "-0.03em" }}>
                        ECO<span style={{ color: "var(--brand-gold)" }}>TUBE</span>
                    </span>
                </Link>

                <div className="nav-links">
                    <Link href="/" className="nav-link">Sinyaller</Link>
                    <Link href="/forecasts" className="nav-link active">Konsensüs</Link>
                    <Link href="/economists" className="nav-link">Analistler</Link>
                </div>
            </nav>

            {/* Hero */}
            <section style={{
                padding: "48px 24px 32px",
                maxWidth: 800,
                margin: "0 auto",
                textAlign: "center",
            }}>
                <h1 style={{
                    fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                    fontWeight: 900,
                    color: "var(--text-primary)",
                    letterSpacing: "-0.03em",
                    marginBottom: 12,
                }}>
                    Piyasa Konsensüsü
                </h1>
                <p style={{
                    fontSize: 16,
                    color: "var(--text-secondary)",
                    maxWidth: 500,
                    margin: "0 auto",
                }}>
                    Tüm analistlerin görüşlerini birleştirerek her varlık için ağırlıklı konsensüs sinyali üretiyoruz.
                </p>
            </section>

            {/* Content */}
            <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 60px" }}>
                {loading ? (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                        gap: 16,
                        width: "100%",
                        paddingTop: 16
                    }}>
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="card" style={{ padding: "24px", height: "180px", display: "flex", flexDirection: "column", justifyContent: "space-between", borderColor: "var(--border-light)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div style={{ width: "40%", height: "24px", background: "var(--bg-surface)", borderRadius: "4px", animation: "pulse 1.5s infinite" }} />
                                    <div style={{ width: "20%", height: "36px", background: "var(--bg-surface)", borderRadius: "8px", animation: "pulse 1.5s infinite" }} />
                                </div>
                                <div style={{ width: "100%", height: "8px", background: "var(--bg-surface)", borderRadius: "4px", animation: "pulse 1.5s infinite" }} />
                                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid var(--border-light)" }}>
                                    <div style={{ width: "30%", height: "16px", background: "var(--bg-surface)", borderRadius: "4px", animation: "pulse 1.5s infinite" }} />
                                    <div style={{ width: "20%", height: "16px", background: "var(--bg-surface)", borderRadius: "4px", animation: "pulse 1.5s infinite" }} />
                                </div>
                            </div>
                        ))}
                        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
                    </div>
                ) : (
                    <>
                        {/* Summary Stats */}
                        <div style={{
                            display: "flex",
                            gap: 16,
                            marginBottom: 32,
                            flexWrap: "wrap",
                        }}>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "10px 20px",
                                background: "var(--bg-surface)",
                                borderRadius: "var(--radius-full)",
                                border: "1px solid var(--border)",
                                fontSize: 14,
                            }}>
                                📊 <strong>{consensus.length}</strong> <span style={{ color: "var(--text-secondary)" }}>varlık analiz edildi</span>
                            </div>
                        </div>

                        {/* Card Grid */}
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                            gap: 16,
                        }}>
                            {consensus.map((item, i) => {
                                const config = signalConfig[item.recommendation] || signalConfig.TUT;
                                const price = prices[item.asset.toUpperCase()];

                                return (
                                    <div
                                        key={item.asset}
                                        className={`card animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}
                                        style={{ padding: 0, overflow: "hidden" }}
                                    >
                                        <div style={{ padding: "20px 24px" }}>
                                            <div style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "flex-start",
                                                marginBottom: 16,
                                            }}>
                                                <div>
                                                    <div style={{
                                                        fontSize: 18,
                                                        fontWeight: 800,
                                                        color: "var(--text-primary)",
                                                        letterSpacing: "-0.02em",
                                                        marginBottom: 4,
                                                    }}>
                                                        {item.asset}
                                                    </div>
                                                    {price ? (
                                                        <div className="font-mono-data" style={{
                                                            fontSize: 15,
                                                            fontWeight: 700,
                                                            color: "var(--brand-teal)",
                                                        }}>
                                                            {price.price.toLocaleString("tr-TR", {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            })}{" "}
                                                            <span style={{ fontSize: 12, opacity: 0.5 }}>{price.currency}</span>
                                                        </div>
                                                    ) : (
                                                        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>—</div>
                                                    )}
                                                </div>

                                                <div
                                                    className={config.className}
                                                    style={{
                                                        padding: "8px 16px",
                                                        borderRadius: 8,
                                                        fontWeight: 800,
                                                        fontSize: 15,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 6,
                                                    }}
                                                >
                                                    <span>{config.emoji}</span>
                                                    {config.label}
                                                </div>
                                            </div>

                                            {/* Confidence Bar */}
                                            <div style={{ marginBottom: 12 }}>
                                                <div style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    marginBottom: 6,
                                                }}>
                                                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                                        {config.labelTr}
                                                    </span>
                                                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>
                                                        %{item.confidence}
                                                    </span>
                                                </div>
                                                <div style={{
                                                    height: 6,
                                                    borderRadius: 3,
                                                    background: "#e2e8f0",
                                                    overflow: "hidden",
                                                }}>
                                                    <div style={{
                                                        height: "100%",
                                                        width: `${item.confidence}%`,
                                                        background: `var(--signal-${item.recommendation === 'AL' ? 'al' : item.recommendation === 'SAT' ? 'sat' : 'bekle'})`,
                                                        borderRadius: 3,
                                                        transition: "width 0.8s ease",
                                                    }} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Footer */}
                                        <div style={{
                                            borderTop: "1px solid var(--border-light)",
                                            padding: "12px 24px",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            background: "#fafbfc",
                                        }}>
                                            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                                {item.totalAnalysts} analist
                                            </span>
                                            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                                {formatDate(item.latestSignal)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </section>

            {/* Footer */}
            <footer style={{
                borderTop: "1px solid var(--border)",
                padding: "24px",
                textAlign: "center",
                color: "var(--text-muted)",
                fontSize: 13,
            }}>
                © 2026 ECOTUBE · Akıllı Analiz & Sinyal Üretimi
            </footer>
        </main>
    );
}
