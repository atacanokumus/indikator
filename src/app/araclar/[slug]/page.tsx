import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { renderBlock } from "@/components/Blocks";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Calculator } from "@/components/Calculators";
import { JsonLd } from "@/components/JsonLd";
import { getGuide } from "@/content/guides";
import { TOOLS, getTool } from "@/content/tools";
import { assetSeoName } from "@/lib/asset-seo";
import { formatDateTr } from "@/lib/display";
import { pageMetadata, webPageLd } from "@/lib/seo";
import { assetSlug } from "@/lib/slug";

/** Araç listesi sabit: bilinmeyen adres 404 döner, istek başına sayfa üretilmez. */
export const dynamicParams = false;

export function generateStaticParams() {
    return TOOLS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const t = getTool(slug);
    if (!t) return { title: "Araç bulunamadı", robots: { index: false } };
    return pageMetadata({
        title: t.metaTitle,
        absoluteTitle: true,
        description: t.description,
        path: `/araclar/${t.slug}`,
    });
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const t = getTool(slug);
    if (!t) notFound();

    const path = `/araclar/${t.slug}`;
    const guides = t.guides.map((s) => getGuide(s)).filter((g): g is NonNullable<typeof g> => Boolean(g));
    const others = TOOLS.filter((o) => o.slug !== t.slug);

    return (
        <>
            <section className="hero-band">
                <div className="wrap" style={{ paddingBlock: "30px 26px", maxWidth: 820 }}>
                    <Breadcrumbs items={[{ name: "Araçlar", path: "/araclar" }, { name: t.title, path }]} />
                    <span className="eyebrow">Hesaplama aracı</span>
                    <h1 className="h1" style={{ fontSize: "clamp(1.7rem, 4vw, 2.5rem)", marginTop: 10 }}>{t.title}</h1>
                    <p className="lead" style={{ marginTop: 14, maxWidth: "62ch" }}>{t.intro}</p>
                    <p className="tiny" style={{ marginTop: 14 }}>
                        <time dateTime={t.updated}>Güncelleme: {formatDateTr(t.updated)}</time>
                        {" · "}Hesap tarayıcınızda yapılır, girdiğiniz değer saklanmaz
                    </p>
                </div>
            </section>

            <article className="wrap section" style={{ maxWidth: 820 }}>
                <Calculator kind={t.kind} />

                <div className="prose" style={{ marginTop: 28 }}>
                    {t.sections.map((s) => (
                        <section key={s.id} aria-labelledby={s.id}>
                            <h2 id={s.id} className="h2">{s.h2}</h2>
                            {s.blocks.map(renderBlock)}
                        </section>
                    ))}
                </div>

                <section aria-labelledby="sss" style={{ marginTop: 40 }}>
                    <h2 id="sss" className="h2" style={{ marginBottom: 14 }}>Sık sorulan sorular</h2>
                    <div className="stack gap-12" style={{ maxWidth: "70ch" }}>
                        {t.faq.map((f) => (
                            <details key={f.q} className="card card-pad">
                                <summary style={{ cursor: "pointer", fontWeight: 700 }}>{f.q}</summary>
                                <p className="small" style={{ marginBottom: 0, marginTop: 10 }}>{f.a}</p>
                            </details>
                        ))}
                    </div>
                </section>

                {t.assets.length > 0 && (
                    <section aria-labelledby="yorumlar" style={{ marginTop: 40 }}>
                        <h2 id="yorumlar" className="h2" style={{ marginBottom: 14 }}>Bu konuda kim ne diyor?</h2>
                        <div className="row gap-8 wrapflex">
                            {t.assets.map((a) => (
                                <Link key={a} href={`/varlik/${assetSlug(a)}`} className="chip">
                                    {assetSeoName(a)} yorumları
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                <section aria-labelledby="ilgili" style={{ marginTop: 40 }}>
                    <h2 id="ilgili" className="h2" style={{ marginBottom: 14 }}>İlgili yazılar ve araçlar</h2>
                    <div className="grid-cards">
                        {guides.map((g) => (
                            <Link key={g.slug} href={`/rehber/${g.slug}`} className="card card-hover card-pad link-card">
                                <span className="eyebrow">{g.category}</span>
                                <strong>{g.title}</strong>
                                <span className="small">{g.description}</span>
                            </Link>
                        ))}
                        {others.map((o) => (
                            <Link key={o.slug} href={`/araclar/${o.slug}`} className="card card-hover card-pad link-card">
                                <span className="eyebrow">Hesaplama aracı</span>
                                <strong>{o.title}</strong>
                                <span className="small">{o.summary}</span>
                            </Link>
                        ))}
                    </div>
                </section>

                <p className="legal-strip" style={{ marginTop: 40 }}>
                    <strong>Yatırım tavsiyesi değildir.</strong> Bu araç girdiğiniz rakamlarla aritmetik bir sonuç üretir; kişiye özel değildir,
                    bir ürünü ya da işlemi önermez ve yatırım danışmanlığı kapsamında değildir. Sonuç teoriktir; işlem yapacağınız kurumun
                    rakamları farklı olabilir. Hata görürseniz <Link href="/iletisim">bize yazın</Link>.
                </p>
            </article>

            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} />

            <JsonLd
                data={webPageLd({
                    name: t.title,
                    description: t.description,
                    path,
                    dateModified: t.updated,
                })}
            />
        </>
    );
}
