"use client";

import { useEffect, useState } from "react";
import type { NewsItem } from "@/lib/types";

const DOT: Record<string, string> = {
    POSITIVE: "var(--al)",
    NEGATIVE: "var(--sat)",
    NEUTRAL: "var(--text-muted)",
};

export function NewsTicker() {
    // null = henüz yüklenmedi. Yüklenirken aynı yüksekte boş kutu gösteriyoruz; şerit sonradan
    // eklenince alttaki içerik aşağı kaymasın (Core Web Vitals / CLS).
    const [news, setNews] = useState<NewsItem[] | null>(null);

    useEffect(() => {
        let alive = true;
        fetch("/api/news")
            .then((r) => r.json())
            .then((d) => alive && setNews(Array.isArray(d) ? d : []))
            .catch(() => { if (alive) setNews([]); });
        return () => { alive = false; };
    }, []);

    if (news === null) {
        return (
            <section className="wrap section-tight" aria-hidden="true">
                <div className="ticker-reserve skel" style={{ borderRadius: "var(--r)" }} />
            </section>
        );
    }
    if (news.length === 0) return null;
    // Kesintisiz kayma için listeyi ikiye katlıyoruz
    const items = [...news, ...news];

    return (
        <section className="wrap section-tight">
        <div className="ticker" role="region" aria-label="Son finans haberleri">
            <div className="ticker-label">
                <span className="pulse-dot" style={{ color: "var(--gold)" }} />
                Piyasa
            </div>
            <div className="ticker-track">
                {items.map((item, i) => (
                    <a
                        key={`${item.id}-${i}`}
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="ticker-item"
                        title={item.summary || item.title}
                    >
                        <span
                            style={{
                                width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                                background: DOT[item.sentiment ?? "NEUTRAL"],
                            }}
                        />
                        {item.title}
                        <span className="tiny" style={{ opacity: .7 }}>· {item.source}</span>
                    </a>
                ))}
            </div>
        </div>
        </section>
    );
}
