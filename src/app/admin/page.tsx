"use client";

import { useCallback, useEffect, useState } from "react";
import type { Channel } from "@/lib/types";

export default function AdminPage() {
    const [secret, setSecret] = useState("");
    const [authed, setAuthed] = useState(false);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [url, setUrl] = useState("");
    const [videoId, setVideoId] = useState("");
    const [videoChannelId, setVideoChannelId] = useState("");
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

    const loadChannels = useCallback(async () => {
        const res = await fetch("/api/channels");
        const data = await res.json();
        if (data.success) setChannels(data.channels);
    }, []);

    useEffect(() => {
        // Oturum sadece sekme ömrü boyunca; kalıcı saklama yok.
        const s = sessionStorage.getItem("and-admin");
        if (s) { setSecret(s); setAuthed(true); }
    }, []);

    useEffect(() => { if (authed) loadChannels(); }, [authed, loadChannels]);

    const login = async () => {
        setBusy(true);
        setMessage(null);
        try {
            const res = await fetch("/api/admin/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ secret }),
            });
            const data = await res.json();
            if (data.success) {
                sessionStorage.setItem("and-admin", secret);
                setAuthed(true);
            } else {
                setMessage({ kind: "err", text: data.error || "Giriş başarısız." });
            }
        } finally {
            setBusy(false);
        }
    };

    const addChannel = async () => {
        setBusy(true);
        setMessage(null);
        try {
            const res = await fetch("/api/channels", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url, secret }),
            });
            const data = await res.json();
            if (data.success) {
                setMessage({
                    kind: "ok",
                    text: data.subscribed
                        ? `${data.channel.title} eklendi ve anlık bildirimlere abone olundu.`
                        : `${data.channel.title} eklendi. Anlık bildirim kurulamadı: ${data.subscribeError}`,
                });
                setUrl("");
                loadChannels();
            } else {
                setMessage({ kind: "err", text: data.error });
            }
        } finally {
            setBusy(false);
        }
    };

    const removeChannel = async (id: string, title: string) => {
        if (!confirm(`${title} takip listesinden çıkarılsın mı?`)) return;
        setBusy(true);
        try {
            await fetch(`/api/channels?id=${id}&secret=${encodeURIComponent(secret)}`, { method: "DELETE" });
            loadChannels();
        } finally {
            setBusy(false);
        }
    };

    const syncOne = async () => {
        setBusy(true);
        setMessage(null);
        try {
            const res = await fetch("/api/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ videoId, channelId: videoChannelId, secret }),
            });
            const data = await res.json();
            setMessage(
                data.error
                    ? { kind: "err", text: data.error }
                    : { kind: "ok", text: `Tamamlandı: ${data.totalFindings ?? 0} sinyal bulundu.` }
            );
        } finally {
            setBusy(false);
        }
    };

    if (!authed) {
        return (
            <section className="wrap section" style={{ maxWidth: 380, paddingBlock: 80 }}>
                <h1 className="h2" style={{ marginBottom: 16 }}>Yönetim girişi</h1>
                <div className="stack gap-12">
                    <input
                        className="input"
                        style={{ paddingLeft: 16 }}
                        type="password"
                        value={secret}
                        onChange={(e) => setSecret(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && login()}
                        placeholder="Yönetici şifresi"
                        autoComplete="current-password"
                    />
                    <button className="btn btn-primary" onClick={login} disabled={busy || !secret}>
                        {busy ? "Kontrol ediliyor…" : "Giriş"}
                    </button>
                    {message && <p className="small" style={{ color: "var(--sat)" }}>{message.text}</p>}
                </div>
            </section>
        );
    }

    return (
        <section className="wrap section stack gap-24" style={{ maxWidth: 760 }}>
            <div className="between">
                <h1 className="h2">Yönetim</h1>
                <button
                    className="chip"
                    onClick={() => { sessionStorage.removeItem("and-admin"); setAuthed(false); setSecret(""); }}
                >
                    Çıkış
                </button>
            </div>

            {message && (
                <p className="small card card-pad" style={{ color: message.kind === "ok" ? "var(--al)" : "var(--sat)" }}>
                    {message.text}
                </p>
            )}

            <div className="card card-pad stack gap-12">
                <h2 className="h3">Kanal ekle</h2>
                <p className="tiny" style={{ margin: 0 }}>
                    YouTube kanal bağlantısı veya @kullanıcı adı. Eklendiğinde anlık bildirim aboneliği otomatik kurulur.
                </p>
                <div className="row gap-8 wrapflex">
                    <input
                        className="input"
                        style={{ paddingLeft: 16, flex: "1 1 240px" }}
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://www.youtube.com/@kanaladi"
                    />
                    <button className="btn btn-primary" onClick={addChannel} disabled={busy || !url}>Ekle</button>
                </div>
            </div>

            <div className="card card-pad stack gap-12">
                <h2 className="h3">Tek video analizi</h2>
                <p className="tiny" style={{ margin: 0 }}>
                    Uzun videolar 60 saniyelik sunucu limitini aşabilir. Aşarsa GitHub Actions&apos;taki
                    &ldquo;Anlık Video Analizi&rdquo; iş akışını elle çalıştırın.
                </p>
                <div className="row gap-8 wrapflex">
                    <input className="input" style={{ paddingLeft: 16, flex: "1 1 140px" }} value={videoId}
                        onChange={(e) => setVideoId(e.target.value)} placeholder="Video ID" />
                    <input className="input" style={{ paddingLeft: 16, flex: "1 1 180px" }} value={videoChannelId}
                        onChange={(e) => setVideoChannelId(e.target.value)} placeholder="Kanal ID (UC…)" />
                    <button className="btn btn-ghost" onClick={syncOne} disabled={busy || !videoId || !videoChannelId}>
                        Analiz et
                    </button>
                </div>
            </div>

            <div className="card card-pad stack gap-12">
                <h2 className="h3">Takip edilen kanallar ({channels.length})</h2>
                <ul className="stack gap-8" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {channels.map((c) => (
                        <li key={c.id} className="between" style={{ padding: "8px 0", borderTop: "1px solid var(--border)" }}>
                            <div className="stack">
                                <strong className="small">{c.title}</strong>
                                <span className="tiny mono">{c.id}</span>
                            </div>
                            <button className="chip" onClick={() => removeChannel(c.id, c.title)} disabled={busy}>
                                Kaldır
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
