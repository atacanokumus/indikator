import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { GUIDES, readingMinutes } from "@/content/guides";
import { absoluteUrl, pageMetadata, webPageLd } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
    title: "Ekonomi rehberi: altın, dolar, borsa ve kripto nasıl çalışır?",
    absoluteTitle: true,
    ogTitle: "Ekonomi rehberi — Analist Ne Diyor",
    description:
        "Gram altın nasıl hesaplanır, dolar kurunu ne belirler, BIST 100 nedir, halving ne demek? " +
        "Altın, döviz, borsa ve kripto için sade anlatımlı, tavsiye içermeyen rehber yazıları.",
    path: "/rehber",
});

export default function RehberPage() {
    const byCategory = new Map<string, typeof GUIDES>();
    for (const g of GUIDES) {
        const list = byCategory.get(g.category) ?? [];
        list.push(g);
        byCategory.set(g.category, list);
    }
    const latest = GUIDES.reduce((m, g) => (g.updated > m ? g.updated : m), GUIDES[0].updated);

    return (
        <>
            <section className="hero-band">
                <div className="wrap" style={{ paddingBlock: "30px 26px", maxWidth: 820 }}>
                    <Breadcrumbs items={[{ name: "Rehber", path: "/rehber" }]} />
                    <h1 className="h1" style={{ fontSize: "clamp(1.8rem, 4.2vw, 2.7rem)" }}>
                        Ekonomi rehberi
                    </h1>
                    <p className="lead" style={{ marginTop: 14, maxWidth: "62ch" }}>
                        Videolarda sık duyulan kavramların sade karşılıkları: gram altın nasıl hesaplanır, dolar kurunu ne
                        belirler, BIST 100 nedir, halving ne demek? Her yazı ilgili varlığın güncel görüş sayımına bağlanır.
                        Tavsiye yok, yalnızca açıklama.
                    </p>
                </div>
            </section>

            <section className="wrap section" style={{ maxWidth: 980 }}>
                {[...byCategory.entries()].map(([category, guides]) => (
                    <div key={category} style={{ marginBottom: 36 }}>
                        <h2 className="h2" style={{ marginBottom: 14 }}>{category}</h2>
                        <div className="grid-cards">
                            {guides.map((g) => (
                                <Link key={g.slug} href={`/rehber/${g.slug}`} className="card card-hover card-pad link-card">
                                    <strong>{g.title}</strong>
                                    <span className="small">{g.description}</span>
                                    <span className="tiny">{readingMinutes(g)} dk okuma</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="card card-pad stack gap-8">
                    <strong>Yorumlar yerine sayım mı arıyorsunuz?</strong>
                    <p className="small" style={{ margin: 0 }}>
                        <Link href="/">Ana sayfada</Link> altın, dolar, borsa ve kripto için kaç analistin hangi yönde konuştuğunu,{" "}
                        <Link href="/karne">isabet karnesinde</Link> geçmiş görüşlerin tutup tutmadığını görebilirsiniz.
                    </p>
                </div>
            </section>

            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} />

            <JsonLd
                data={[
                    webPageLd({
                        type: "CollectionPage",
                        name: "Ekonomi rehberi",
                        description: "Altın, döviz, borsa ve kripto için rehber yazıları.",
                        path: "/rehber",
                        dateModified: latest,
                    }),
                    {
                        "@context": "https://schema.org",
                        "@type": "ItemList",
                        itemListElement: GUIDES.map((g, i) => ({
                            "@type": "ListItem",
                            position: i + 1,
                            url: absoluteUrl(`/rehber/${g.slug}`),
                            name: g.title,
                        })),
                    },
                ]}
            />
        </>
    );
}
