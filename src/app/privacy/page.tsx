export default function PrivacyPolicy() {
    return (
        <main style={{ maxWidth: "800px", margin: "60px auto", padding: "0 24px", color: "var(--text-primary)", fontFamily: "var(--font-inter)" }}>
            <h1 style={{ fontSize: "32px", fontWeight: "800", marginBottom: "32px", letterSpacing: "-0.02em" }}>Gizlilik Politikası</h1>

            <section style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>1. Veri Toplama</h2>
                <p style={{ lineHeight: "1.7", color: "var(--text-secondary)" }}>
                    ECOTUBE olarak kullanıcılarımızın deneyimini iyileştirmek için anonim kullanım verilerini topluyoruz.
                    Bu veriler; hangi varlıkların daha çok arandığı, sayfa geçişleri ve genel site etkileşimleridir.
                    Kişisel verileriniz (isim, e-posta vb.) tarafımızca ancak sizin rızanızla toplanır.
                </p>
            </section>

            <section style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>2. Google AdSense ve Çerezler</h2>
                <p style={{ lineHeight: "1.7", color: "var(--text-secondary)" }}>
                    Sitemiz, içerik ve reklamları kişiselleştirmek ve trafik analizi yapmak için çerezleri (cookies) kullanmaktadır.
                    Google gibi üçüncü taraf satıcılar, sitemize veya internetteki diğer sitelere yaptığınız önceki ziyaretlere dayalı olarak reklam sunmak için çerezleri kullanır.
                </p>
                <p style={{ lineHeight: "1.7", color: "var(--text-secondary)", marginTop: "12px" }}>
                    Google'ın reklam çerezlerini kullanması, Google ve ortaklarının sitemizi ve/veya internetteki diğer siteleri ziyaretlerinize dayalı olarak reklam sunmasına olanak tanır.
                    Kullanıcılar, <a href="https://www.google.com/settings/ads" target="_blank" style={{ color: "var(--brand-teal)" }}>Reklam Ayarları</a>'nı ziyaret ederek kişiselleştirilmiş reklamcılıktan çıkabilirler.
                </p>
            </section>

            <section style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>3. Üçüncü Taraf Bağlantıları</h2>
                <p style={{ lineHeight: "1.7", color: "var(--text-secondary)" }}>
                    Site içerisinde ekonomistlerin YouTube videolarına veya dış finansal kaynaklara bağlantılar bulunabilir.
                    Bu dış sitelerin gizlilik politikalarından ECOTUBE sorumlu tutulamaz.
                </p>
            </section>

            <section style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>4. İletişim</h2>
                <p style={{ lineHeight: "1.7", color: "var(--text-secondary)" }}>
                    Gizlilik politikamızla ilgili sorularınız için bizimle iletişime geçebilirsiniz.
                </p>
            </section>

            <footer style={{ marginTop: "60px", paddingTop: "24px", borderTop: "1px solid var(--border)", textAlign: "center" }}>
                <a href="/" style={{ color: "var(--brand-teal)", fontWeight: "600", textDecoration: "none" }}>← Anasayfa'ya Dön</a>
            </footer>
        </main>
    );
}
