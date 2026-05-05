"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import Link from "next/link";

interface ChannelInfo {
    id: string;
    title: string;
    thumbnail?: string;
}

export default function AdminPage() {
    const [secret, setSecret] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);

    const [videoId, setVideoId] = useState("");
    const [selectedChannel, setSelectedChannel] = useState("");
    const [newChannelUrl, setNewChannelUrl] = useState("");

    const [channels, setChannels] = useState<ChannelInfo[]>([]);
    const [logs, setLogs] = useState<string[]>([]);

    const [loading, setLoading] = useState(false);
    const [channelsLoading, setChannelsLoading] = useState(true);
    const [syncingChannelId, setSyncingChannelId] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    const addLog = useCallback((m: string) => {
        setLogs(prev => [`[${new Date().toLocaleTimeString("tr-TR")}] ${m}`, ...prev]);
    }, []);

    useEffect(() => {
        setIsMounted(true);
        const stored = localStorage.getItem("admin_secret");
        if (stored) {
            setSecret(stored);
            verifyLogin(stored);
        }
    }, []);

    const verifyLogin = async (passwordToTest: string) => {
        if (!passwordToTest.trim()) return;
        setLoginLoading(true);
        try {
            const res = await fetch("/api/admin/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ secret: passwordToTest })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setIsLoggedIn(true);
                localStorage.setItem("admin_secret", passwordToTest);
                fetchChannels();
            } else {
                localStorage.removeItem("admin_secret");
                setIsLoggedIn(false);
                if (!loginLoading) alert("Geçersiz şifre!");
            }
        } catch (err: any) {
            console.error("Giriş hatası:", err);
            alert("Bağlantı hatası oluştu.");
        } finally {
            setLoginLoading(false);
        }
    };

    const handleLoginSubmit = (e: FormEvent) => {
        e.preventDefault();
        verifyLogin(secret);
    };

    const handleLogout = () => {
        localStorage.removeItem("admin_secret");
        setSecret("");
        setIsLoggedIn(false);
        setChannels([]);
    };

    const fetchChannels = async () => {
        setChannelsLoading(true);
        try {
            const res = await fetch("/api/channels");
            const data = await res.json();
            const list = data.channels ?? data ?? [];
            setChannels(Array.isArray(list) ? list : []);
        } catch (err) {
            console.error("Kanal listesi hatası:", err);
            addLog("Kanal listesi alınamadı.");
        } finally {
            setChannelsLoading(false);
        }
    };

    const handleAddChannel = async (e: FormEvent) => {
        e.preventDefault();
        if (!newChannelUrl.trim()) return;

        setLoading(true);
        addLog(`Kanal ekleniyor: ${newChannelUrl}`);

        try {
            const res = await fetch("/api/channels", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: newChannelUrl.trim(), secret })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                addLog(`✅ Kanal eklendi: ${data.channel.title}`);
                setNewChannelUrl("");
                fetchChannels();
            } else {
                addLog(`❌ HATA: ${data.error}`);
            }
        } catch (err: any) {
            addLog(`💥 BAĞLANTI HATASI: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteChannel = async (id: string, title: string) => {
        if (!confirm(`Tüm "${title}" kayıtları silinecek. Emin misiniz?`)) return;

        setLoading(true);
        addLog(`Kanal siliniyor: ${title}...`);

        try {
            const res = await fetch(`/api/channels?id=${id}&secret=${encodeURIComponent(secret)}`, {
                method: "DELETE"
            });
            const data = await res.json();

            if (res.ok && data.success) {
                addLog(`🗑️ Kanal silindi: ${title}`);
                fetchChannels();
            } else {
                addLog(`❌ SİLME HATASI: ${data.error}`);
            }
        } catch (err: any) {
            addLog(`💥 BAĞLANTI HATASI: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleVideoSync = async () => {
        if (!videoId.trim()) return alert("Video ID boş olamaz.");
        if (!selectedChannel) return alert("Bir kanal seçmelisiniz.");

        const channel = channels.find(c => c.id === selectedChannel);
        if (!channel) return alert("Seçili kanal bulunamadı.");

        setLoading(true);
        addLog(`Video analizi başlatılıyor: ${videoId}`);

        try {
            const res = await fetch("/api/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "manual-video",
                    videoId: videoId.trim(),
                    channelId: channel.id,
                    channelTitle: channel.title,
                    channelThumbnail: channel.thumbnail,
                    secret
                })
            });
            const data = await res.json();

            if (res.ok) {
                addLog(`✅ BAŞARILI — ${data.totalFindings ?? 0} bulgu kaydedildi.`);
                if (data.logs) data.logs.forEach((l: string) => addLog(`  → ${l}`));
                setVideoId("");
            } else {
                addLog(`❌ HATA (${res.status}): ${data.error || "Bilinmeyen hata"}`);
            }
        } catch (err: any) {
            addLog(`💥 BAĞLANTI HATASI: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleChannelSync = async (channel: ChannelInfo) => {
        setSyncingChannelId(channel.id);
        addLog(`${channel.title} kanalı taranıyor...`);

        try {
            const res = await fetch("/api/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    channelId: channel.id,
                    channelTitle: channel.title,
                    channelThumbnail: channel.thumbnail,
                    secret
                })
            });
            const data = await res.json();

            if (res.ok) {
                addLog(`✅ ${channel.title}: ${data.videosProcessed ?? 0} video, ${data.totalFindings ?? 0} bulgu.`);
                if (data.logs) data.logs.forEach((l: string) => addLog(`  → ${l}`));
            } else {
                addLog(`❌ ${channel.title} HATA (${res.status}): ${data.error || "Bilinmeyen hata"}`);
            }
        } catch (err: any) {
            addLog(`💥 ${channel.title} BAĞLANTI HATASI: ${err.message}`);
        } finally {
            setSyncingChannelId(null);
        }
    };

    const handleSyncAll = async () => {
        addLog("=== TÜM KANALLAR TARANACAK ===");
        for (const ch of channels) {
            await handleChannelSync(ch);
        }
        addLog("=== TOPLAM TARAMA TAMAMLANDI ===");
    };

    if (!isMounted) return null;

    if (!isLoggedIn) {
        return (
            <main style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div className="card" style={{ padding: "40px", maxWidth: 400, width: "100%", textAlign: "center" }}>
                    <div style={{
                        width: 56, height: 56,
                        background: "var(--brand-teal)",
                        borderRadius: 16,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 24px"
                    }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                    </div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>
                        Yönetim Paneli
                    </h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 32 }}>
                        Yetkili erişimi gereklidir.
                    </p>
                    <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <input
                            type="password"
                            placeholder="Admin Şifresi"
                            value={secret}
                            onChange={e => setSecret(e.target.value)}
                            style={{
                                padding: "14px 16px",
                                borderRadius: 12,
                                border: "1px solid var(--border)",
                                background: "var(--bg-surface-hover)",
                                color: "var(--text-primary)",
                                fontSize: 15,
                                outline: "none",
                                textAlign: "center",
                                letterSpacing: 2
                            }}
                        />
                        <button
                            type="submit"
                            disabled={loginLoading || !secret.trim()}
                            style={{
                                padding: "14px",
                                borderRadius: 12,
                                border: "none",
                                background: "var(--brand-teal)",
                                color: "white",
                                fontWeight: 700,
                                cursor: (loginLoading || !secret.trim()) ? "not-allowed" : "pointer",
                                fontSize: 15,
                                opacity: (loginLoading || !secret.trim()) ? 0.7 : 1,
                                transition: "all 0.2s",
                            }}
                        >
                            {loginLoading ? "Doğrulanıyor..." : "Giriş Yap"}
                        </button>
                    </form>
                    <Link href="/" style={{ display: "block", marginTop: 24, fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>
                        &larr; Siteye Dön
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
            {/* Nav */}
            <nav className="navbar">
                <Link href="/" className="nav-logo">
                    <span style={{ fontSize: 20, fontWeight: 800, color: "var(--brand-teal)", letterSpacing: "-0.03em" }}>
                        ECO<span style={{ color: "var(--brand-gold)" }}>TUBE</span> <span style={{ color: "var(--text-muted)", fontSize: 14, fontWeight: 500 }}>| Admin</span>
                    </span>
                </Link>
                <div className="nav-links">
                    <button onClick={handleLogout} style={{ background: "none", border: "none", color: "var(--signal-sat)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                        Çıkış Yap &rarr;
                    </button>
                </div>
            </nav>

            <section style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px 60px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>

                    {/* SOL KOLON: ANALİZ */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                        {/* Manuel Video Analiz */}
                        <div className="card" style={{ padding: "20px 24px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                                <span style={{ fontSize: 18 }}>🎬</span>
                                <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Manuel Video Analizi</span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                <select
                                    value={selectedChannel}
                                    onChange={e => setSelectedChannel(e.target.value)}
                                    style={{ padding: "12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-surface)", color: "var(--text-primary)", fontSize: 14 }}
                                >
                                    <option value="">{channelsLoading ? "Kanallar yükleniyor..." : "Kanal seçin..."}</option>
                                    {channels.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                </select>
                                <input
                                    placeholder="YouTube Video ID (örn: o_jjnmuwjDk)"
                                    value={videoId}
                                    onChange={e => setVideoId(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && handleVideoSync()}
                                    style={{ padding: "12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-surface)", color: "var(--text-primary)", fontSize: 14, fontFamily: "monospace" }}
                                />
                                <button
                                    disabled={loading}
                                    onClick={handleVideoSync}
                                    style={{ padding: "14px", borderRadius: 10, border: "none", background: loading ? "var(--text-muted)" : "var(--signal-al)", color: "white", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontSize: 14 }}
                                >
                                    {loading ? "⏳ İşleniyor..." : "Analiz Et ve Kaydet"}
                                </button>
                            </div>
                        </div>

                        {/* Loglar */}
                        <div className="card" style={{ padding: "20px 24px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ fontSize: 18 }}>📋</span>
                                    <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>İşlem Kayıtları ({logs.length})</span>
                                </div>
                                <button onClick={() => setLogs([])} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", cursor: "pointer" }}>
                                    Temizle
                                </button>
                            </div>
                            <div className="font-mono-data" style={{ fontSize: 12, lineHeight: 1.7, background: "#0d1117", color: "#7ee787", padding: 16, borderRadius: 10, height: 360, overflowY: "auto", border: "1px solid #30363d" }}>
                                {logs.length === 0 ? <span style={{ color: "#8b949e" }}>Henüz işlem yapılmadı...</span> : logs.map((l, i) => <div key={i} style={{ marginBottom: 2 }}>{l}</div>)}
                            </div>
                        </div>
                    </div>

                    {/* SAĞ KOLON: KANALLAR */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                        {/* Kanal Ekle */}
                        <div className="card" style={{ padding: "20px 24px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                                <span style={{ fontSize: 18 }}>➕</span>
                                <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Yeni Kanal Ekle</span>
                            </div>
                            <form onSubmit={handleAddChannel} style={{ display: "flex", gap: 10 }}>
                                <input
                                    placeholder="Kanal URL'si (youtube.com/@...)"
                                    value={newChannelUrl}
                                    onChange={e => setNewChannelUrl(e.target.value)}
                                    style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-surface)", color: "var(--text-primary)", fontSize: 14 }}
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !newChannelUrl.trim()}
                                    style={{ padding: "12px 20px", borderRadius: 10, border: "none", background: "var(--brand-teal)", color: "white", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontSize: 14 }}
                                >
                                    Ekle
                                </button>
                            </form>
                        </div>

                        {/* Kanal Listesi */}
                        <div className="card" style={{ padding: "20px 24px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ fontSize: 18 }}>📡</span>
                                    <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Takip Edilen Kanallar ({channels.length})</span>
                                </div>
                                <button
                                    onClick={handleSyncAll}
                                    disabled={!!syncingChannelId || loading || channels.length === 0}
                                    style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--brand-gold-light)", background: "var(--signal-bekle-bg)", color: "var(--signal-bekle)", fontWeight: 700, cursor: "pointer", fontSize: 13 }}
                                >
                                    ▶ Tümünü Tara
                                </button>
                            </div>

                            {channelsLoading ? (
                                <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>Yükleniyor...</p>
                            ) : channels.length === 0 ? (
                                <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>Kayıtlı kanal yok.</p>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 400, overflowY: "auto" }}>
                                    {channels.map(c => {
                                        const isSyncing = syncingChannelId === c.id;
                                        return (
                                            <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: isSyncing ? "var(--signal-bekle-bg)" : "var(--bg-surface-hover)", borderRadius: 10, border: `1px solid ${isSyncing ? "var(--signal-bekle-border)" : "var(--border-light)"}`, transition: "all 0.2s" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
                                                    {c.thumbnail && <img src={c.thumbnail} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />}
                                                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</span>
                                                </div>
                                                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                                                    <button
                                                        disabled={!!syncingChannelId || loading}
                                                        onClick={() => handleChannelSync(c)}
                                                        style={{ fontSize: 12, padding: "6px 14px", borderRadius: 6, fontWeight: 700, cursor: (syncingChannelId || loading) ? "not-allowed" : "pointer", background: isSyncing ? "var(--signal-bekle)" : "var(--bg-surface)", border: `1px solid ${isSyncing ? "transparent" : "var(--border)"}`, color: isSyncing ? "white" : "var(--text-primary)", transition: "all 0.2s" }}
                                                    >
                                                        {isSyncing ? "⏳" : "Tara"}
                                                    </button>
                                                    <button
                                                        disabled={!!syncingChannelId || loading}
                                                        onClick={() => handleDeleteChannel(c.id, c.title)}
                                                        title="Kanalı Sil"
                                                        style={{ fontSize: 14, padding: "6px 10px", borderRadius: 6, border: "1px solid var(--signal-sat-border)", background: "var(--signal-sat-bg)", color: "var(--signal-sat)", fontWeight: 700, cursor: (syncingChannelId || loading) ? "not-allowed" : "pointer", transition: "all 0.2s" }}
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
