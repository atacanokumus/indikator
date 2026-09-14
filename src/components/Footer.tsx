import Link from "next/link";
import { LogoMark } from "./Logo";

export function Footer() {
    return (
        <footer style={{ borderTop: "1px solid var(--border)", marginTop: 48, background: "var(--bg-elevated)" }}>
            <div className="wrap" style={{ paddingBlock: 32 }}>
                <div className="between wrapflex" style={{ alignItems: "flex-start", gap: 28 }}>
                    <div style={{ maxWidth: 340 }}>
                        <div className="row gap-8" style={{ marginBottom: 10 }}>
                            <LogoMark size={26} />
                            <strong style={{ fontSize: 16, letterSpacing: "-0.03em" }}>analistnediyor</strong>
                        </div>
                        <p className="small" style={{ margin: 0 }}>
                            YouTube&apos;daki ekonomi yorumcularının videolarını yapay zeka ile okuyup,
                            hangi varlıkta ne dediklerini tek ekranda topluyoruz.
                        </p>
                    </div>

                    <nav className="row gap-24 wrapflex" style={{ alignItems: "flex-start" }} aria-label="Alt menü">
                        <div className="stack gap-8">
                            <span className="eyebrow">Sayfalar</span>
                            <Link className="small" href="/">Sinyaller</Link>
                            <Link className="small" href="/konsensus">Konsensüs</Link>
                            <Link className="small" href="/analistler">Analistler</Link>
                            <Link className="small" href="/karne">İsabet karnesi</Link>
                            <Link className="small" href="/bulten">Haftalık bülten</Link>
                            <Link className="small" href="/sozluk">Sözlük</Link>
                        </div>
                        <div className="stack gap-8">
                            <span className="eyebrow">Yasal</span>
                            <Link className="small" href="/gizlilik">Gizlilik</Link>
                            <Link className="small" href="/kvkk">KVKK aydınlatma</Link>
                            <Link className="small" href="/kaldirma">İçerik kaldırma</Link>
                        </div>
                        <div className="stack gap-8">
                            <span className="eyebrow">Kurumsal</span>
                            <Link className="small" href="/hakkimizda">Hakkımızda</Link>
                            <Link className="small" href="/metodoloji">Metodoloji</Link>
                            <Link className="small" href="/iletisim">İletişim</Link>
                        </div>
                    </nav>
                </div>

                <hr className="divider" style={{ marginBlock: 22 }} />

                <p className="tiny" style={{ margin: 0, lineHeight: 1.65 }}>
                    <strong>Yatırım tavsiyesi değildir.</strong> Analist Ne Diyor size ne yapmanız gerektiğini
                    söylemez; kamuya açık YouTube videolarında kimin hangi yönde konuştuğunu sayar.
                    Buradaki içerikler kişiye özel değildir, genel niteliktedir ve yatırım danışmanlığı
                    kapsamında değildir. Yön etiketleri yorumcuların kendi ifadelerinin yapay zeka ile
                    çıkarılmış özetidir ve hata içerebilir; kaynağı videodan teyit edin.
                </p>
                <p className="tiny" style={{ marginTop: 10 }}>
                    © {new Date().getFullYear()} Analist Ne Diyor
                </p>
            </div>
        </footer>
    );
}
