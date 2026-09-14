import type { Metadata } from "next";
import { AdSlot } from "@/components/AdSlot";
import { getChannels } from "@/server/repo";
import type { Channel } from "@/lib/types";

export const revalidate = 300;

export const metadata: Metadata = {
    title: "Analistler",
    description:
        "Analist Ne Diyor'un takip ettiği YouTube ekonomi yorumcuları ve geçmiş sinyallerinin isabet performansı.",
    alternates: { canonical: "/analistler" },
};

function successRate(c: Channel) {
    if (!c.predictionCount) return null;
    return Math.round(((c.successCount ?? 0) / c.predictionCount) * 100);
}

export default async function AnalistlerPage() {
    let channels: Channel[] = [];
    try {
        channels = await getChannels();
    } catch {
        channels = [];
    }

    const ranked = [...channels].sort(
        (a, b) => (b.totalScore ?? 100) - (a.totalScore ?? 100) || a.title.localeCompare(b.title, "tr")
    );

    return (
        <>
            <section className="wrap" style={{ paddingBlock: "40px 8px", maxWidth: 760 }}>
                <h1 className="h1" style={{ fontSize: "clamp(1.7rem, 3.6vw, 2.4rem)" }}>Analistler</h1>
                <p className="lead" style={{ marginTop: 12 }}>
                    Takip ettiğimiz YouTube ekonomi kanalları. Puan, geçmiş sinyallerin vadesi dolduğunda
                    fiyatın gerçekten o yönde hareket edip etmediğine bakılarak güncellenir.
                </p>
            </section>

            <section className="wrap section">
                {ranked.length === 0 ? (
                    <div className="card card-pad" style={{ textAlign: "center", paddingBlock: 56 }}>
                        <strong>Henüz analist eklenmemiş</strong>
                    </div>
                ) : (
                    <ol className="grid-cards" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {ranked.map((c, i) => {
                            const rate = successRate(c);
                            return (
                                <li key={c.id} className="card card-pad stack gap-12">
                                    <div className="row gap-12">
                                        <span
                                            className="row"
                                            style={{
                                                width: 30, height: 30, borderRadius: "50%", justifyContent: "center",
                                                background: i < 3 ? "var(--gold-soft)" : "var(--bg-sunken)",
                                                color: i < 3 ? "var(--gold)" : "var(--text-muted)",
                                                fontWeight: 800, fontSize: 13, flexShrink: 0,
                                            }}
                                        >
                                            {i + 1}
                                        </span>
                                        <div className="stack" style={{ minWidth: 0 }}>
                                            <a
                                                className="h3 truncate"
                                                href={`https://www.youtube.com/channel/${c.id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ textDecoration: "none" }}
                                            >
                                                {c.title}
                                            </a>
                                            <span className="tiny">
                                                {c.predictionCount ? `${c.predictionCount} değerlendirilmiş sinyal` : "Henüz vadesi dolmuş sinyal yok"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="between">
                                        <span className="small">Puan</span>
                                        <span className="mono" style={{ fontWeight: 750 }}>{c.totalScore ?? 100}</span>
                                    </div>
                                    {rate !== null && (
                                        <div className="between">
                                            <span className="small">İsabet oranı</span>
                                            <span
                                                className="mono"
                                                style={{ fontWeight: 750, color: rate >= 50 ? "var(--al)" : "var(--sat)" }}
                                            >
                                                %{rate}
                                            </span>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                )}
            </section>

            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} />
        </>
    );
}
