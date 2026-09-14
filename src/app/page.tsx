import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { NewsTicker } from "@/components/NewsTicker";
import { SignalExplorer } from "@/components/SignalExplorer";
import { SpotlightCard } from "@/components/SpotlightCard";
import { assetLabel, relativeTime, SPOTLIGHT_ASSETS } from "@/lib/display";
import { LegalNotice } from "@/components/LegalNotice";
import { getHomeSnapshot } from "@/server/read";

export const revalidate = 60;

export const metadata: Metadata = {
    title: "Altın, dolar, borsa ve kriptoda analistler ne diyor?",
    description:
        "YouTube'daki ekonomi yorumcularının son videolarını yapay zeka ile analiz ediyoruz. Altın, dolar, BIST 100 ve Bitcoin için kimin ne dediğini tek ekranda görün.",
    alternates: { canonical: "/" },
};

export default async function HomePage() {
    const snapshot = await getHomeSnapshot();
    const { consensus } = snapshot;

    const byAsset = new Map(consensus.map((c) => [c.asset, c]));
    const spotlight = SPOTLIGHT_ASSETS.map((a) => byAsset.get(a)).filter(Boolean) as typeof consensus;
    // Öne çıkanlar boşsa en çok konuşulan 4 varlıkla doldur
    const hero = spotlight.length >= 3 ? spotlight : consensus.slice(0, 4);

    const hasData = consensus.length > 0;

    return (
        <>
            {/* ---------------- Giriş ---------------- */}
            <section className="hero-band"><div className="wrap" style={{ paddingBlock: "46px 10px" }}>
                <div style={{ maxWidth: 660 }}>
                    <p className="eyebrow" style={{ marginBottom: 12 }}>
                        {hasData
                            ? `${snapshot.analystCount} yorumcu · son ${snapshot.windowDays} gün · ${snapshot.videoCount} video`
                            : "Yapay zeka destekli sinyal takibi"}
                    </p>
                    <h1 className="h1">
                        Ekonomistler <span style={{ color: "var(--brand)" }}>ne diyor?</span>
                    </h1>
                    <p className="lead" style={{ marginTop: 14 }}>
                        YouTube&apos;daki ekonomi yorumcularının son videolarını okuyup,
                        hangi varlıkta kaç kişinin <strong>alım</strong>, <strong>satış</strong> ya da
                        {" "}<strong>bekleme</strong> yönünde konuştuğunu sayıyoruz. Tavsiye vermiyoruz —
                        sayıyoruz. Yorum size ait.
                    </p>

                    {snapshot.lastVideoAt && (
                        <p className="tiny row gap-6" style={{ marginTop: 14 }}>
                            <span className="pulse-dot" style={{ color: "var(--al)" }} />
                            Son analiz edilen video: {relativeTime(snapshot.lastVideoAt)}
                        </p>
                    )}
                </div>
            </div></section>

            {/* ---------------- Hemen cevap: öne çıkan varlıklar ---------------- */}
            {hero.length > 0 && (
                <section className="wrap section-tight" aria-labelledby="one-cikanlar">
                    <h2 id="one-cikanlar" className="sr-only">Öne çıkan varlıklar</h2>
                    <div className="grid-spot">
                        {hero.map((item) => <SpotlightCard key={item.asset} item={item} />)}
                    </div>
                </section>
            )}

            <NewsTicker />
            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP} />

            {/* ---------------- Tüm sinyaller ---------------- */}
            <section className="wrap section" aria-labelledby="tum-sinyaller">
                <div className="between wrapflex" style={{ marginBottom: 18 }}>
                    <div>
                        <h2 id="tum-sinyaller" className="h2">Tüm varlıklar</h2>
                        <p className="small" style={{ margin: "4px 0 0" }}>
                            Her varlık için, kaç analistin hangi yönde konuştuğunun sayımı.
                        </p>
                    </div>
                    <Link href="/konsensus" className="btn btn-ghost">Tüm sayım tablosu →</Link>
                </div>

                {hasData ? (
                    <SignalExplorer items={consensus} />
                ) : (
                    <div className="card card-pad stack gap-8" style={{ textAlign: "center", paddingBlock: 56 }}>
                        <strong>Henüz sinyal yok</strong>
                        <span className="small">
                            Takip edilen kanallar yeni video yayınladığı anda analiz edilir ve burada görünür.
                        </span>
                    </div>
                )}
            </section>

            {/* ---------------- Nasıl çalışır (SEO + AdSense için gerçek içerik) ---------------- */}
            <section className="wrap section" aria-labelledby="nasil-calisir">
                <h2 id="nasil-calisir" className="h2" style={{ marginBottom: 18 }}>Nasıl çalışıyor?</h2>
                <div className="grid-spot" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
                    {[
                        {
                            t: "1 · Video yayınlanır",
                            d: "Takip ettiğimiz ekonomi kanallarından biri video yüklediği anda YouTube bize bildirim gönderir.",
                        },
                        {
                            t: "2 · Yapay zeka dinler",
                            d: "Videonun transkripti (yoksa sesi) yapay zeka ile okunur; konuşmacının hangi varlık için ne dediği çıkarılır.",
                        },
                        {
                            t: "3 · Yön etiketlenir",
                            d: "Konuşmacının o varlık için hangi yönde konuştuğu (alım, satış, bekleme, gözlem) ve kısa gerekçesi kaydedilir.",
                        },
                        {
                            t: "4 · Sayım yapılır",
                            d: "Aynı varlık için konuşan yorumcular sayılır: kaçı alım, kaçı satış, kaçı bekleme yönünde. Bu sayım size gösterilir.",
                        },
                    ].map((s) => (
                        <div key={s.t} className="card card-pad stack gap-8">
                            <strong className="h3">{s.t}</strong>
                            <p className="small" style={{ margin: 0 }}>{s.d}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ---------------- Sık sorulanlar ---------------- */}
            <section className="wrap section" aria-labelledby="sss">
                <h2 id="sss" className="h2" style={{ marginBottom: 18 }}>Sık sorulan sorular</h2>
                <div className="stack gap-12" style={{ maxWidth: 760 }}>
                    {FAQ.map((f) => (
                        <details key={f.q} className="card card-pad">
                            <summary style={{ cursor: "pointer", fontWeight: 700 }}>{f.q}</summary>
                            <p className="small" style={{ marginBottom: 0, marginTop: 10 }}>{f.a}</p>
                        </details>
                    ))}
                </div>
            </section>

            {/* ---------------- Yasal uyarı (Tebliğ m.79) ---------------- */}
            <section className="wrap section-tight">
                <LegalNotice
                    updateFrequency={snapshot.updateFrequency}
                    generatedAt={snapshot.generatedAt}
                />
            </section>

            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} />

            <FaqJsonLd />
            {hasData && <ItemListJsonLd items={hero.map((h) => assetLabel(h.asset))} />}
        </>
    );
}

