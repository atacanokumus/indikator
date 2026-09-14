import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";

export const metadata: Metadata = {
    title: "Sözlük — ekonomi yorumlarında geçen terimler",
    description:
        "Ons altın ile gram altın farkı, konsensüs nasıl okunur, vade ne demek, BIST 100 nedir? ECOTUBE'da geçen terimlerin sade karşılıkları.",
    alternates: { canonical: "/sozluk" },
};

interface Term {
    term: string;
    body: string;
    also?: string;
}

/**
 * Elle yazılmış sözlük. Sitedeki tek "insan yazısı" metin burası ve
 * bilinçli olarak öyle: okuyucunun sayfalarımızı anlaması için gereken
 * asgari zemin. Kısa tutuldu — ansiklopedi değil, karşılık listesi.
 */
const GROUPS: { title: string; intro: string; terms: Term[] }[] = [
    {
        title: "Bu sitede geçen kavramlar",
        intro: "Önce ECOTUBE'un kendi diline dair dört madde; sayfalardaki sayıları bunlarsız okumak zor.",
        terms: [
            {
                term: "Konsensüs (sayım)",
                body:
                    "Takip edilen yorumcuların bir varlık hakkındaki en güncel görüşlerinin sayılması. " +
                    "\"7 analistin 4'ü alım yönünde\" cümlesi bir tavsiye değil, bir sayımdır: dört kişinin " +
                    "öyle konuştuğunu söyler, o yönde hareket edilmesi gerektiğini değil.",
                also: "Her analist bir varlık için yalnızca bir kez sayılır; en son ne dediyse o geçerlidir.",
            },
            {
                term: "Vade (kısa, orta, uzun)",
                body:
                    "Bir görüşün hangi zaman aralığı için söylendiği. ECOTUBE'da kısa vade 7 gün, orta vade " +
                    "30 gün, uzun vade 180 gün olarak alınır. İsabet karnesindeki ölçüm de bu sürelere göre " +
                    "yapılır: kısa vadeli bir görüş 7 gün sonraki fiyata bakılarak değerlendirilir.",
            },
            {
                term: "Yatay kalmak",
                body:
                    "Fiyatın, ölçüm penceresi boyunca yüzde 1,5'lik bandın dışına çıkmaması. Karnede bu durum " +
                    "ne \"tuttu\" ne \"tutmadı\" sayılır; ayrı gösterilir. Ölçülen görüşlerin yaklaşık yarısı " +
                    "bu gruba düşüyor — piyasada çoğu zaman kayda değer bir şey olmadığının işareti.",
            },
            {
                term: "Ölçülemeyen görüş",
                body:
                    "Tek bir fiyatı olmayan başlıklar hakkındaki görüşler: \"konut\", \"mevduat\", " +
                    "\"kripto paralar\", \"ABD hisseleri\" gibi. Bunlar isabet karnesinde paydaya girmez, " +
                    "çünkü karşılaştırılacak bir fiyat serisi yoktur.",
            },
        ],
    },
    {
        title: "Altın ve değerli madenler",
        intro: "Ekonomi kanallarında en çok konuşulan başlık; en çok karıştırılan terimler de burada.",
        terms: [
            {
                term: "Ons altın",
                body:
                    "Uluslararası piyasada altının birim fiyatı; bir ons 31,1035 grama denk gelir ve " +
                    "dolar üzerinden işlem görür. \"Ons 4.000 doları gördü\" cümlesi bu fiyatı kasteder.",
            },
            {
                term: "Gram altın",
                body:
                    "Türkiye'de gündelik olarak takip edilen fiyat. Kabaca ons fiyatının grama bölünüp " +
                    "dolar kuruyla çarpılmasıyla bulunur. Bu yüzden gram altın iki sebeple yükselebilir: " +
                    "ons yükseldiği için ya da lira değer kaybettiği için. Bir yorumcu \"altın çıkar\" " +
                    "derken hangisini kastettiği çoğu zaman bu ayrımda gizlidir.",
            },
            {
                term: "XAU/USD",
                body: "Ons altının dolar cinsinden fiyatının piyasa kodu. XAG/USD ise gümüşün karşılığıdır.",
            },
            {
                term: "Çeyrek, yarım, tam altın",
                body:
                    "Ziynet altınları. Fiyatları gram altına bağlıdır ama üzerine işçilik payı eklenir; " +
                    "bu yüzden gram altınla birebir aynı oranda hareket etmezler.",
            },
        ],
    },
    {
        title: "Kur, faiz ve tahvil",
        intro: "",
        terms: [
            {
                term: "USD/TRY",
                body:
                    "Bir doların kaç lira ettiği. Yükselmesi liranın değer kaybettiği anlamına gelir. " +
                    "Kanallarda \"kur\", \"dolar\", \"parite\" adlarıyla da geçer.",
            },
            {
                term: "Parite",
                body:
                    "İki para biriminin birbirine oranı. Türkiye'de çoğunlukla EUR/USD kastedilir; " +
                    "\"paritenin yükselmesi\" euronun dolar karşısında değerlenmesidir.",
            },
            {
                term: "Politika faizi",
                body:
                    "Merkez bankasının belirlediği ve piyasadaki diğer faizlere yön veren temel oran. " +
                    "TCMB için haftalık repo faizi, ABD'de Fed fon oranıdır.",
            },
            {
                term: "Tahvil getirisi",
                body:
                    "Devletin borçlanma senedinin yıllık getirisi. Fiyatı ile getirisi ters yönde hareket " +
                    "eder: tahvil fiyatı düşerse getiri yükselir. ABD 10 yıllık tahvil getirisi (US10Y) " +
                    "küresel piyasaların en çok izlenen tek göstergesidir.",
            },
            {
                term: "Eurobond",
                body:
                    "Bir ülkenin ya da şirketin yabancı para cinsinden çıkardığı tahvil. Türkiye'de " +
                    "genellikle dolar cinsi devlet tahvilleri kastedilir.",
            },
        ],
    },
    {
        title: "Borsa ve hisse",
        intro: "",
        terms: [
            {
                term: "BIST 100 (XU100)",
                body:
                    "Borsa İstanbul'da işlem gören, piyasa değeri ve işlem hacmi en yüksek 100 şirketin " +
                    "oluşturduğu endeks. \"Borsa 14 bini gördü\" cümlesi bu endeksi kasteder.",
            },
            {
                term: "S&P 500",
                body:
                    "ABD'nin en büyük 500 halka açık şirketini kapsayan endeks; küresel hisse piyasasının " +
                    "genel gidişatı için başvurulan ölçüt.",
            },
            {
                term: "Endeks",
                body:
                    "Bir grup varlığın ortalama hareketini tek bir sayıya indiren gösterge. Tek bir " +
                    "şirketin değil, bütünün nasıl gittiğini söyler.",
            },
            {
                term: "VIX",
                body:
                    "ABD hisse piyasasında beklenen oynaklığı ölçen endeks. Yükselmesi, yatırımcıların " +
                    "yakın vadede sert hareket beklediği anlamına gelir; \"korku endeksi\" denmesinin sebebi budur.",
            },
        ],
    },
    {
        title: "Kripto",
        intro: "",
        terms: [
            {
                term: "BTC / ETH",
                body:
                    "Bitcoin ve Ethereum'un piyasa kodları. Kanallar çoğunlukla dolar cinsi fiyatlarını " +
                    "(BTC/USD) konuşur.",
            },
            {
                term: "Halving",
                body:
                    "Bitcoin ağında yaklaşık dört yılda bir gerçekleşen ve yeni üretilen bitcoin miktarını " +
                    "yarıya indiren olay. Arz tarafını etkilediği için yorumlarda sık geçer.",
            },
            {
                term: "ETF",
                body:
                    "Borsada hisse gibi alınıp satılan fon. Bitcoin spot ETF'leri, kripto varlığa doğrudan " +
                    "sahip olmadan yatırım yapmaya imkân verdiği için kurumsal para akışının göstergesi sayılır.",
            },
        ],
    },
];

