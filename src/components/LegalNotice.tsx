import Link from "next/link";
import { relativeTime } from "@/lib/display";

/**
 * Tebliğ III-37.1 m.79 ve Ek 3 uyarınca gösterilmesi gereken uyarı notu,
 * m.78/2-a (yenilenme sıklığı) ve m.50 (çıkar çatışması) beyanlarıyla birlikte.
 * Genel yatırım tavsiyesi kapsamına giren her sayfada gösterilir.
 */
export function LegalNotice({
    updateFrequency,
    generatedAt,
}: {
    updateFrequency?: string;
    generatedAt?: string;
}) {
    return (
        <aside className="card card-pad stack gap-12" aria-label="Yasal uyarı">
            <span className="row gap-6" style={{ color: "var(--bekle)", fontWeight: 750, fontSize: 13 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
                    <path d="M12 9v4M12 17h.01" />
                </svg>
                Yasal uyarı
            </span>

            <p className="small" style={{ margin: 0 }}>
                Burada yer alan bilgi, yorum ve tavsiyeler <strong>yatırım danışmanlığı kapsamında
                değildir</strong>. Yatırım danışmanlığı hizmeti, yetkili kuruluşlar tarafından kişilerin
                risk ve getiri tercihleri dikkate alınarak kişiye özel sunulur. Buradaki içerikler ise
                kişiye özel değildir ve <strong>genel niteliktedir</strong>. Sadece burada yer alan
                bilgilere dayanılarak yatırım kararı verilmesi beklentilerinize uygun sonuçlar
                doğurmayabilir.
            </p>

            <p className="small" style={{ margin: 0 }}>
                Gösterilen yön etiketleri, YouTube&apos;da kamuya açık olarak yayınlanmış videolarda
                konuşan kişilerin <strong>kendi ifadelerinin</strong> yapay zeka ile çıkarılmış özetidir.
                Analist Ne Diyor bu görüşlere katılmaz, onaylamaz veya bir alım-satım önerisi olarak sunmaz.
                Yapay zeka hata yapabilir; her sinyalin yanındaki bağlantıdan kaynağı teyit edin.
            </p>

            {updateFrequency && (
                <p className="small" style={{ margin: 0 }}>
                    <strong>Güncellenme sıklığı.</strong> {updateFrequency}
                    {generatedAt && <> Bu sayfadaki sayım {relativeTime(generatedAt)} üretildi.</>}
                </p>
            )}

            <p className="small" style={{ margin: 0 }}>
                <strong>Çıkar çatışması beyanı.</strong> Analist Ne Diyor, adı geçen hiçbir yorumcuyla ticari
                ilişkisi olmayan bağımsız bir araştırma aracıdır; hiçbir ihraççıda pay sahipliği,
                yönetim ilişkisi veya finansal menfaati yoktur. Site gelirini yalnızca görüntülenen
                reklamlardan elde eder; reklam verenlerin içerik üzerinde etkisi yoktur.
            </p>

            <p className="tiny" style={{ margin: 0 }}>
                Bir özetin yanlış olduğunu düşünüyorsanız her kartın altındaki{" "}
                <em>&ldquo;Bu özet yanlış&rdquo;</em> bağlantısını kullanın veya{" "}
                <Link href="/kaldirma">kaldırma talebi</Link> sayfasına bakın.
            </p>
        </aside>
    );
}
