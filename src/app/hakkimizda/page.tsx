import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { GUIDES } from "@/content/guides";
import { HAS_PUBLISHER, PUBLISHER } from "@/content/publisher";
import { TOOLS } from "@/content/tools";
import { PROFILED_ASSETS } from "@/content/assets";
import { pageMetadata, webPageLd } from "@/lib/seo";
import { getHomeSnapshot } from "@/server/read";

export const revalidate = 3600;

const DESCRIPTION =
    "Analist Ne Diyor nedir, kim için var, neyi yayımlar? Verilerin kaynağı, yapay zekanın kullanıldığı yer, " +
    "gelir modeli, yayın ilkeleri ve hataların nasıl düzeltildiği.";

export const metadata: Metadata = pageMetadata({
    title: "Hakkımızda ve yayın ilkeleri",
    description: DESCRIPTION,
    path: "/hakkimizda",
});

const EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "iletisim@analistnediyor.com";

export default async function HakkimizdaPage() {
    // Veri okunamazsa boş anlık görüntü döner (1970); o durumda rakam cümlesi hiç yazılmaz.
    const snapshot = await getHomeSnapshot().catch(() => null);
    const hasData = Boolean(snapshot && new Date(snapshot.generatedAt).getFullYear() > 2020 && snapshot.analystCount > 0);

    return (
        <article className="wrap section" style={{ maxWidth: 720 }}>
            <Breadcrumbs items={[{ name: "Hakkımızda", path: "/hakkimizda" }]} />
            <h1 className="h1" style={{ fontSize: "clamp(1.7rem, 3.6vw, 2.3rem)" }}>Hakkımızda</h1>

            <p className="lead" style={{ marginTop: 16 }}>
                Analist Ne Diyor, Türkiye&apos;den ve dünyadan YouTube ekonomi yorumcularının ne dediğini takip etmeyi
                kolaylaştırmak için kurulmuş bağımsız bir araştırma aracıdır.
            </p>

            <h2 className="h2" style={{ marginTop: 34 }}>Neden var?</h2>
            <p className="small">
                Bir yatırımcının merak ettiği soru genelde basittir: &ldquo;Şu an altın için ne diyorlar?&rdquo;
                Cevabı bulmak içinse onlarca kanalda, saatlerce video izlemek gerekir. Analist Ne Diyor bu işi
                otomatikleştirir: videoları okur, yorumcunun hangi varlık için ne söylediğini çıkarır ve
                hepsini tek tabloda toplar.
            </p>
            <p className="small" style={{ marginTop: 10 }}>
                İkinci soru daha az sorulur ama daha önemlidir: &ldquo;Geçen sefer söyledikleri tuttu mu?&rdquo;
                Video platformlarında bir görüş yayımlandıktan sonra kimse dönüp sonucuna bakmaz. Biz her görüşü
                tarihiyle ve o günkü fiyatla kaydediyor, vadesi dolduğunda fiyatı yeniden ölçüyoruz.
            </p>

            <h2 id="ne-yayimliyoruz" className="h2" style={{ marginTop: 34 }}>Ne yayımlıyoruz?</h2>
            <ul className="small">
                <li>
                    <strong><Link href="/konsensus">Görüş sayımı</Link>:</strong> her varlık için kaç yorumcunun alım, satış,
                    bekle ya da gözlemle yönünde konuştuğu. Ortalama ya da puan değil, düz sayım.
                </li>
                <li>
                    <strong><Link href="/karne">İsabet karnesi</Link>:</strong> geçmiş görüşlerin, vadesi dolduğunda fiyat
                    verisiyle karşılaştırılması. Yöntemi ve sınırları aynı sayfada yazılıdır.
                </li>
                <li>
                    <strong><Link href="/bulten">Haftalık bülten</Link>:</strong> bir haftadan diğerine hangi varlıkta baskın
                    yönün döndüğü, kimin görüş değiştirdiği.
                </li>
                <li>
                    <strong><Link href="/rehber">Ekonomi rehberi</Link>:</strong> videolarda geçen kavramları açıklayan{" "}
                    {GUIDES.length} yazı. Her yazının altında dayandığı resmî kaynaklar ve son güncelleme tarihi bulunur.
                </li>
                <li>
                    <strong><Link href="/araclar">Hesaplama araçları</Link>:</strong> gram altın, mevduat faizi ve reel getiri
                    gibi hesapları kendi rakamınızla yapabileceğiniz {TOOLS.length} araç.
                </li>
                <li>
                    <strong><Link href="/sozluk">Sözlük</Link>:</strong> yorumlarda sık geçen terimlerin kısa tanımları.
                </li>
            </ul>
            {hasData && snapshot && (
                <p className="small" style={{ marginTop: 10 }}>
                    Şu an sayımda son {snapshot.windowDays} günde görüş bildiren {snapshot.analystCount} yorumcu
                    {snapshot.videoCount > 0 ? ` ve analiz edilen ${snapshot.videoCount} video` : ""} yer alıyor;{" "}
                    {PROFILED_ASSETS.length} varlığın ayrı bir sayfası var. Takip edilen kanalların tamamı{" "}
                    <Link href="/analistler">analistler sayfasında</Link> listelenir.
                </p>
            )}

            {HAS_PUBLISHER && (
                <>
                    <h2 id="kim-yapiyor" className="h2" style={{ marginTop: 34 }}>Siteyi kim yapıyor?</h2>
                    <p className="small">
                        <strong>{PUBLISHER.name}</strong>
                        {PUBLISHER.role ? `, ${PUBLISHER.role}. ` : ". "}
                        {PUBLISHER.bio}
                    </p>
                    {PUBLISHER.links.length > 0 && (
                        <p className="small" style={{ marginTop: 10 }}>
                            {PUBLISHER.links.map((l, i) => (
                                <span key={l.url}>
                                    {i > 0 && " · "}
                                    <a href={l.url} target="_blank" rel="noopener noreferrer me">{l.label}</a>
                                </span>
                            ))}
                        </p>
                    )}
                </>
            )}

            <h2 id="nasil-hazirlaniyor" className="h2" style={{ marginTop: 34 }}>İçerik nasıl hazırlanıyor?</h2>
            <p className="small">Sitede iki ayrı türde içerik vardır ve ikisi farklı yollarla üretilir:</p>
            <ul className="small">
                <li>
                    <strong>Otomatik sayım.</strong> Takip edilen kanal yeni bir video yayımladığında videonun altyazısı
                    yapay zekaya okutulur; konuşmacının bir varlık için net yön bildirdiği yerler etiketlenir ve en fazla
                    birkaç cümlelik bir özetle kaydedilir. Video ya da ses dosyası indirilmez, altyazı metni saklanmaz.
                    Her özetin yanında kaynak videonun bağlantısı ve &ldquo;Bu özet yanlış&rdquo; düğmesi bulunur.
                </li>
                <li>
                    <strong>Editoryal içerik.</strong> Rehber yazıları, varlık sayfalarındaki &ldquo;nedir, fiyatını ne
                    etkiler&rdquo; bölümleri, sözlük ve hesaplama araçları videolardan türetilmez; sabit metinlerdir.
                    Bu metinlerde güncel fiyat ve oran verilmez, örnek rakamlar &ldquo;örnek&rdquo; diye etiketlenir ve
                    tartışmalı ilişkiler kesin hüküm olarak yazılmaz.
                </li>
            </ul>
            <p className="small" style={{ marginTop: 10 }}>
                Sayımın adım adım nasıl yapıldığı, hangi durumlarda yanılabileceği ve isabetin nasıl ölçüldüğü{" "}
                <Link href="/metodoloji">metodoloji</Link> sayfasında anlatılır.
            </p>

            <h2 className="h2" style={{ marginTop: 34 }}>Veriler nereden geliyor?</h2>
            <ul className="small">
                <li>Sinyaller: takip edilen kanalların kamuya açık YouTube videolarından.</li>
                <li>Fiyatlar: Yahoo Finance, Binance ve CoinGecko gibi halka açık veri kaynaklarından.</li>
                <li>Haberler: ilgili yayıncıların kendi RSS akışlarından; başlıklar kaynağa bağlantılıdır.</li>
            </ul>

            <h2 className="h2" style={{ marginTop: 34 }}>Neyi vaat etmiyoruz</h2>
            <p className="small">
                Analist Ne Diyor yatırım tavsiyesi vermez, portföy önermez, alım satım yapmaz ve hiçbir yorumcuyu
                desteklemez ya da eleştirmez. Gösterilen her sinyal, videodaki kişinin kendi ifadesinin
                yapay zeka ile çıkarılmış özetidir; yapay zeka hata yapabilir, bağlam kaybolabilir.
                Karar sizindir.
            </p>

            <h2 id="yayin-ilkeleri" className="h2" style={{ marginTop: 34 }}>Yayın ilkeleri</h2>
            <ul className="small">
                <li>
                    <strong>Bağımsızlık:</strong> Analist Ne Diyor, adı geçen hiçbir yorumcu, kuruluş ya da
                    ihraççıyla ticari ilişki içinde değildir. Hiçbir yorumcu sayımda yer almak için ödeme yapmaz,
                    hiçbir yorumcu ödeme karşılığı öne çıkarılmaz.
                </li>
                <li>
                    <strong>Gelir modeli:</strong> Site gelirini yalnızca görüntülenen reklamlardan elde eder. Reklam
                    verenlerin sayıma ve içeriğe etkisi yoktur.
                </li>
                <li>
                    <strong>Tavsiye vermeyiz:</strong> Site kendi görüşünü üretmez ve yorumcuları ağırlıklandırmaz;
                    yalnızca &ldquo;kaç kişi hangi yönde konuştu&rdquo; sorusunu sayar. Ayrıntı için{" "}
                    <Link href="/metodoloji">metodoloji</Link> sayfasına bakın.
                </li>
                <li>
                    <strong>Yapay zeka kullanımı:</strong> Videolardaki görüşleri çıkarmak için yapay zeka kullanılır
                    ve bu her sinyalin yanında belirtilir. Rehber yazıları ise genel bilgilendirme amaçlı
                    metinlerdir; kişiye özel değildir ve tavsiye içermez.
                </li>
                <li>
                    <strong>Kaynak gösterme:</strong> Her görüş özeti kaynak videoya, her haber başlığı yayıncısına,
                    her rehber yazısı dayandığı resmî kurumlara bağlanır.
                </li>
                <li>
                    <strong>Eşit muamele:</strong> Takip listesindeki bir kanalın yayımladığı her video sıraya girer;
                    konuya, kişiye ya da görüşün yönüne göre eleme yapılmaz.
                </li>
            </ul>

            <h2 id="duzeltme-politikasi" className="h2" style={{ marginTop: 34 }}>Düzeltme politikası</h2>
            <p className="small">
                Hata yaptığımızda saklamayız, düzeltiriz. Her sinyalin altındaki &ldquo;Bu özet yanlış&rdquo;
                bağlantısıyla bildirilen özet, biz incelemeden önce otomatik olarak listeden çıkar. Rehber
                yazılarındaki olgusal bir hatayı <Link href="/iletisim">iletişim sayfasından</Link> bildirebilirsiniz;
                doğrulandığında yazı düzeltilir ve sayfadaki &ldquo;güncelleme&rdquo; tarihi değişir. Kaldırma ve
                itiraz talepleri için <Link href="/kaldirma">içerik kaldırma</Link> sayfasındaki yolu izleyin.
            </p>

            <h2 className="h2" style={{ marginTop: 34 }}>İçerik sahipleri için</h2>
            <p className="small">
                Kanalınızın Analist Ne Diyor&apos;da yer almasını istemiyorsanız veya bir sinyalin videonuzu yanlış
                yansıttığını düşünüyorsanız, <Link href="/iletisim">iletişim sayfasından</Link> bize yazın;
                ilgili kaydı kaldıralım.
            </p>

            <h2 className="h2" style={{ marginTop: 34 }}>Bize ulaşın</h2>
            <p className="small">
                Soru, düzeltme ve öneriler için: <a href={`mailto:${EMAIL}`}>{EMAIL}</a>. Kişisel verilerinizle ilgili
                bilgi için <Link href="/gizlilik">gizlilik politikası</Link> ve{" "}
                <Link href="/kvkk">KVKK aydınlatma metni</Link> sayfalarına bakabilirsiniz.
            </p>

            <JsonLd data={webPageLd({ type: "AboutPage", name: "Hakkımızda ve yayın ilkeleri", description: DESCRIPTION, path: "/hakkimizda" })} />
        </article>
    );
}
