"use client";

import { useState } from "react";

const REASONS = [
    { key: "YANLIS_YON", label: "Yön yanlış — böyle demedi" },
    { key: "YANLIS_VARLIK", label: "Bu varlıktan bahsetmedi" },
    { key: "BAGLAM", label: "Bağlamından koparılmış" },
    { key: "KALDIR", label: "Bu içeriğin kaldırılmasını istiyorum" },
];

/**
 * "Bu özet yanlış" bildirimi.
 *
 * Bildirim gelen sinyal, bir sonraki snapshot üretiminde otomatik olarak
 * listeden çıkar (src/server/snapshot.ts — getSuppressedSignals). Yani
 * itiraz eden kişi cevabımızı beklemek zorunda kalmaz; içerik önce iner,
 * sonra incelenir. Kişilik hakkı ihlali iddialarına karşı en hızlı savunma.
 */
export function ReportButton({
    videoId,
    asset,
    channelTitle,
}: {
    videoId: string;
    asset: string;
    channelTitle: string;
}) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState(REASONS[0].key);
    const [note, setNote] = useState("");
    const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

    const send = async () => {
        setState("sending");
        try {
            const res = await fetch("/api/report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ videoId, asset, reason, note }),
            });
            setState(res.ok ? "done" : "error");
        } catch {
            setState("error");
        }
    };

    if (state === "done") {
        return (
            <span className="tiny" style={{ color: "var(--al)" }}>
                Bildiriminiz alındı, bu özet listeden çıkarılacak. Teşekkürler.
            </span>
        );
    }

    if (!open) {
        return (
            <button className="report-btn" onClick={() => setOpen(true)}>
                Bu özet yanlış
            </button>
        );
    }

    return (
        <div
            className="stack gap-8"
            style={{
                width: "100%", marginTop: 6, padding: 12,
                background: "var(--bg-sunken)", border: "1px solid var(--border)",
                borderRadius: "var(--r)",
            }}
        >
            <span className="tiny" style={{ color: "var(--text)" }}>
                <strong>{channelTitle}</strong> için çıkarılan özeti bildiriyorsunuz.
            </span>

            <select
                className="chip"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                aria-label="Bildirim sebebi"
                style={{ width: "100%" }}
            >
                {REASONS.map((r) => (
                    <option key={r.key} value={r.key}>{r.label}</option>
                ))}
            </select>

            <textarea
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 500))}
                placeholder="İsterseniz kısaca açıklayın (zorunlu değil)"
                rows={2}
                className="input"
                style={{ paddingLeft: 14, paddingTop: 10, resize: "vertical", fontSize: 13.5 }}
            />

            <div className="row gap-8">
                <button className="btn btn-primary" style={{ padding: "8px 16px", fontSize: 13 }} onClick={send} disabled={state === "sending"}>
                    {state === "sending" ? "Gönderiliyor…" : "Bildir"}
                </button>
                <button className="chip" onClick={() => setOpen(false)}>Vazgeç</button>
            </div>

            {state === "error" && (
                <span className="tiny" style={{ color: "var(--sat)" }}>
                    Gönderilemedi. Lütfen iletişim sayfasından yazın.
                </span>
            )}
        </div>
    );
}
