import { RelativeTime } from "@/components/RelativeTime";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { SignalRow } from "@/components/AssetCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { TallyBar, TallyHeadline, TallySentence } from "@/components/Tally";
import { RegionSplit } from "@/components/RegionSplit";
import { LegalNotice } from "@/components/LegalNotice";
import { ConsensusHistory } from "@/components/ConsensusHistory";
import { getGuide } from "@/content/guides";
import { getAssetProfile } from "@/content/assets";
import { assetLabel, formatDateTr, formatPrice, tallyText } from "@/lib/display";
import {
    assetMetaDescription,
    assetMetaTitle,
    assetSeoName,
    directionWord,
    isIndexableAsset,
} from "@/lib/asset-seo";
import { faqLd, pageMetadata, webPageLd } from "@/lib/seo";
import { assetSlug, resolveAssetSlug } from "@/lib/slug";
import type { AssetConsensus } from "@/lib/types";
import { loadAssets } from "@/server/known-assets";
import { getHomeSnapshot } from "@/server/read";

export const revalidate = 60;

export async function generateStaticParams() {
    const { consensus } = await getHomeSnapshot().catch(() => ({ consensus: [] as AssetConsensus[] }));
    return consensus.slice(0, 40).map((c) => ({ slug: assetSlug(c.asset) }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const { snapshot, known } = await loadAssets();
    const hit = resolveAssetSlug(known, slug);
    if (!hit) return { title: "Varlık bulunamadı", robots: { index: false } };

    const item = snapshot.consensus.find((c) => c.asset === hit.asset);
    return pageMetadata({
        title: assetMetaTitle(hit.asset, snapshot.generatedAt, Boolean(item)),
        absoluteTitle: true,
        description: assetMetaDescription(hit.asset, item, snapshot.windowDays),
        path: `/varlik/${hit.canonical}`,
        noindex: !isIndexableAsset(hit.asset, item?.analystCount ?? 0),
    });
}

export default async function VarlikPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const { snapshot, history: allHistory, known } = await loadAssets();

    const hit = resolveAssetSlug(known, slug);
    if (!hit) notFound();
    // Eski adres ("usd-try") -> yeni adres ("dolar"): kalıcı yönlendirme, sıralama birikimi taşınır.
    if (hit.canonical !== slug) permanentRedirect(`/varlik/${hit.canonical}`);

    const asset = hit.asset;
    // Veri tabanı okunamadığında anlık görüntü boş döner (generatedAt = 1970). O durumda
    // "kimse konuşmadı" demek yalan olur; sayfa bunu "şu an yüklenemiyor" diye söyler.
    const hasSnapshot = new Date(snapshot.generatedAt).getFullYear() > 2020;
    const item = snapshot.consensus.find((c) => c.asset === asset);
    const profile = getAssetProfile(asset);
    const name = assetSeoName(asset);
    const history = allHistory[asset] ?? [];
    const price = item ? formatPrice(item.price, item.currency) : null;
    const path = `/varlik/${hit.canonical}`;

    const guides = (profile?.guides ?? [])
        .map((s) => getGuide(s))
        .filter((g): g is NonNullable<typeof g> => Boolean(g));

    // İlgili varlıklar: profilde yazılanlar önce, sonra en çok konuşulanlar. Yalnızca verisi olanlar.
    const byAsset = new Map(snapshot.consensus.map((c) => [c.asset, c]));
    const relatedCodes = [
        ...(profile?.related ?? []),
        ...snapshot.consensus.map((c) => c.asset),
    ].filter((a, i, arr) => a !== asset && arr.indexOf(a) === i && byAsset.has(a));
    const others = relatedCodes.slice(0, 8).map((a) => byAsset.get(a)!);

    /* ---- SSS: sayfaya özgü cevaplar + sabit sorular ---- */
    const faq: { q: string; a: string }[] = [];
    if (item) {
        faq.push({
            q: `${name} için ekonomistler ne diyor?`,
            a:
                `Son ${snapshot.windowDays} günde takip ettiğimiz ${item.analystCount} YouTube ekonomi yorumcusu ${name} hakkında görüş bildirdi: ` +
                `${tallyText(item.tally, item.analystCount)}. Bu bir tavsiye değil, söylenenlerin sayımıdır.`,
        });
    } else if (hasSnapshot) {
        faq.push({
            q: `${name} için ekonomistler ne diyor?`,
            a:
                `Son ${snapshot.windowDays} günde takip ettiğimiz yorumcular arasında ${name} hakkında net görüş bildiren olmadı. ` +
                `Bir yorumcu konuştuğunda sayım bu sayfada görünür.`,
        });
    }
    faq.push(...(profile?.faq ?? []));
    faq.push({
        q: `${name} yorumları ne sıklıkla güncelleniyor?`,
        a:
            "Takip edilen bir kanal video yayınladığında YouTube bildirim gönderir ve video genellikle birkaç dakika içinde analiz edilir. " +
            "Ayrıca 6 saatte bir tarama yapılır. Fiyatlar en az 3 saatte bir yenilenir.",
    });
    faq.push({
        q: `Bu sayfa ${name} için yatırım tavsiyesi mi?`,
        a:
            "Hayır. Analist Ne Diyor kendi görüşünü üretmez; videolarda başkalarının ne dediğini sayar. İçerik genel niteliktedir, " +
            "kişiye özel değildir ve yatırım danışmanlığı kapsamında değildir.",
    });

    return (
        <>
            <section className="hero-band">
                <div className="wrap" style={{ paddingBlock: "30px 20px" }}>
                    <Breadcrumbs
                        items={[
                            { name: "Konsensüs", path: "/konsensus" },
                            { name, path },
                        ]}
                    />

                    <h1 className="h1" style={{ fontSize: "clamp(1.8rem, 4.4vw, 2.7rem)" }}>
                        {name} için ekonomistler ne diyor?
                    </h1>

                    {/* Cevap önce: arama motoru da okuyucu da ilk paragrafta sonucu görsün. */}
                    <p className="lead" style={{ marginTop: 14, maxWidth: "64ch" }}>
                        {item ? (
                            <>
                                {name} yorumları: son {snapshot.windowDays} günde {item.analystCount} YouTube ekonomi yorumcusu konuştu.{" "}
                                <strong>{tallyText(item.tally, item.analystCount)}.</strong>
                            </>
                        ) : hasSnapshot ? (
                            <>
                                Son {snapshot.windowDays} günde takip ettiğimiz yorumcular arasında {name} hakkında net görüş bildiren olmadı.
                                Aşağıda geçmiş görüşlerin seyrini ve {name} hakkında temel bilgileri bulabilirsiniz.
                            </>
                        ) : (
                            <>
                                Güncel görüş sayımı şu anda yüklenemiyor; birazdan yeniden deneyin.
                                Aşağıda {name} hakkında temel bilgileri bulabilirsiniz.
                            </>
                        )}
                    </p>

                    <div className="row gap-16 wrapflex" style={{ marginTop: 18, alignItems: "flex-end" }}>
                        {price && item && (
                            <div className="stack">
                                <span className="eyebrow">Güncel fiyat</span>
                                <span className="mono" style={{ fontSize: 26, fontWeight: 800 }}>{price}</span>
                                {/* Tebliğ m.78/2-b */}
                                {item.priceAt && (
                                    <span className="tiny">
                                        {formatDateTr(item.priceAt)} · <RelativeTime iso={item.priceAt} /> alındı
                                    </span>
                                )}
                            </div>
                        )}
                        {hasSnapshot && (
                            <div className="stack">
                                <span className="eyebrow">Son güncelleme</span>
                                <span className="small">
                                    <time dateTime={snapshot.generatedAt}>{formatDateTr(snapshot.generatedAt)}</time>
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {item && (
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
                            yorumcuların söylediklerinin sayımıdır; Analist Ne Diyor&apos;un görüşü değildir.
                        </p>
                    </div>
                </section>
            )}

            {history.length > 0 && (
                <section className="wrap section-tight">
                    <ConsensusHistory series={history} assetLabel={name} />
                </section>
            )}

            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP} />

            {item && (
                <section className="wrap section" aria-labelledby="gorusler">
                    <h2 id="gorusler" className="h2" style={{ marginBottom: 16 }}>
                        {name} hakkında kim ne dedi?
                    </h2>
                    <div className="card" style={{ overflow: "hidden" }}>
                        {item.signals.map((s, i) => (
                            <SignalRow key={`${s.videoId}-${i}`} signal={s} asset={item.asset} first={i === 0} />
                        ))}
                    </div>
                </section>
            )}

            {/* ---------- Varlık bilgisi: sayfaya özgü, eskimeyen içerik ---------- */}
            {profile && (
                <section className="wrap section" aria-labelledby="nedir">
                    <div className="prose">
                        <h2 id="nedir" className="h2">{name} nedir?</h2>
                        <p>{profile.summary}</p>
                        {profile.also && profile.also.length > 0 && (
                            <p className="small">
                                Şu adlarla da aranır: {profile.also.join(", ")}.
                            </p>
                        )}

                        <h2 id="etkenler" className="h2">{name} fiyatını ne etkiler?</h2>
                        <p>
                            Piyasada yorumcuların en sık dayandığı etkenler aşağıda. Bunlar tahmin değil, çerçevedir; ilişkiler
                            her dönemde aynı şekilde işlemez.
                        </p>
                        <ul>
                            {profile.drivers.map((d) => (
                                <li key={d.t}><strong>{d.t}.</strong> {d.d}</li>
                            ))}
                        </ul>
                    </div>
                </section>
            )}

            <section className="wrap section-tight" aria-labelledby="sss">
                <h2 id="sss" className="h2" style={{ marginBottom: 14 }}>{name} hakkında sık sorulan sorular</h2>
                <div className="stack gap-12" style={{ maxWidth: 860 }}>
                    {faq.map((f) => (
                        <details key={f.q} className="card card-pad">
                            <summary style={{ cursor: "pointer", fontWeight: 700 }}>{f.q}</summary>
                            <p className="small" style={{ marginBottom: 0, marginTop: 10 }}>{f.a}</p>
                        </details>
                    ))}
                </div>
            </section>

            {guides.length > 0 && (
                <section className="wrap section" aria-labelledby="rehber">
                    <h2 id="rehber" className="h2" style={{ marginBottom: 14 }}>Daha fazla öğrenin</h2>
                    <div className="grid-cards">
                        {guides.map((g) => (
                            <Link key={g.slug} href={`/rehber/${g.slug}`} className="card card-hover card-pad link-card">
                                <span className="eyebrow">{g.category}</span>
                                <strong>{g.title}</strong>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

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
                                    {o.leadingCount}/{o.analystCount} {directionWord(o.leading)}
                                </strong>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} />

            <JsonLd
                data={[
                    webPageLd({
                        type: "WebPage",
                        name: `${name} için ekonomistler ne diyor?`,
                        description: assetMetaDescription(asset, item, snapshot.windowDays),
                        path,
                        dateModified: hasSnapshot ? snapshot.generatedAt : undefined,
                        about: [{ name }],
                    }),
                    faqLd(faq),
                ]}
            />
        </>
    );
}
