import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { SignalRow } from "@/components/AssetCard";
import { TallyBar, TallyHeadline, TallySentence } from "@/components/Tally";
import { RegionSplit } from "@/components/RegionSplit";
import { LegalNotice } from "@/components/LegalNotice";
import { DIRECTION, assetLabel, formatDateTr, formatPrice, relativeTime } from "@/lib/display";
import { assetSlug, findAssetBySlug } from "@/lib/slug";
import { getHomeSnapshot } from "@/server/read";

export const revalidate = 60;

export async function generateStaticParams() {
    const { consensus } = await getHomeSnapshot().catch(() => ({ consensus: [] }));
    return consensus.slice(0, 40).map((c) => ({ slug: assetSlug(c.asset) }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const { consensus } = await getHomeSnapshot();
    const item = findAssetBySlug(consensus, slug);
    if (!item) return { title: "Varlık bulunamadı" };

    const name = assetLabel(item.asset);
    return {
        title: `${name} için ekonomistler ne diyor?`,
        description:
            `${name} hakkında son ${item.analystCount} YouTube ekonomi yorumcusunun görüşü: ` +
            `${item.leadingCount}'i ${DIRECTION[item.leading]} yönünde. Kim, ne zaman, neden söyledi.`,
        alternates: { canonical: `/varlik/${slug}` },
    };
}

export default async function VarlikPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const snapshot = await getHomeSnapshot();
    const item = findAssetBySlug(snapshot.consensus, slug);
    if (!item) notFound();

    const name = assetLabel(item.asset);
    const price = formatPrice(item.price, item.currency);
    const others = snapshot.consensus.filter((c) => c.asset !== item.asset).slice(0, 6);

    return (
        <>
            <section className="hero-band">
                <div className="wrap" style={{ paddingBlock: "34px 20px" }}>
                    <nav className="tiny" style={{ marginBottom: 12 }} aria-label="Konum">
                        <Link href="/">Sinyaller</Link> <span style={{ color: "var(--text-muted)" }}>/</span>{" "}
                        <span style={{ color: "var(--text-muted)" }}>{name}</span>
                    </nav>

                    <h1 className="h1" style={{ fontSize: "clamp(1.8rem, 4.4vw, 2.7rem)" }}>
                        {name} için ekonomistler ne diyor?
                    </h1>

                    <div className="row gap-16 wrapflex" style={{ marginTop: 18, alignItems: "flex-end" }}>
                        {price && (
                            <div className="stack">
                                <span className="eyebrow">Güncel fiyat</span>
                                <span className="mono" style={{ fontSize: 26, fontWeight: 800 }}>{price}</span>
                                {/* Tebliğ m.78/2-b */}
                                {item.priceAt && (
                                    <span className="tiny">
                                        {formatDateTr(item.priceAt)} · {relativeTime(item.priceAt)} alındı
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="wrap section-tight">
                <div className="card card-pad stack gap-16">
                    <TallyHeadline
                        leading={item.leading}
                        leadingCount={item.leadingCount}
                        total={item.analystCount}
                    />
                    <TallyBar tally={item.tally} total={item.analystCount} />
                    <TallySentence tally={item.tally} total={item.analystCount} size="lg" />

                    <RegionSplit split={item.regionSplit} />

                    {item.changedCount > 0 && (
                        <p className="small" style={{ margin: 0 }}>
                            Son 12 ayda <strong>{item.changedCount} analist</strong> {name} konusundaki
                            görüşünü değiştirdi. Aşağıdaki listede önceki görüşleri de görebilirsiniz.
                        </p>
                    )}

                    <p className="legal-strip">
                        Bu bir yatırım tavsiyesi değildir. Yukarıdaki sayı, {name} hakkında konuşan
                        yorumcuların söylediklerinin sayımıdır; ECOTUBE&apos;un görüşü değildir.
                    </p>
                </div>
            </section>

            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP} />

            <section className="wrap section" aria-labelledby="gorusler">
                <h2 id="gorusler" className="h2" style={{ marginBottom: 16 }}>
                    Kim ne dedi
                </h2>
                <div className="card" style={{ overflow: "hidden" }}>
                    {item.signals.map((s, i) => (
                        <SignalRow key={`${s.videoId}-${i}`} signal={s} asset={item.asset} first={i === 0} />
                    ))}
                </div>
            </section>

            <section className="wrap section-tight">
                <LegalNotice updateFrequency={snapshot.updateFrequency} generatedAt={snapshot.generatedAt} />
            </section>

            {others.length > 0 && (
                <section className="wrap section" aria-labelledby="diger">
                    <h2 id="diger" className="h2" style={{ marginBottom: 16 }}>Diğer varlıklar</h2>
                    <div className="row gap-8 wrapflex">
                        {others.map((o) => (
                            <Link key={o.asset} href={`/varlik/${assetSlug(o.asset)}`} className="chip">
                                {assetLabel(o.asset)}
                                <strong className={`dir dir-${o.leading}`} style={{ fontSize: 12 }}>
                                    {o.leadingCount}/{o.analystCount}
                                </strong>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} />
        </>
    );
}
