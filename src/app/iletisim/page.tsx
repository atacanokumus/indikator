import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "İletişim",
    description: "Analist Ne Diyor ile iletişime geçin: öneri, hata bildirimi, içerik kaldırma talepleri.",
    alternates: { canonical: "/iletisim" },
};

const EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "iletisim@analistnediyor.com";

export default function IletisimPage() {
    return (
        <article className="wrap section" style={{ maxWidth: 680 }}>
            <h1 className="h1" style={{ fontSize: "clamp(1.7rem, 3.6vw, 2.3rem)" }}>İletişim</h1>
            <p className="lead" style={{ marginTop: 16 }}>
                Soru, öneri, hata bildirimi ya da içerik kaldırma talepleriniz için bize yazabilirsiniz.
            </p>

            <div className="card card-pad stack gap-8" style={{ marginTop: 28 }}>
                <span className="eyebrow">E-posta</span>
                <a className="h3" href={`mailto:${EMAIL}`} style={{ color: "var(--brand)" }}>{EMAIL}</a>
                <span className="tiny">Genellikle 2 iş günü içinde dönüş yapıyoruz.</span>
            </div>

            <h2 className="h2" style={{ marginTop: 34 }}>Sık gelen talepler</h2>
            <ul className="small">
                <li><strong>Kanalımı kaldırın:</strong> Kanal adını yazmanız yeterli, takip listesinden çıkarırız.</li>
                <li><strong>Sinyal yanlış:</strong> Video bağlantısını gönderin; kaydı düzeltelim veya kaldıralım.</li>
                <li><strong>Kanal önerisi:</strong> Takip edilmesini istediğiniz kanalın bağlantısını paylaşın.</li>
            </ul>
        </article>
    );
}
