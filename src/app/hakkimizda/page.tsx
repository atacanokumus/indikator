import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Hakkımızda",
    description: "Analist Ne Diyor nedir, nasıl çalışır, veriler nereden gelir ve neyi vaat etmez.",
    alternates: { canonical: "/hakkimizda" },
};

export default function HakkimizdaPage() {
    return (
        <article className="wrap section" style={{ maxWidth: 720 }}>
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

            <h2 className="h2" style={{ marginTop: 34 }}>İçerik sahipleri için</h2>
            <p className="small">
                Kanalınızın Analist Ne Diyor&apos;da yer almasını istemiyorsanız veya bir sinyalin videonuzu yanlış
                yansıttığını düşünüyorsanız, <a href="/iletisim">iletişim sayfasından</a> bize yazın;
                ilgili kaydı kaldıralım.
            </p>
        </article>
    );
}
