import type { Metadata } from "next";
import { AdSlot } from "@/components/AdSlot";
import { assetLabel, formatPrice, relativeTime, signalClass, SIGNAL_LABEL } from "@/lib/display";
import { getHomeSnapshot } from "@/server/read";

export const revalidate = 60;

export const metadata: Metadata = {
    title: "Piyasa konsensüsü",
    description:
        "Takip edilen tüm ekonomi yorumcularının görüşlerinden hesaplanan ağırlıklı konsensüs tablosu: altın, dolar, BIST 100, kripto ve hisseler.",
    alternates: { canonical: "/konsensus" },
};

export default async function KonsensusPage() {
    const { consensus, analystCount, windowDays } = await getHomeSnapshot();

    return (
        <>
            <section className="wrap" style={{ paddingBlock: "40px 8px", maxWidth: 760 }}>
                <h1 className="h1" style={{ fontSize: "clamp(1.7rem, 3.6vw, 2.4rem)" }}>Piyasa konsensüsü</h1>
                <p className="lead" style={{ marginTop: 12 }}>
                    Her varlık için, takip edilen {analystCount || "—"} yorumcunun son {windowDays} gündeki
                    görüşleri; güncelliğe ve geçmiş isabet oranına göre ağırlıklandırılarak birleştirildi.
                </p>
            </section>

            <section className="wrap section">
                {consensus.length === 0 ? (
                    <div className="card card-pad" style={{ textAlign: "center", paddingBlock: 56 }}>
                        <strong>Henüz veri yok</strong>
                        <p className="small" style={{ marginBottom: 0 }}>Yeni videolar analiz edildikçe tablo dolacak.</p>
                    </div>
                ) : (
                    <div className="card scroll-x">
                        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
                            <caption className="sr-only">Varlık bazında konsensüs tablosu</caption>
                            <thead>
                                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                                    {["Varlık", "Fiyat", "Konsensüs", "Dağılım", "Analist", "Son sinyal"].map((h, i) => (
                                        <th
                                            key={h}
                                            scope="col"
                                            className="eyebrow"
                                            style={{ padding: "13px 16px", textAlign: i === 0 ? "left" : i > 3 ? "right" : "left" }}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {consensus.map((c) => {
                                    const total = Math.max(1, c.breakdown.AL + c.breakdown.SAT + c.breakdown.BEKLE);
                                    return (
                                        <tr key={c.asset} style={{ borderBottom: "1px solid var(--border)" }}>
                                            <th scope="row" style={{ padding: "13px 16px", textAlign: "left", fontWeight: 700 }}>
                                                {assetLabel(c.asset)}
                                            </th>
                                            <td className="mono small" style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                                                {formatPrice(c.price, c.currency) ?? "—"}
                                            </td>
                                            <td style={{ padding: "13px 16px" }}>
                                                <span className={signalClass(c.recommendation)}>
                                                    {SIGNAL_LABEL[c.recommendation]}
                                                </span>
                                            </td>
                                            <td style={{ padding: "13px 16px", minWidth: 130 }}>
                                                <div className="meter" title={`${c.breakdown.AL} AL / ${c.breakdown.SAT} SAT / ${c.breakdown.BEKLE} BEKLE`}>
                                                    {c.breakdown.AL > 0 && <i className="m-al" style={{ width: `${(c.breakdown.AL / total) * 100}%` }} />}
                                                    {c.breakdown.SAT > 0 && <i className="m-sat" style={{ width: `${(c.breakdown.SAT / total) * 100}%` }} />}
                                                    {c.breakdown.BEKLE > 0 && <i className="m-bekle" style={{ width: `${(c.breakdown.BEKLE / total) * 100}%` }} />}
                                                </div>
                                                <span className="tiny">%{c.confidence} uzlaşma</span>
                                            </td>
                                            <td className="small" style={{ padding: "13px 16px", textAlign: "right" }}>{c.analystCount}</td>
                                            <td className="tiny" style={{ padding: "13px 16px", textAlign: "right", whiteSpace: "nowrap" }}>
                                                {relativeTime(c.latestSignalAt)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} />
        </>
    );
}
