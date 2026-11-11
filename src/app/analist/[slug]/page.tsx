import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { LegalNotice } from "@/components/LegalNotice";
import { RelativeTime } from "@/components/RelativeTime";
import { ReportButton } from "@/components/ReportButton";
import {
    analystSlug,
    analystTallyText,
    analystsFromSnapshot,
    directionWordLower,
    isIndexableAnalyst,
    type AnalystProfile,
} from "@/lib/analyst";
import { assetSeoName } from "@/lib/asset-seo";
import { DIRECTION, DIRECTION_PHRASE, formatDateTr, sayiEki, sayiEkiDe } from "@/lib/display";
import { fitTitle, monthYearTr, pageMetadata, webPageLd } from "@/lib/seo";
import { assetSlug } from "@/lib/slug";
import { getChannelDirectory, getHomeSnapshot } from "@/server/read";

export const revalidate = 300;

export async function generateStaticParams() {
    const snapshot = await getHomeSnapshot();
    return analystsFromSnapshot(snapshot).map((p) => ({ slug: p.slug }));
}

/**
 * Adresten kanalı bulur. Sıra: (1) anlık görüntüde görüşü olan kanal,
 * (2) takip listesinde olup pencere içinde konuşmamış kanal (boş profil),
 * (3) adres kanal kimliği ise ("UC…") kanonik adrese yönlendirme.
 */
async function resolve(slug: string): Promise<{ profile: AnalystProfile; redirect?: string; snapshotOk: boolean; windowDays: number; generatedAt: string; updateFrequency: string } | null> {
    const [snapshot, directory] = await Promise.all([getHomeSnapshot(), getChannelDirectory()]);
    const profiles = analystsFromSnapshot(snapshot);
    const meta = {
        snapshotOk: new Date(snapshot.generatedAt).getFullYear() > 2020,
        windowDays: snapshot.windowDays,
        generatedAt: snapshot.generatedAt,
        updateFrequency: snapshot.updateFrequency,
    };
    const empty = (c: { id: string; title: string; region?: "TR" | "GLOBAL"; thumbnail?: string }): AnalystProfile => ({
        id: c.id, title: c.title, slug: analystSlug(c.title), region: c.region, thumbnail: c.thumbnail,
        views: [], tally: { AL: 0, SAT: 0, TUT: 0, "GÖZLEMLE": 0 }, latestAt: null,
    });

    const hit = profiles.find((p) => p.slug === slug);
    if (hit) return { profile: hit, ...meta };
    const quiet = directory.find((c) => analystSlug(c.title) === slug);
    if (quiet) return { profile: empty(quiet), ...meta };

    const byId = profiles.find((p) => p.id === slug) ?? directory.map(empty).find((p) => p.id === slug);
    if (byId && byId.slug) return { profile: byId, redirect: `/analist/${byId.slug}`, ...meta };
    return null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const r = await resolve(decodeURIComponent(slug));
    if (!r) return { title: "Yorumcu bulunamadı", robots: { index: false } };
    const p = r.profile;
    const when = monthYearTr(r.generatedAt);
    const title = fitTitle(
        `${p.title} yorumları: altın, dolar, borsa için ne dedi? (${when})`,
        `${p.title} yorumları: altın, dolar, borsa için ne dedi?`,
        `${p.title} yorumları: son videolarında ne dedi?`,
        `${p.title} yorumları`
    );
    const description = p.views.length
        ? `${p.title} son ${r.windowDays} günde ${p.views.length} varlık için görüş bildirdi: ${analystTallyText(p.tally)}. ` +
          `Her özet kaynak videoya bağlıdır. Yatırım tavsiyesi değil, söylenenlerin özeti.`
        : `${p.title} kanalının videolarında altın, dolar, borsa ve kripto için bildirdiği görüşlerin özeti. ` +
          `Her özet kaynak videoya bağlıdır. Yatırım tavsiyesi değildir.`;
    return pageMetadata({
        title,
        absoluteTitle: true,
        description,
        path: `/analist/${p.slug}`,
        noindex: !isIndexableAnalyst(p),
    });
}

