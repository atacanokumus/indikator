import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { TOOLS } from "@/content/tools";
import { absoluteUrl, pageMetadata, webPageLd } from "@/lib/seo";

const DESCRIPTION =
    "Gram altın, mevduat faizi ve reel getiri hesaplama araçları. Rakamı siz girersiniz, hesap tarayıcınızda yapılır; " +
    "formül ve varsayımlar her aracın altında açıkça yazılıdır.";

export const metadata: Metadata = pageMetadata({
    title: "Hesaplama araçları: gram altın, mevduat faizi, reel getiri",
    absoluteTitle: true,
    ogTitle: "Hesaplama araçları — Analist Ne Diyor",
    description: DESCRIPTION,
    path: "/araclar",
});

export default function AraclarPage() {
    const latest = TOOLS.reduce((m, t) => (t.updated > m ? t.updated : m), TOOLS[0].updated);

    return (
        <>
            <section className="hero-band">
                <div className="wrap" style={{ paddingBlock: "30px 26px", maxWidth: 820 }}>
                    <Breadcrumbs items={[{ name: "Araçlar", path: "/araclar" }]} />
                    <h1 className="h1" style={{ fontSize: "clamp(1.8rem, 4.2vw, 2.7rem)" }}>Hesaplama araçları</h1>
                    <p className="lead" style={{ marginTop: 14, maxWidth: "62ch" }}>
                        Videolarda geçen hesapları kendi rakamınızla yapın: gram altının ons ve kurdan nasıl türediğini,
                        mevduatta stopajdan sonra elinize ne geçtiğini, bir getirinin enflasyon karşısında ne ifade ettiğini görün.
                    </p>
                </div>
            </section>

            <section className="wrap section" style={{ maxWidth: 980 }}>
                <div className="grid-cards">
                    {TOOLS.map((t) => (
                        <Link key={t.slug} href={`/araclar/${t.slug}`} className="card card-hover card-pad link-card">
                            <strong>{t.title}</strong>
                            <span className="small">{t.summary}</span>
                        </Link>
                    ))}
                </div>

                <div className="prose" style={{ marginTop: 40 }}>
                    <h2 className="h2">Bu araçlar nasıl çalışır?</h2>
                    <ul>
                        <li>
                            <strong>Rakamı siz girersiniz.</strong> Fiyat, faiz ve vergi oranları sürekli değişir; eskimiş bir ön tanımlı
                            değer yanlış sonuç verir. Bu yüzden alanlar boş gelir.
                        </li>
                        <li>
                            <strong>Hesap tarayıcınızda yapılır.</strong> Girdiğiniz değerler sunucuya gönderilmez, saklanmaz.
                        </li>
                        <li>
                            <strong>Formül gizli değildir.</strong> Her aracın altında kullanılan formül, varsayımlar ve sonucun
                            gerçek hayattaki rakamdan neden farklı çıkabileceği yazılıdır.
                        </li>
                        <li>
                            <strong>Araç sonuç verir, karar vermez.</strong> Hiçbir araç bir ürünü ya da işlemi önermez; kavramların
                            açıklaması için <Link href="/rehber">ekonomi rehberine</Link>, terimler için{" "}
                            <Link href="/sozluk">sözlüğe</Link> bakabilirsiniz.
                        </li>
                    </ul>
                </div>
            </section>

            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} />

            <JsonLd
                data={[
                    webPageLd({
                        type: "CollectionPage",
                        name: "Hesaplama araçları",
                        description: DESCRIPTION,
                        path: "/araclar",
                        dateModified: latest,
                    }),
                    {
                        "@context": "https://schema.org",
                        "@type": "ItemList",
                        itemListElement: TOOLS.map((t, i) => ({
                            "@type": "ListItem",
                            position: i + 1,
                            url: absoluteUrl(`/araclar/${t.slug}`),
                            name: t.title,
                        })),
                    },
                ]}
            />
        </>
    );
}
