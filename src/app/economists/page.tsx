"use client";

import { useEffect, useState } from "react";
import { Channel } from "@/lib/firestore";
import Link from "next/link";

export default function EconomistsPage() {
    const [channels, setChannels] = useState<Channel[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChannels = async () => {
            try {
                const resp = await fetch("/api/channels");
                const data = await resp.json();
                if (data.success) {
                    const sorted = (data.channels as Channel[]).sort(
                        (a, b) => (b.totalScore || 0) - (a.totalScore || 0)
                    );
                    setChannels(sorted);
                }
            } catch (err) {
                console.error("Analist yükleme hatası:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchChannels();
    }, []);

    const getRankBadge = (index: number) => {
        if (index === 0) return { emoji: "🥇", color: "#d97706" };
        if (index === 1) return { emoji: "🥈", color: "#6b7280" };
        if (index === 2) return { emoji: "🥉", color: "#b45309" };
        return { emoji: `${index + 1}`, color: "var(--text-muted)" };
    };

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
                    <Link href="/forecasts" className="nav-link">Konsensüs</Link>
                    <Link href="/economists" className="nav-link active">Analistler</Link>
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
                    Analist Sıralaması
                </h1>
                <p style={{
                    fontSize: 16,
                    color: "var(--text-secondary)",
                    maxWidth: 520,
                    margin: "0 auto",
                }}>
                    Takip ettiğimiz YouTube ekonomistleri ve tahmin performansları. Başarı oranına göre sıralanmıştır.
                </p>
            </section>

            {/* Content */}
            <section style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px 60px" }}>
                {loading ? (
                    <div style={{ padding: "80px 0", textAlign: "center" }}>
                        <div style={{
                            width: 40,
                            height: 40,
                            border: "3px solid var(--border)",
                            borderTopColor: "var(--brand-teal)",
                            borderRadius: "50%",
                            animation: "spin 0.8s linear infinite",
                            margin: "0 auto 16px",
                        }} />
                        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Veriler yükleniyor...</p>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {channels.map((channel, index) => {
                            const rank = getRankBadge(index);
                            const successRate = Math.round((channel.successRate || 0.65) * 100);

                            return (
                                <div
                                    key={channel.id}
                                    className="card"
                                    style={{
                                        padding: "20px 24px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 16,
                                        animationDelay: `${index * 0.05}s`,
                                    }}
                                >
                                    {/* Rank */}
                                    <div style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: index < 3 ? 24 : 16,
                                        fontWeight: 800,
                                        color: rank.color,
                                        background: index < 3 ? "var(--bg-surface)" : "transparent",
                                        flexShrink: 0,
                                    }}>
                                        {rank.emoji}
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontSize: 16,
                                            fontWeight: 700,
                                            color: "var(--text-primary)",
                                            marginBottom: 2,
                                        }}>
                                            {channel.title}
                                        </div>
                                        <div style={{
                                            fontSize: 13,
                                            color: "var(--text-muted)",
                                            display: "flex",
                                            gap: 16,
                                            flexWrap: "wrap",
                                        }}>
                                            <span>{channel.predictionCount || 0} tahmin</span>
                                            <span>Puan: {channel.totalScore || 100}</span>
                                        </div>
                                    </div>

                                    {/* Success Rate */}
                                    <div style={{
                                        display: "flex",
                                        flexDirection: "column" as const,
                                        alignItems: "center",
                                        gap: 4,
                                        flexShrink: 0,
                                    }}>
                                        <div className="font-mono-data" style={{
                                            fontSize: 20,
                                            fontWeight: 800,
                                            color: successRate >= 60 ? "var(--signal-al)" : successRate >= 40 ? "var(--signal-bekle)" : "var(--signal-sat)",
                                        }}>
                                            %{successRate}
                                        </div>
                                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Başarı</div>
                                    </div>

                                    {/* YouTube Link */}
                                    <a
                                        href={`https://youtube.com/channel/${channel.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 8,
                                            border: "1px solid var(--border)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "var(--text-muted)",
                                            textDecoration: "none",
                                            flexShrink: 0,
                                            transition: "all 0.2s",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = "#ff0000";
                                            e.currentTarget.style.color = "#ff0000";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = "var(--border)";
                                            e.currentTarget.style.color = "var(--text-muted)";
                                        }}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                        </svg>
                                    </a>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Info Card */}
                <div className="card" style={{
                    marginTop: 32,
                    padding: "24px 28px",
                }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 12,
                    }}>
                        <span style={{ fontSize: 18 }}>ℹ️</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                            Puanlama Nasıl Çalışır?
                        </span>
                    </div>
                    <p style={{
                        fontSize: 14,
                        color: "var(--text-secondary)",
                        lineHeight: 1.7,
                        margin: 0,
                    }}>
                        Analistler, verdikleri AL/SAT sinyallerinin gerçek piyasa sonuçlarıyla karşılaştırılarak puanlanır. Başarılı tahminler puanı artırır, başarısız tahminler düşürür.
                        Yüksek puanlı analistlerin görüşleri konsensüs hesaplamalarında daha ağırlıklı olarak değerlendirilir.
                    </p>
                </div>
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
