import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { renderBlock } from "@/components/Blocks";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { SpotlightCard } from "@/components/SpotlightCard";
import { sourcesForGuide } from "@/content/guide-sources";
import { GUIDES, getGuide, guideWordCount, readingMinutes } from "@/content/guides";
import { toolsForGuide } from "@/content/tools";
import { assetLabel, formatDateTr } from "@/lib/display";
import { articleLd, faqLd, pageMetadata } from "@/lib/seo";
import { assetSlug } from "@/lib/slug";
import { getHomeSnapshot } from "@/server/read";

export const revalidate = 300;

export function generateStaticParams() {
    return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const g = getGuide(slug);
    if (!g) return { title: "Yazı bulunamadı", robots: { index: false } };
    return pageMetadata({
        ownImage: true,
        title: g.metaTitle,
        absoluteTitle: true,
        description: g.description,
        path: `/rehber/${g.slug}`,
        type: "article",
        publishedTime: g.published,
        modifiedTime: g.updated,
    });
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const g = getGuide(slug);
    if (!g) notFound();

    const snapshot = await getHomeSnapshot();
    const live = g.assets
        .map((a) => snapshot.consensus.find((c) => c.asset === a))
        .filter((c): c is NonNullable<typeof c> => Boolean(c));
    const noData = g.assets.filter((a) => !snapshot.consensus.some((c) => c.asset === a));
    const related = g.related.map((s) => getGuide(s)).filter((x): x is NonNullable<typeof x> => Boolean(x));
    const minutes = readingMinutes(g);
    const sources = sourcesForGuide(g.slug);
    const tools = toolsForGuide(g.slug);
    const path = `/rehber/${g.slug}`;

    return (
        <>
            <section className="hero-band">
                <div className="wrap" style={{ paddingBlock: "30px 26px", maxWidth: 820 }}>
                    <Breadcrumbs items={[{ name: "Rehber", path: "/rehber" }, { name: g.title, path }]} />
                    <span className="eyebrow">{g.category}</span>
                    <h1 className="h1" style={{ fontSize: "clamp(1.7rem, 4vw, 2.5rem)", marginTop: 10 }}>
                        {g.title}
                    </h1>
                    <p className="lead" style={{ marginTop: 14, maxWidth: "62ch" }}>{g.intro}</p>
                    <p className="tiny" style={{ marginTop: 14 }}>
                        <time dateTime={g.updated}>Güncelleme: {formatDateTr(g.updated)}</time>
                        {" · "}{minutes} dk okuma{" · "}<Link href="/hakkimizda#nasil-hazirlaniyor">Analist Ne Diyor editörlüğü</Link>
                    </p>
                </div>
            </section>

            <article className="wrap section" style={{ maxWidth: 820 }}>
                <nav className="card card-pad toc" aria-label="Bu yazıda">
                    <strong className="small" style={{ color: "var(--text)" }}>Bu yazıda</strong>
                    <ol>
                        {g.sections.map((s) => (
                            <li key={s.id}><a href={`#${s.id}`}>{s.h2}</a></li>
                        ))}
                        {g.faq.length > 0 && <li><a href="#sss">Sık sorulan sorular</a></li>}
                        {sources.length > 0 && <li><a href="#kaynaklar">Kaynaklar ve güncel veriler</a></li>}
                    </ol>
                </nav>

                <div className="prose" style={{ marginTop: 28 }}>
                    {g.sections.map((s, si) => (
                        <section key={s.id} aria-labelledby={s.id}>
                            <h2 id={s.id} className="h2">{s.h2}</h2>
                            {s.blocks.map(renderBlock)}
                            {si === 0 && <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_INFEED} minHeight={120} />}
                        </section>
                    ))}
                </div>

                {tools.length > 0 && (
                    <section aria-labelledby="arac" style={{ marginTop: 40 }}>
                        <h2 id="arac" className="h2" style={{ marginBottom: 14 }}>Kendi rakamınızla hesaplayın</h2>
                        <div className="grid-cards">
                            {tools.map((t) => (
                                <Link key={t.slug} href={`/araclar/${t.slug}`} className="card card-hover card-pad link-card">
                                    <span className="eyebrow">Hesaplama aracı</span>
                                    <strong>{t.title}</strong>
                                    <span className="small">{t.summary}</span>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Canlı veri: evergreen yazıya taze, sayfaya özgü içerik katar. */}
                {(live.length > 0 || noData.length > 0) && (
                    <section aria-labelledby="canli" style={{ marginTop: 40 }}>
                        <h2 id="canli" className="h2" style={{ marginBottom: 6 }}>Şimdi bu konuda kim ne diyor?</h2>
                        <p className="small" style={{ margin: "0 0 14px", maxWidth: "62ch" }}>
                            Son {snapshot.windowDays} günde takip ettiğimiz YouTube ekonomi yorumcularının konuyla ilgili
                            varlıklardaki görüş sayımı. Bu bir öneri değil, sayımdır.
                        </p>
                        {live.length > 0 && (
                            <div className="grid-spot">
                                {live.map((item) => <SpotlightCard key={item.asset} item={item} />)}
                            </div>
                        )}
                        {noData.length > 0 && (
                            <div className="row gap-8 wrapflex" style={{ marginTop: live.length ? 14 : 0 }}>
                                {noData.map((a) => (
                                    <Link key={a} href={`/varlik/${assetSlug(a)}`} className="chip">{assetLabel(a)}</Link>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {g.faq.length > 0 && (
                    <section aria-labelledby="sss" style={{ marginTop: 40 }}>
                        <h2 id="sss" className="h2" style={{ marginBottom: 14 }}>Sık sorulan sorular</h2>
                        <div className="stack gap-12" style={{ maxWidth: "70ch" }}>
                            {g.faq.map((f) => (
                                <details key={f.q} className="card card-pad">
                                    <summary style={{ cursor: "pointer", fontWeight: 700 }}>{f.q}</summary>
                                    <p className="small" style={{ marginBottom: 0, marginTop: 10 }}>{f.a}</p>
                                </details>
                            ))}
                        </div>
                    </section>
                )}

                {sources.length > 0 && (
                    <section aria-labelledby="kaynaklar" style={{ marginTop: 40 }}>
                        <h2 id="kaynaklar" className="h2" style={{ marginBottom: 6 }}>Kaynaklar ve güncel veriler</h2>
                        <p className="small" style={{ margin: "0 0 14px", maxWidth: "62ch" }}>
                            Bu yazı bilerek güncel fiyat ve oran vermez. Tanımları ve güncel rakamları, veriyi üreten ya da
                            kuralı koyan kurumdan teyit edebilirsiniz:
                        </p>
                        <ul className="sources">
                            {sources.map((src) => (
                                <li key={src.url}>
                                    <a href={src.url} target="_blank" rel="noopener noreferrer">{src.name}</a>
                                    {": "}{src.note}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {related.length > 0 && (
                    <section aria-labelledby="ilgili" style={{ marginTop: 40 }}>
                        <h2 id="ilgili" className="h2" style={{ marginBottom: 14 }}>İlgili yazılar</h2>
                        <div className="grid-cards">
                            {related.map((r) => (
                                <Link key={r.slug} href={`/rehber/${r.slug}`} className="card card-hover card-pad link-card">
                                    <span className="eyebrow">{r.category}</span>
                                    <strong>{r.title}</strong>
                                    <span className="small">{r.description}</span>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                <p className="legal-strip" style={{ marginTop: 40 }}>
                    <strong>Yatırım tavsiyesi değildir.</strong> Bu yazı genel bilgilendirme amacıyla hazırlanmıştır; kişiye özel değildir
                    ve yatırım danışmanlığı kapsamında değildir. Rakamlar yalnızca örnektir. Hata görürseniz{" "}
                    <Link href="/iletisim">bize yazın</Link>; yöntemimiz için <Link href="/metodoloji">metodoloji</Link> sayfasına bakın.
                </p>
            </article>

            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} />

            <JsonLd
                data={[
                    articleLd({
                        headline: g.title,
                        description: g.description,
                        path,
                        datePublished: g.published,
                        dateModified: g.updated,
                        section: g.category,
                        wordCount: guideWordCount(g),
                        personAuthor: true,
                    }),
                    ...(g.faq.length ? [faqLd(g.faq)] : []),
                ]}
            />
        </>
    );
}
