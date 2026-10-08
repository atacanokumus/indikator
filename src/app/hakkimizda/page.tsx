import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
    title: "Hakkımızda ve yayın ilkeleri",
    description:
        "Analist Ne Diyor nedir, kim için var, veriler nereden gelir, yapay zeka nerede kullanılır ve hatalar nasıl düzeltilir?",
    path: "/hakkimizda",
});

export default function HakkimizdaPage() {
    return (
        <article className="wrap section" style={{ maxWidth: 720 }}>
            <Breadcrumbs items={[{ name: "Hakkımızda", path: "/hakkimizda" }]} />
            <h1 className="h1" style={{ fontSize: "clamp(1.7rem, 3.6vw, 2.3rem)" }}>Hakkımızda</h1>

            <p className="lead" style={{ marginTop: 16 }}>
                Analist Ne Diyor, Türkiye&apos;deki YouTube ekonomi yorumcularının ne dediğini takip etmeyi
                kolaylaştırmak için kurulmuş bağımsız bir araştırma aracıdır.
            </p>

            <h2 className="h2" style={{ marginTop: 34 }}>Neden var?</h2>
            <p className="small">
                Bir yatırımcının merak ettiği soru genelde basittir: &ldquo;Şu an altın için ne diyorlar?&rdquo;
                Cevabı bulmak içinse onlarca kanalda, saatlerce video izlemek gerekir. Analist Ne Diyor bu işi
                otomatikleştirir: videoları okur, yorumcunun hangi varlık için ne söylediğini çıkarır ve
                hepsini tek tabloda toplar.
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
                    <a href="/metodoloji">metodoloji</a> sayfasına bakın.
                </li>
                <li>
                    <strong>Yapay zeka kullanımı:</strong> Videolardaki görüşleri çıkarmak için yapay zeka kullanılır
                    ve bu her sinyalin yanında belirtilir. Rehber yazıları ise genel bilgilendirme amaçlı
                    metinlerdir; kişiye özel değildir ve tavsiye içermez.
                </li>
            </ul>

            <h2 id="duzeltme-politikasi" className="h2" style={{ marginTop: 34 }}>Düzeltme politikası</h2>
            <p className="small">
                Hata yaptığımızda saklamayız, düzeltiriz. Her sinyalin altındaki &ldquo;Bu özet yanlış&rdquo;
                bağlantısıyla bildirilen özet, biz incelemeden önce otomatik olarak listeden çıkar. Rehber
                yazılarındaki olgusal bir hatayı <a href="/iletisim">iletişim sayfasından</a> bildirebilirsiniz;
                doğrulandığında yazı düzeltilir ve sayfadaki &ldquo;güncelleme&rdquo; tarihi değişir. Kaldırma ve
                itiraz talepleri için <a href="/kaldirma">içerik kaldırma</a> sayfasındaki yolu izleyin.
            </p>

            <h2 className="h2" style={{ marginTop: 34 }}>İçerik sahipleri için</h2>
            <p className="small">
                Kanalınızın Analist Ne Diyor&apos;da yer almasını istemiyorsanız veya bir sinyalin videonuzu yanlış
                yansıttığını düşünüyorsanız, <a href="/iletisim">iletişim sayfasından</a> bize yazın;
                ilgili kaydı kaldıralım.
            </p>
        </article>
    );
}