export default async function AnalystPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const r = await resolve(decodeURIComponent(slug));
    if (!r) notFound();
    if (r.redirect) permanentRedirect(r.redirect);

    const p = r.profile;
    const path = `/analist/${p.slug}`;
    const indexable = isIndexableAnalyst(p);
    const changed = p.views.filter((v) => v.signal.previous && v.signal.previous.recommendation !== v.signal.recommendation);
    const withMajority = p.views.filter((v) => v.consensus.analystCount >= 3);
    const same = withMajority.filter((v) => v.signal.recommendation === v.consensus.leading).length;
    const youtube = `https://www.youtube.com/channel/${p.id}`;

    return (
        <>
            <section className="hero-band">
                <div className="wrap" style={{ paddingBlock: "30px 26px", maxWidth: 860 }}>
                    <Breadcrumbs items={[{ name: "Analistler", path: "/analistler" }, { name: p.title, path }]} />
                    <div className="row gap-12" style={{ alignItems: "center", marginTop: 6 }}>
                        {p.thumbnail && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.thumbnail} alt="" width={52} height={52} className="avatar" />
                        )}
                        <div className="stack gap-4">
                            <span className="eyebrow">
                                {p.region === "TR" ? "Türkiye" : p.region === "GLOBAL" ? "Yabancı kanal" : "YouTube kanalı"}
                            </span>
                            <h1 className="h1" style={{ fontSize: "clamp(1.6rem, 3.8vw, 2.4rem)" }}>
                                {p.title} yorumları
                            </h1>
                        </div>
                    </div>

                    {p.views.length > 0 ? (
                        <p className="lead" style={{ marginTop: 16, maxWidth: "64ch" }}>
                            {p.title}, son {r.windowDays} günde yayımladığı videolarda{" "}
                            <strong>{p.views.length} varlık</strong> için görüş bildirdi: {analystTallyText(p.tally)}.
                            Aşağıda her varlık için en güncel görüşünün özeti ve kaynak videosu yer alıyor.
                        </p>
                    ) : (
                        <p className="lead" style={{ marginTop: 16, maxWidth: "64ch" }}>
                            {r.snapshotOk
                                ? `${p.title}, son ${r.windowDays} günde yayımladığı videolarda takip ettiğimiz varlıklar için net bir yön bildirmedi. Yeni bir görüş bildirdiğinde bu sayfada görünür.`
                                : "Görüş verisi şu an yüklenemiyor. Lütfen biraz sonra yeniden deneyin."}
                        </p>
                    )}

                    <p className="tiny" style={{ marginTop: 14 }}>
                        {p.latestAt && <>Son görüş: {formatDateTr(p.latestAt)} (<RelativeTime iso={p.latestAt} />){" · "}</>}
                        <a href={youtube} target="_blank" rel="noopener noreferrer">YouTube kanalı</a>
                        {" · "}Özetler yapay zeka ile çıkarılır, hata içerebilir
                    </p>
                </div>
            </section>

            {p.views.length > 0 && (
                <section className="wrap section" style={{ maxWidth: 860 }} aria-labelledby="gorusler">
                    <h2 id="gorusler" className="h2" style={{ marginBottom: 6 }}>Hangi varlık için ne dedi?</h2>
                    <p className="small" style={{ margin: "0 0 16px", maxWidth: "64ch" }}>
                        Her varlık için yalnızca en güncel görüş gösterilir. Yön etiketi konuşmacının kendi ifadesinin
                        özetidir; okuyucuya verilmiş bir öneri değildir.
                    </p>

                    <div className="card">
                        {p.views.map((v, i) => {
                            const s = v.signal;
                            const name = assetSeoName(v.asset);
                            const c = v.consensus;
                            return (
                                <article
                                    key={`${v.asset}-${s.videoId}`}
                                    className="stack gap-6"
                                    style={{ padding: "16px 20px", borderTop: i === 0 ? "none" : "1px solid var(--border)" }}
                                >
                                    <div className="between gap-8">
                                        <h3 className="h3" style={{ fontSize: 16 }}>
                                            <Link href={`/varlik/${assetSlug(v.asset)}`} style={{ textDecoration: "none" }}>{name}</Link>
                                        </h3>
                                        <span className={`dir-chip chip-${s.recommendation}`}>{DIRECTION[s.recommendation]}</span>
                                    </div>
                                    <p className="small" style={{ margin: 0 }}>
                                        <strong style={{ color: "var(--text)" }}>{p.title}</strong> {name} için{" "}
                                        {DIRECTION_PHRASE[s.recommendation]}.
                                    </p>
                                    <p className="small" style={{ margin: 0, color: "var(--text-soft)" }}>{s.reasoning}</p>
                                    {s.previous && s.previous.recommendation !== s.recommendation && (
                                        <span className="prev-note">
                                            Önceki görüşü: <s>{DIRECTION[s.previous.recommendation]}</s> ({formatDateTr(s.previous.date)})
                                        </span>
                                    )}
                                    {c.analystCount >= 3 && (
                                        <span className="tiny">
                                            Aynı dönemde {name} için konuşan {c.analystCount} yorumcunun {c.leadingCount}
                                            {sayiEki(c.leadingCount)} {directionWordLower(c.leading)}
                                            {c.leading === "AL" || c.leading === "SAT" ? " konuştu" : " dedi"}.{" "}
                                            <Link href={`/varlik/${assetSlug(v.asset)}`}>Tüm {name} yorumları →</Link>
                                        </span>
                                    )}
                                    <div className="row gap-12 wrapflex" style={{ marginTop: 2 }}>
                                        <span className="tiny">{formatDateTr(s.date)}</span>
                                        <a
                                            className="tiny"
                                            style={{ color: "var(--brand)", fontWeight: 650 }}
                                            href={`https://www.youtube.com/watch?v=${s.videoId}${s.startSeconds ? `&t=${Math.floor(s.startSeconds)}s` : ""}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Videoda dinle: {s.videoTitle} →
                                        </a>
                                        <ReportButton videoId={s.videoId} asset={v.asset} channelTitle={p.title} />
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </section>
            )}

            {indexable && <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_INFEED} minHeight={120} />}

            {p.views.length > 0 && (
                <section className="wrap section-tight" style={{ maxWidth: 860 }} aria-labelledby="ozet">
                    <h2 id="ozet" className="h2" style={{ marginBottom: 12 }}>Görüşlerin özeti</h2>
                    <div className="prose">
                        <ul>
                            <li>
                                <strong>Dağılım:</strong> {analystTallyText(p.tally)}.
                            </li>
                            {withMajority.length > 0 && (
                                <li>
                                    <strong>Diğer yorumcularla karşılaştırma:</strong> en az üç yorumcunun konuştuğu{" "}
                                    {withMajority.length} varlığın {same}{sayiEkiDe(same)} {p.title}, en çok dile getirilen
                                    yönle aynı yönde konuştu; {withMajority.length - same} varlıkta farklı bir yön bildirdi.
                                    Çoğunlukla aynı ya da farklı düşünmek, görüşün doğru ya da yanlış olduğunu göstermez.
                                </li>
                            )}
                            <li>
                                <strong>Görüş değişikliği:</strong>{" "}
                                {changed.length > 0
                                    ? <>{changed.length} varlıkta kayıtlı önceki görüşünden farklı bir yön bildirdi ({changed.slice(0, 6).map((v) => assetSeoName(v.asset)).join(", ")}{changed.length > 6 ? " ve diğerleri" : ""}).</>
                                    : "listelenen varlıklarda kayıtlı bir önceki görüşünden farklı yön bildirmedi."}
                            </li>
                        </ul>
                        <p>
                            Bu sayfada isabet oranı ya da puan gösterilmez. Geçmiş görüşlerin fiyat verisiyle nasıl
                            karşılaştırıldığını ve bu ölçümün sınırlarını <Link href="/karne">isabet karnesi</Link> ve{" "}
                            <Link href="/metodoloji">metodoloji</Link> sayfalarında okuyabilirsiniz. Takip edilen tüm kanallar{" "}
                            <Link href="/analistler">analistler</Link> sayfasındadır.
                        </p>
                    </div>
                </section>
            )}

            <section className="wrap section-tight" style={{ maxWidth: 860 }} aria-labelledby="nasil">
                <h2 id="nasil" className="h2" style={{ marginBottom: 12 }}>Bu sayfa nasıl hazırlanıyor?</h2>
                <div className="prose">
                    <p>
                        {p.title} kanalı yeni bir video yayımladığında videonun altyazısı yapay zekaya okutulur ve konuşmacının
                        bir varlık için net yön bildirdiği yerler kısa bir özetle kaydedilir. Video ya da ses indirilmez,
                        sözler birebir aktarılmaz. Kanalda birden fazla kişi konuşuyorsa (konuklu yayınlar, podcast&apos;ler)
                        görüş, kanalın adıyla kaydedilir; kimin söylediğini kaynak videodan teyit edin.
                    </p>
                    <p>
                        Analist Ne Diyor&apos;un {p.title} ile ticari bir ilişkisi yoktur; bu sayfa kanal tarafından
                        hazırlanmamıştır. <strong>Kanalın sahibiyseniz</strong> ve bir özetin videonuzu yanlış yansıttığını
                        düşünüyorsanız ilgili özetin altındaki &ldquo;Bu özet yanlış&rdquo; bağlantısını kullanabilir, kanalınızın
                        listeden çıkarılmasını istiyorsanız <Link href="/kaldirma">içerik kaldırma</Link> sayfasındaki yolu
                        izleyebilirsiniz.
                    </p>
                </div>
            </section>

            <section className="wrap section-tight" style={{ maxWidth: 860 }}>
                <LegalNotice updateFrequency={r.updateFrequency} generatedAt={r.generatedAt} />
            </section>

            {indexable && <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} />}

            <JsonLd
                data={webPageLd({
                    name: `${p.title} yorumları`,
                    description: `${p.title} kanalının videolarında bildirdiği görüşlerin özeti.`,
                    path,
                    dateModified: p.latestAt ?? undefined,
                    about: [{ name: p.title }],
                })}
            />
        </>
    );
}
