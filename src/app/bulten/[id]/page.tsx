import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { TallyBar, TallySentence } from "@/components/Tally";
import { DIRECTION, assetLabel, formatDateTr } from "@/lib/display";
import { assetSlug } from "@/lib/slug";
import { getBulletin, getBulletinIndex } from "@/server/read";

export const revalidate = 3600;

export async function generateStaticParams() {
    const index = await getBulletinIndex();
    return (index?.items ?? []).slice(0, 20).map((i) => ({ id: i.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const b = await getBulletin(id);
    if (!b) return { title: "Bülten bulunamadı" };
    return {
        title: `${b.weekLabel} — haftalık konsensüs bülteni`,
        description:
            `${b.weekLabel} haftasında ${b.channelCount} kanaldan ${b.signalCount} görüş: ` +
            `${b.flips.length} varlıkta baskın yön değişti.`,
        alternates: { canonical: `/bulten/${b.id}` },
    };
}

export default async function BultenPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const b = await getBulletin(id);
    if (!b) notFound();

    return (
        <>
            <section className="wrap" style={{ paddingBlock: "40px 8px", maxWidth: 760 }}>
                <Link href="/bulten" className="tiny" style={{ color: "var(--brand)" }}>← Tüm bültenler</Link>
                <h1 className="h1" style={{ fontSize: "clamp(1.6rem, 3.4vw, 2.2rem)", marginTop: 10 }}>
                    {b.weekLabel}
                </h1>
                <p className="lead" style={{ marginTop: 12 }}>
                    Bu hafta {b.channelCount} kanal {b.videoCount} video yayımladı; bunlardan{" "}
                    {b.signalCount} görüş çıkarıldı.{" "}
                    {b.flips.length > 0
                        ? `${b.flips.length} varlıkta baskın yön geçen haftaya göre değişti.`
                        : "Baskın yön hiçbir varlıkta değişmedi."}
                </p>
            </section>

            {b.flips.length > 0 && (
                <section className="wrap section-tight">
                    <h2 className="h2" style={{ fontSize: 20, marginBottom: 12 }}>Yön değişen varlıklar</h2>
                    <div className="grid-cards">
                        {b.flips.map((a) => (
                            <Link key={a.asset} href={`/varlik/${assetSlug(a.asset)}`}
                                className="card card-hover card-pad stack gap-12" style={{ textDecoration: "none" }}>
                                <div className="between" style={{ alignItems: "baseline" }}>
                                    <strong style={{ fontSize: 16 }}>{assetLabel(a.asset)}</strong>
                                    <span className="tiny">
                                        <s>{DIRECTION[a.previousLeading!]}</s>{" → "}
                                        <strong className={`dir dir-${a.leading}`}>{DIRECTION[a.leading]}</strong>
                                    </span>
                                </div>
                                <TallyBar tally={a.tally} total={a.total} />
                                <TallySentence tally={a.tally} total={a.total} size="sm" />
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP} />

            {b.changes.length > 0 && (
                <section className="wrap section-tight">
                    <h2 className="h2" style={{ fontSize: 20, marginBottom: 6 }}>Fikir değiştirenler</h2>
                    <p className="small" style={{ color: "var(--text-soft)", marginBottom: 14, maxWidth: "62ch" }}>
                        Aynı kanal, aynı varlık için hafta içinde önceki söylediğinden farklı bir yön söylediyse
                        buraya düşüyor. Fikir değiştirmek bir kusur değil; ama ne zaman değiştiğini bilmek
                        okuyucunun hakkı.
                    </p>
                    <div className="card">
                        {b.changes.map((c, i) => (
                            <div key={`${c.videoId}-${c.asset}-${i}`} className="between"
                                style={{
                                    padding: "12px 18px", gap: 12, flexWrap: "wrap",
                                    borderTop: i === 0 ? "none" : "1px solid var(--border)",
                                }}>
                                <span className="small">
                                    <strong>{c.channelTitle}</strong>{" · "}
                                    <Link href={`/varlik/${assetSlug(c.asset)}`}>{assetLabel(c.asset)}</Link>
                                </span>
                                <span className="tiny row gap-8">
                                    <s>{DIRECTION[c.from]}</s>
                                    <span>→</span>
                                    <strong className={`dir dir-${c.to}`}>{DIRECTION[c.to]}</strong>
                                    <a href={`https://www.youtube.com/watch?v=${c.videoId}`}
                                        target="_blank" rel="noopener noreferrer"
                                        style={{ color: "var(--brand)" }}>videoda dinle →</a>
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section className="wrap section">
                <h2 className="h2" style={{ fontSize: 20, marginBottom: 12 }}>Haftanın en çok konuşulanları</h2>
                <div className="grid-cards">
                    {b.busiest.map((a) => (
                        <Link key={a.asset} href={`/varlik/${assetSlug(a.asset)}`}
                            className="card card-hover card-pad stack gap-12" style={{ textDecoration: "none" }}>
                            <div className="between" style={{ alignItems: "baseline" }}>
                                <strong style={{ fontSize: 16 }}>{assetLabel(a.asset)}</strong>
                                <span className="mono tiny">{a.total} analist</span>
                            </div>
                            <TallyBar tally={a.tally} total={a.total} />
                            <TallySentence tally={a.tally} total={a.total} size="sm" />
                        </Link>
                    ))}
                </div>
                <p className="tiny" style={{ marginTop: 16 }}>
                    Bülten {formatDateTr(b.generatedAt)} tarihinde otomatik üretildi. Burada yatırım tavsiyesi
                    yok; yalnızca kimin hangi yönde konuştuğunun sayımı ve geçen haftaya göre farkı var.
                </p>
            </section>

            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} />
        </>
    );
}