/* ------------------------------------------------------------------ */

const FAQ = [
    {
        q: "Sinyaller nereden geliyor?",
        a: "Takip listemizdeki YouTube ekonomi kanallarının videolarından. Videonun transkripti yapay zekaya okutulur ve konuşmacının bir varlık için net görüş bildirdiği yerler işaretlenir. Sinyal bize değil, videodaki yorumcuya aittir.",
    },
    {
        q: "Ne sıklıkla güncelleniyor?",
        a: "Takip edilen bir kanal video yayınladığı anda YouTube bize bildirim gönderir ve video birkaç dakika içinde analiz edilir. Ayrıca gün boyunca düzenli kontroller yapılır, böylece kaçan video kalmaz.",
    },
    {
        q: "Sayım nasıl yapılıyor?",
        a: "Bir varlık için her yorumcunun yalnızca en güncel görüşü sayılır; aynı kişi iki kez sayılmaz. Sonuç bir ortalama veya puan değil, düz bir sayımdır: kaç kişi hangi yönde konuşmuş. Analist Ne Diyor bu sayıya kendi görüşünü katmaz.",
    },
    {
        q: "Analistlerin başarı oranı neye göre ölçülüyor?",
        a: "Her sinyal kaydedilirken varlığın o anki fiyatı da saklanır. Sinyalin vadesi dolduğunda (kısa 7 gün, orta 30 gün, uzun 180 gün) fiyat tekrar ölçülür ve sinyalin yönü tutup tutmadığına bakılır.",
    },
    {
        q: "Bu bir yatırım tavsiyesi mi?",
        a: "Hayır. Analist Ne Diyor size ne yapmanız gerektiğini söylemez, size başkalarının ne dediğini sayarak gösterir. Yatırım danışmanlığı, yetkili kuruluşların kişiye özel sunduğu bir hizmettir; buradaki içerik kişiye özel değildir ve genel niteliktedir.",
    },
];

function FaqJsonLd() {
    const json = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQ.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
    };
    return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}

function ItemListJsonLd({ items }: { items: string[] }) {
    const json = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Öne çıkan varlıklar",
        itemListElement: items.map((name, i) => ({ "@type": "ListItem", position: i + 1, name })),
    };
    return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}

