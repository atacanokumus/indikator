import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Gizlilik Politikası",
    description: "Analist Ne Diyor gizlilik politikası, çerez kullanımı ve KVKK bilgilendirmesi.",
    alternates: { canonical: "/gizlilik" },
};

const EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "iletisim@analistnediyor.com";

export default function GizlilikPage() {
    return (
        <article className="wrap section" style={{ maxWidth: 720 }}>
            <h1 className="h1" style={{ fontSize: "clamp(1.7rem, 3.6vw, 2.3rem)" }}>Gizlilik Politikası</h1>
            <p className="tiny" style={{ marginTop: 8 }}>Son güncelleme: {new Date().toLocaleDateString("tr-TR")}</p>

            <h2 className="h2" style={{ marginTop: 30 }}>Hangi verileri topluyoruz?</h2>
            <p className="small">
                Analist Ne Diyor&apos;u kullanmak için üyelik gerekmez. Adınızı, e-postanızı veya telefonunuzu
                istemiyoruz. Siteyi kullanırken yalnızca teknik olarak zorunlu veriler (tarayıcı türü,
                yaklaşık konum, ziyaret edilen sayfa) barındırma ve reklam altyapısı tarafından işlenir.
            </p>

            <h2 className="h2" style={{ marginTop: 30 }}>Çerezler</h2>
            <p className="small">
                Tema tercihiniz (açık/koyu) yalnızca kendi tarayıcınızda saklanır, bize gönderilmez.
                Bunun dışında reklam ortağımız Google AdSense, ilgi alanına dayalı reklam gösterimi için
                çerez kullanabilir.
            </p>
            <ul className="small">
                <li>
                    Google, reklam çerezlerini{" "}
                    <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer nofollow">
                        reklam politikaları
                    </a>{" "}
                    kapsamında kullanır.
                </li>
                <li>
                    Kişiselleştirilmiş reklamları{" "}
                    <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer nofollow">
                        Google Reklam Ayarları
                    </a>{" "}
                    üzerinden kapatabilirsiniz.
                </li>
            </ul>

            <h2 className="h2" style={{ marginTop: 30 }}>Üçüncü taraf hizmetler</h2>
            <ul className="small">
                <li>Barındırma ve erişim kayıtları için bulut sağlayıcımız.</li>
                <li>Veri tabanı için Google Firebase.</li>
                <li>İçerik analizi için Google Gemini (yalnızca kamuya açık video metinleri gönderilir).</li>
                <li>Reklam gösterimi için Google AdSense.</li>
            </ul>

            <h2 className="h2" style={{ marginTop: 30 }}>KVKK haklarınız</h2>
            <p className="small">
                6698 sayılı Kanun kapsamında, hakkınızda işlenen veriler konusunda bilgi talep etme,
                düzeltilmesini veya silinmesini isteme haklarına sahipsiniz. Taleplerinizi{" "}
                <a href={`mailto:${EMAIL}`}>{EMAIL}</a> adresine iletebilirsiniz.
            </p>

            <h2 className="h2" style={{ marginTop: 30 }}>Yatırım tavsiyesi değildir</h2>
            <p className="small">
                Sitede yer alan hiçbir içerik, 6362 sayılı Sermaye Piyasası Kanunu uyarınca yatırım
                danışmanlığı kapsamında değildir. İçerikler kamuya açık YouTube videolarının yapay zeka
                ile çıkarılmış özetleridir ve hata içerebilir.
            </p>
        </article>
    );
}
