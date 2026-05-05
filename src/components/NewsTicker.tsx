"use client";

import { useState, useEffect } from "react";

interface NewsItem {
    id: string;
    title: string;
    link: string;
    pubDate: string;
    source: string;
    summary?: string;
    sentiment?: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    relatedAssets?: string[];
}

export const NewsTicker = () => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await fetch('/api/news');
                const data = await res.json();
                setNews(data);
            } catch (error) {
                console.error('Failed to fetch news ticker:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    if (loading) {
        return (
            <div style={{ height: 40, background: 'rgba(0,0,0,0.02)', borderRadius: 12, display: 'flex', alignItems: 'center', padding: '0 16px' }}>
                <div className="skeleton-line" style={{ width: '100%', height: 14 }}></div>
            </div>
        );
    }

    if (news.length === 0) return null;

    const getSentimentEmoji = (sentiment?: string) => {
        if (sentiment === 'POSITIVE') return '🟢';
        if (sentiment === 'NEGATIVE') return '🔴';
        return '⚪';
    };

    return (
        <div style={{
            overflow: 'hidden',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '8px 0',
            marginBottom: 32,
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
        }}>
            <div style={{
                padding: '0 16px',
                borderRight: '2px solid var(--border)',
                fontWeight: 800,
                fontSize: 12,
                color: 'var(--brand-teal)',
                whiteSpace: 'nowrap',
                zIndex: 2,
                background: 'var(--bg-surface)'
            }}>
                SON HABERLER
            </div>

            <div style={{
                display: 'flex',
                whiteSpace: 'nowrap',
                animation: 'ticker 60s linear infinite',
                paddingLeft: 20
            }}>
                {news.map((item, i) => (
                    <a
                        key={item.id + i}
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            marginRight: 40,
                            textDecoration: 'none',
                            fontSize: 13,
                            fontWeight: 600,
                            color: 'var(--text-secondary)',
                            transition: 'color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.color = 'var(--brand-teal)'}
                        onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                        title={item.summary}
                    >
                        <span>{getSentimentEmoji(item.sentiment)}</span>
                        {item.title}
                        {item.relatedAssets && item.relatedAssets.length > 0 && (
                            <span style={{ fontSize: 10, background: 'rgba(20, 184, 166, 0.1)', color: 'var(--brand-teal)', padding: '2px 6px', borderRadius: 4 }}>
                                {item.relatedAssets.join(', ')}
                            </span>
                        )}
                    </a>
                ))}
            </div>

            <style jsx>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
        </div>
    );
};
