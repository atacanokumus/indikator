import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { TallyBar } from "@/components/Tally";
import { DIRECTION, assetLabel, formatPrice, relativeTime, tallyParts } from "@/lib/display";
import { assetSlug } from "@/lib/slug";
import { getHomeSnapshot } from "@/server/read";

export const revalidate = 60;

export const metadata: Metadata = {
    title: "Analist sayımı — hangi varlıkta kim ne diyor",
    description:
        "Takip edilen ekonomi yorumcularının son görüşlerinin varlık bazında sayımı: altın, dolar, BIST 100, kripto ve hisseler.",
    alternates: { canonical: "/konsensus" },
};

export default async function KonsensusPage() {
    const { consensus, analystCount, windowDays, updateFrequency, generatedAt } = await getHomeSnapshot();

    return (
        <>
            <section className="wrap" style={{ paddingBlock: "40px 8px", maxWidth: 760 }}>
                <h1 className="h1" style={{ fontSize: "clamp(1.7rem, 3.6vw, 2.4rem)" }}>Analist sayımı</h1>
                <p className="lead" style={{ marginTop: 12 }}>
                    Her varlık için, takip edilen {analystCount || "—"} yorumcunun son {windowDays} gündeki
                    görüşleri. Burada bir tavsiye yok; yalnızca kimin hangi yönde konuştuğunun sayımı var.
                </p>
            </section>

            <section className="wrap section">
                {consensus.length === 0 ? (
                    <div className="card card-pad" style={{ textAlign: "center", paddingBlock: 56 }}>
                        <strong>Henüz veri yok</strong>
                    </div>
                ) : (
                    <div className="card scroll-x">
                        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 680 }}>
                            <caption className="sr-only">Varlık bazında analist sayımı</caption>
                            <thead>
                                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                                    {["Varlık", "Fiyat", "Sayım", "Dağılım", "Son görüş"].map((h, i) => (
                                        <th key={h} scope="col" className="eyebrow"
                                            style={{ padding: "13px 16px", textAlign: i > 3 ? "right" : "left" }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {consensus.map((c) => (
                                    <tr key={c.asset} style={{ borderBottom: "1px solid var(--border)" }}>
                                        <th scope="row" style={{ padding: "13px 16px", textAlign: "left", fontWeight: 700 }}>
                                            <Link href={`/varlik/${assetSlug(c.asset)}`} style={{ textDecoration: "none" }}>
                                                {assetLabel(c.asset)}
                                            </Link>
                                        </th>
                                        <td className="mono small" style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                                            {formatPrice(c.price, c.currency) ?? "—"}
                                            {c.priceAt && <div className="tiny">{relativeTime(c.priceAt)}</div>}
                                        </td>
                                        <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                                            {tallyParts(c.tally).map((p, i) => (
                                                <span key={p.rec} style={{ marginRight: 10 }}>
                                                    <strong style={{ fontSize: 16 }}>{p.count}</strong>{" "}
                                                    <strong className={`dir dir-${p.rec}`} style={{ fontSize: 13 }}>
                                                        {DIRECTION[p.rec]}
                                                    </strong>
                                                    {i < tallyParts(c.tally).length - 1 && (
                                                        <span style={{ color: "var(--text-muted)" }}> ·</span>
                                                    )}
                                                </span>
                                            ))}
                                        </td>
                                        <td style={{ padding: "13px 16px", minWidth: 150 }}>
                                            <TallyBar tally={c.tally} total={c.analystCount} />
                                            {c.changedCount > 0 && (
                                                <span className="tiny">{c.changedCount} analist görüş değiştirdi</span>
                                            )}
                                        </td>
                                        <td className="tiny" style={{ padding: "13px 16px", textAlign: "right", whiteSpace: "nowrap" }}>
                                            {relativeTime(c.latestSignalAt)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {updateFrequency && (
                    <p className="legal-strip" style={{ marginTop: 18 }}>
                        <strong>Güncellenme sıklığı.</strong> {updateFrequency}{" "}
                        Bu tablo {relativeTime(generatedAt)} üretildi.
                    </p>
                )}
            </section>

            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} />
        </>
    );
}
