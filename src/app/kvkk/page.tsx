import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "KVKK Aydınlatma Metni",
    description: "Analist Ne Diyor kişisel verilerin işlenmesine ilişkin aydınlatma metni.",
    alternates: { canonical: "/kvkk" },
};

const EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "iletisim@analistnediyor.com";

export default function KvkkPage() {
    return (
        <article className="wrap section" style={{ maxWidth: 720 }}>
            <h1 className="h1" style={{ fontSize: "clamp(1.7rem, 3.6vw, 2.3rem)" }}>
                KVKK Aydınlatma Metni
            </h1>
            <p className="tiny" style={{ marginTop: 8 }}>
                6698 sayılı Kişisel Verilerin Korunması Kanunu m.10 uyarınca
            </p>

            <h2 className="h2" style={{ marginTop: 30 }}>Veri sorumlusu</h2>
            <p className="small">
                Analist Ne Diyor. İletişim: <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </p>

            <h2 className="h2" style={{ marginTop: 30 }}>1. Site ziyaretçileri</h2>
            <p className="small">
                Siteyi kullanmak için üyelik gerekmez; adınızı, e-postanızı veya telefonunuzu
                istemiyoruz. Ziyaretiniz sırasında barındırma ve reklam altyapısı tarafından teknik
                veriler (IP adresi, tarayıcı bilgisi, ziyaret edilen sayfa) işlenir. Hukuki dayanak:
                KVKK m.5/2-f (meşru menfaat — hizmetin sunulması ve güvenliği).
            </p>
            <p className="small" style={{ marginTop: 10 }}>
                &ldquo;Bu özet yanlış&rdquo; bildirimi gönderirseniz, kötüye kullanımı önlemek için IP
                adresiniz <strong>geri döndürülemez biçimde özetlenerek (hash)</strong> saklanır; düz
                metin IP adresi tutulmaz. Tema tercihiniz yalnızca kendi tarayıcınızda kalır.
            </p>

            <h2 className="h2" style={{ marginTop: 30 }}>2. Videoları özetlenen yorumcular</h2>
            <p className="small">
                Sitede adı, kanal adı ve kanal görseli yer alan kişilerin verileri işlenmektedir.
                İşlenen veriler: kanal adı, kanal görseli, videonun başlığı ve bağlantısı, videoda
                belirtilen görüşün yönü ve kısa özeti.
            </p>
            <p className="small" style={{ marginTop: 10 }}>
                <strong>Hukuki dayanak:</strong> KVKK m.5/2-d — ilgili kişinin kendisi tarafından
                alenileştirilmiş olması. Söz konusu görüşler, kişilerin kendi iradeleriyle ve kamuoyuyla
                paylaşma amacıyla YouTube&apos;da herkese açık olarak yayınlanmıştır. İşleme, bu
                alenileştirme amacıyla sınırlıdır: görüşün kamuoyuna aktarılması. Bu veriler pazarlama,
                profilleme veya başka bir amaçla kullanılmaz, üçüncü kişilere satılmaz.
            </p>
            <p className="small" style={{ marginTop: 10 }}>
                Ayrıca KVKK m.28/1-c uyarınca, ifade özgürlüğü kapsamında yapılan bu işleme, milli
                savunma, kamu düzeni veya kişilik haklarını ihlal etmemek kaydıyla Kanun hükümlerinin
                dışında tutulmaktadır.
            </p>

            <h2 className="h2" style={{ marginTop: 30 }}>3. Aktarım</h2>
            <p className="small">Veriler aşağıdaki hizmet sağlayıcıların altyapısında işlenir:</p>
            <ul className="small">
                <li>Barındırma ve erişim kayıtları: bulut sağlayıcımız (yurt dışı)</li>
                <li>Veri tabanı: Google Firebase (yurt dışı)</li>
                <li>İçerik analizi: Google Gemini — yalnızca kamuya açık video altyazıları gönderilir, ziyaretçi verisi gönderilmez</li>
                <li>Reklam: Google AdSense (etkinleştirildiğinde)</li>
            </ul>

            <h2 className="h2" style={{ marginTop: 30 }}>4. Saklama süresi</h2>
            <p className="small">
                Video altyazıları ve ses kayıtları <strong>saklanmaz</strong>; analiz sonrası silinir.
                Çıkarılan görüş özetleri, kaldırma talebi gelene kadar saklanır. Bildirim kayıtları
                bir yıl sonra silinir.
            </p>

            <h2 className="h2" style={{ marginTop: 30 }}>5. Haklarınız</h2>
            <p className="small">
                KVKK m.11 uyarınca kişisel verilerinizin işlenip işlenmediğini öğrenme, bilgi talep
                etme, düzeltilmesini veya silinmesini isteme ve işlemeye itiraz etme haklarına
                sahipsiniz. Talepleriniz <a href={`mailto:${EMAIL}`}>{EMAIL}</a> adresine iletildiğinde
                en geç <strong>30 gün</strong> içinde sonuçlandırılır. Kaldırma talepleri için
                uyguladığımız hızlandırılmış süreç <Link href="/kaldirma">kaldırma sayfasında</Link>{" "}
                açıklanmıştır.
            </p>
        </article>
    );
}
