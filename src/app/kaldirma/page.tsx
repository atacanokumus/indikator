import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "İçerik kaldırma ve düzeltme talebi",
    description:
        "Analist Ne Diyor'da adı geçen yorumcular ve hak sahipleri için içerik kaldırma, düzeltme ve itiraz prosedürü.",
    alternates: { canonical: "/kaldirma" },
};

const EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "iletisim@analistnediyor.com";

export default function KaldirmaPage() {
    return (
        <article className="wrap section" style={{ maxWidth: 720 }}>
            <h1 className="h1" style={{ fontSize: "clamp(1.7rem, 3.6vw, 2.3rem)" }}>
                İçerik kaldırma ve düzeltme
            </h1>
            <p className="lead" style={{ marginTop: 16 }}>
                Analist Ne Diyor&apos;da adınız veya kanalınız geçiyorsa, içeriğin kaldırılmasını ya da
                düzeltilmesini her zaman isteyebilirsiniz. Gerekçe belirtmek zorunda değilsiniz.
            </p>

            <div className="card card-pad stack gap-8" style={{ marginTop: 26, borderColor: "var(--al-border)", background: "var(--al-bg)" }}>
                <strong style={{ color: "var(--al)" }}>Taahhüdümüz</strong>
                <p className="small" style={{ margin: 0, color: "var(--text)" }}>
                    Talebinizi <strong>48 saat içinde</strong> sonuçlandırırız. Acil durumlarda, talep
                    bize ulaştığı anda ilgili içeriği incelemeyi beklemeden yayından kaldırırız.
                </p>
            </div>

            <h2 className="h2" style={{ marginTop: 34 }}>En hızlı yol</h2>
            <p className="small">
                Her sinyalin altındaki <strong>&ldquo;Bu özet yanlış&rdquo;</strong> bağlantısı en hızlı
                yoldur. Bu bağlantıyla gönderilen bildirimler, biz incelemeden önce ilgili özeti
                otomatik olarak listeden çıkarır.
            </p>

            <h2 className="h2" style={{ marginTop: 34 }}>E-posta ile</h2>
            <p className="small">
                <a href={`mailto:${EMAIL}`}>{EMAIL}</a> adresine yazın. Talebinizi hızlandırmak için
                şunları eklerseniz seviniriz:
            </p>
            <ul className="small">
                <li>Kanal adınız veya sitedeki sayfanın bağlantısı</li>
                <li>Talebiniz: tamamen kaldırma mı, belirli bir özetin düzeltilmesi mi</li>
                <li>Hak sahibi olduğunuzu gösteren bir bağlantı (kanal sayfanız yeterlidir)</li>
            </ul>

            <h2 className="h2" style={{ marginTop: 34 }}>Ne yapabiliriz</h2>
            <ul className="small">
                <li><strong>Kanalın tamamen çıkarılması.</strong> Kanalınız takip listesinden silinir, geçmiş tüm özetler kaldırılır, bir daha eklenmez.</li>
                <li><strong>Tek bir özetin kaldırılması.</strong> Yanlış çıkarıldığını düşündüğünüz özet silinir.</li>
                <li><strong>Düzeltme.</strong> Doğrusunu bildirirseniz özeti düzeltir, düzeltildiğini not ederiz.</li>
            </ul>

            <h2 className="h2" style={{ marginTop: 34 }}>Kişisel verileriniz</h2>
            <p className="small">
                6698 sayılı Kanun kapsamındaki silme, düzeltme ve itiraz haklarınızı aynı adresten
                kullanabilirsiniz; bu talepler en geç 30 gün içinde sonuçlandırılır. Ayrıntı için{" "}
                <Link href="/kvkk">aydınlatma metnine</Link> bakabilirsiniz.
            </p>

            <h2 className="h2" style={{ marginTop: 34 }}>Telif hakkı</h2>
            <p className="small">
                Analist Ne Diyor videolarınızı yeniden yayınlamaz, indirilebilir hale getirmez ve altyazı
                metnini saklamaz. Yalnızca konuşmanızda hangi varlık için hangi yönde görüş
                bildirdiğinizi kaydeder ve izleyiciyi videonuza yönlendirir. Buna rağmen kullanımın
                haklarınızı ihlal ettiğini düşünüyorsanız yukarıdaki adresten yazın; itirazınızı
                tartışmadan uygularız.
            </p>
        </article>
    );
}
