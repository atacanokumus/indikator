import { RelativeTime } from "@/components/RelativeTime";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { TallyBar } from "@/components/Tally";
import { RegionSplit } from "@/components/RegionSplit";
import { DIRECTION, assetLabel, formatPrice, tallyParts } from "@/lib/display";
import { assetSlug } from "@/lib/slug";
import { getHomeSnapshot } from "@/server/read";

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
    title: "Analist sayımı: altın, dolar, borsa ve kriptoda kim ne diyor?",
    absoluteTitle: true,
    ogTitle: "Analist sayımı — hangi varlıkta kim ne diyor",
    description:
        "Takip edilen ekonomi yorumcularının son görüşlerinin varlık bazında sayımı: altın, dolar, BIST 100, kripto ve hisseler. " +
        "Hangi yönde kaç analist konuşuyor?",
    path: "/konsensus",
});

export default async function KonsensusPage() {
    const { consensus, analystCount, windowDays, updateFrequency, generatedAt } = await getHomeSnapshot();

    return (
        <>
            <section className="wrap" style={{ paddingBlock: "40px 8px", maxWidth: 760 }}>
                <Breadcrumbs items={[{ name: "Konsensüs", path: "/konsensus" }]} />
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
                        {/*
                          "Sayım" (rakamlar) ve "Dağılım" (çubuk) aynı bilgiyi iki sütunda
                          gösteriyordu; tek sütunda birleşti. Telefonda fiyat ve kaynak sütunları
                          gizlenir (.col-wide), tablo yana kaydırmadan ekrana sığar.
                        */}
                        <table className="kons-table">
                            <caption className="sr-only">Varlık bazında analist sayımı</caption>
                            <thead>
                                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                                    <th scope="col" className="eyebrow">Varlık</th>
                                    <th scope="col" className="eyebrow col-wide">Fiyat</th>
                                    <th scope="col" className="eyebrow">Sayım</th>
                                    <th scope="col" className="eyebrow col-wide">Kaynak</th>
                                    <th scope="col" className="eyebrow col-wide" style={{ textAlign: "right" }}>Son görüş</th>
                                </tr>
                            </thead>
                            <tbody>
                                {consensus.map((c) => (
                                    <tr key={c.asset} style={{ borderBottom: "1px solid var(--border)" }}>
                                        <th scope="row" style={{ fontWeight: 700 }}>
                                            <Link href={`/varlik/${assetSlug(c.asset)}`} style={{ textDecoration: "none" }}>
                                                {assetLabel(c.asset)}
                                            </Link>
                                        </th>
                                        <td className="mono small col-wide" style={{ whiteSpace: "nowrap" }}>
                                            {formatPrice(c.price, c.currency) ?? "—"}
                                            {c.priceAt && <div className="tiny"><RelativeTime iso={c.priceAt} /></div>}
                                        </td>
                                        <td className="kons-main">
                                            <div className="kons-count">
                                                {tallyParts(c.tally).map((p) => (
                                                    <span key={p.rec} style={{ whiteSpace: "nowrap" }}>
                                                        <strong style={{ fontSize: 16 }}>{p.count}</strong>{" "}
                                                        <strong className={`dir dir-${p.rec}`} style={{ fontSize: 13 }}>
                                                            {DIRECTION[p.rec]}
                                                        </strong>
                                                    </span>
                                                ))}
                                            </div>
                                            <TallyBar tally={c.tally} total={c.analystCount} />
                                            {c.changedCount > 0 && (
                                                <div className="tiny" style={{ marginTop: 5 }}>{c.changedCount} analist görüş değiştirdi</div>
                                            )}
                                        </td>
                                        <td className="col-wide" style={{ whiteSpace: "nowrap" }}>
                                            <RegionSplit split={c.regionSplit} />
                                        </td>
                                        <td className="tiny col-wide" style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                                            <RelativeTime iso={c.latestSignalAt} />
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
                        Bu tablo <RelativeTime iso={generatedAt} /> üretildi.
                    </p>
                )}
            </section>

            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} />
        </>
    );
}