export default function SozlukPage() {
    return (
        <>
            <section className="wrap" style={{ paddingBlock: "40px 8px", maxWidth: 760 }}>
                <span className="eyebrow">Okuma rehberi</span>
                <h1 className="h1" style={{ fontSize: "clamp(1.7rem, 3.6vw, 2.4rem)", marginTop: 8 }}>
                    Sözlük
                </h1>
                <p className="lead" style={{ marginTop: 12 }}>
                    Ekonomi kanallarında geçen terimlerin sade karşılıkları ve bu sitedeki sayıların
                    nasıl okunacağı. Uzun anlatım yok; her madde bir paragraf.
                </p>
            </section>

            <section className="wrap section" style={{ maxWidth: 820 }}>
                {GROUPS.map((g, gi) => (
                    <div key={g.title} style={{ marginBottom: 36 }}>
                        <h2 className="h2" style={{ fontSize: 20, marginBottom: g.intro ? 6 : 14 }}>
                            {g.title}
                        </h2>
                        {g.intro && (
                            <p className="small" style={{ color: "var(--text-soft)", marginBottom: 14, maxWidth: "64ch" }}>
                                {g.intro}
                            </p>
                        )}
                        <dl className="card" style={{ margin: 0 }}>
                            {g.terms.map((t, i) => (
                                <div key={t.term} style={{
                                    padding: "16px 20px",
                                    borderTop: i === 0 ? "none" : "1px solid var(--border)",
                                }}>
                                    <dt style={{ fontWeight: 700, marginBottom: 6 }}>{t.term}</dt>
                                    <dd style={{ margin: 0 }}>
                                        <p className="small" style={{ color: "var(--text-soft)", lineHeight: 1.65 }}>
                                            {t.body}
                                        </p>
                                        {t.also && (
                                            <p className="tiny" style={{ marginTop: 8 }}>{t.also}</p>
                                        )}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                        {gi === 0 && <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_INFEED} minHeight={120} />}
                    </div>
                ))}

                <div className="card card-pad stack gap-8">
                    <strong>Bir terim eksik mi?</strong>
                    <p className="small" style={{ color: "var(--text-soft)" }}>
                        Kanallarda duyup burada bulamadığınız bir kavram varsa{" "}
                        <Link href="/iletisim">iletişim sayfasından</Link> yazın, listeye ekleyelim.
                        Sitedeki sayıların nasıl hesaplandığını{" "}
                        <Link href="/metodoloji">metodoloji</Link> ve{" "}
                        <Link href="/karne#yontem">isabet karnesi</Link> sayfalarında bulabilirsiniz.
                    </p>
                </div>
            </section>

            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} />
        </>
    );
}
