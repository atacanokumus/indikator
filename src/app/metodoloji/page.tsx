import type { Metadata } from "next";
import Link from "next/link";
import { LegalNotice } from "@/components/LegalNotice";
import { getHomeSnapshot } from "@/server/read";

export const revalidate = 300;

export const metadata: Metadata = {
    title: "Metodoloji — sayım nasıl yapılıyor",
    description:
        "ECOTUBE'un video seçiminden yön etiketine, sayımdan isabet ölçümüne kadar tüm yöntemi.",
    alternates: { canonical: "/metodoloji" },
};

export default async function MetodolojiPage() {
    const snapshot = await getHomeSnapshot();

    return (
        <>
            <article className="wrap section" style={{ maxWidth: 720 }}>
                <h1 className="h1" style={{ fontSize: "clamp(1.7rem, 3.6vw, 2.3rem)" }}>Metodoloji</h1>
                <p className="lead" style={{ marginTop: 16 }}>
                    Sitedeki her sayı nereden geliyor, nasıl hesaplanıyor ve nerede hata yapabilir.
                </p>

                <h2 className="h2" style={{ marginTop: 34 }}>Videolar nasıl seçiliyor?</h2>
                <p className="small">
                    Takip listesindeki kanalların herkese açık RSS akışları izlenir. Bir kanal video
                    yayınladığında YouTube&apos;un ücretsiz bildirim servisi bize haber verir. Video
                    seçiminde konuya, kişiye veya görüşe göre eleme yapılmaz — kanalın yayınladığı
                    her video sıraya girer.
                </p>

                <h2 className="h2" style={{ marginTop: 34 }}>İçerik nasıl okunuyor?</h2>
                <p className="small">
                    Videonun <strong>altyazısı</strong> okunur. Altyazısı olmayan video analiz edilmez
                    ve atlanır; ses veya video dosyası indirilmez, saklanmaz. Altyazı metni de analiz
                    sonrası saklanmaz — yalnızca çıkarılan yön etiketi ve kısa gerekçe kaydedilir.
                </p>

                <h2 className="h2" style={{ marginTop: 34 }}>Yön etiketi nasıl konuyor?</h2>
                <p className="small">
                    Yapay zeka modeli, konuşmacının bir varlık için <em>net</em> bir yön belirttiği
                    yerleri işaretler ve dört etiketten birini verir:
                </p>
                <ul className="small">
                    <li><strong className="dir dir-AL">ALIM</strong> — konuşmacı alım yönünde görüş bildirmiş</li>
                    <li><strong className="dir dir-SAT">SATIŞ</strong> — satış yönünde görüş bildirmiş</li>
                    <li><strong className="dir dir-TUT">BEKLE</strong> — pozisyon almamayı, beklemeyi tercih etmiş</li>
                    <li><strong className="dir dir-GÖZLEMLE">GÖZLEMLE</strong> — konuya değinmiş ama net bir yön vermemiş</li>
                </ul>
                <p className="small" style={{ marginTop: 10 }}>
                    Genel piyasa yorumları, siyasi değerlendirmeler ve makro tahminler etiketlenmez.
                    Gerekçe metni, konuşmacının cümlelerinin birebir aktarımı değil, kendi
                    sözcüklerimizle yazılmış en fazla 25 kelimelik bir özettir.
                </p>

                <h2 className="h2" style={{ marginTop: 34 }}>Sayım nasıl yapılıyor?</h2>
                <p className="small">
                    Bir varlık için her yorumcunun <strong>yalnızca en güncel</strong> görüşü sayılır;
                    aynı kişi iki kez sayılmaz. Sonuç bir ortalama, puan veya ağırlıklı skor
                    <strong> değildir</strong> — düz bir sayımdır. &ldquo;{snapshot.analystCount || 7} analistin
                    4&apos;ü alım yönünde&rdquo; cümlesi tam olarak bunu söyler.
                </p>
                <p className="small" style={{ marginTop: 10 }}>
                    ECOTUBE bu sayıma kendi görüşünü katmaz, yorumcuları ağırlıklandırmaz ve bir
                    sonuç önermez. Sayım penceresi son <strong>{snapshot.windowDays} gündür</strong>;
                    daha eski görüşler sayıma girmez ama geçmiş olarak gösterilir.
                </p>

                <h2 className="h2" style={{ marginTop: 34 }}>Görüş değişiklikleri</h2>
                <p className="small">
                    Bir yorumcu aynı varlık için daha önce farklı bir yön belirtmişse, önceki görüşü
                    ve tarihi sinyalin altında gösterilir. Böylece bir görüşün ne kadar istikrarlı
                    olduğunu kendiniz değerlendirebilirsiniz.
                </p>

                <h2 className="h2" style={{ marginTop: 34 }}>İsabet ölçümü</h2>
                <p className="small">
                    Her yön etiketi kaydedilirken varlığın o anki fiyatı da saklanır. Etiketin vadesi
                    dolduğunda (kısa 7 gün, orta 30 gün, uzun 180 gün) fiyat tekrar ölçülür ve
                    yönün tutup tutmadığına bakılır. Eşik <strong>%1,5</strong>: bu bandın içinde kalan
                    hareketler yatay sayılır. Sonuçlar <Link href="/analistler">analistler sayfasında</Link>{" "}
                    görünür.
                </p>
                <p className="small" style={{ marginTop: 10 }}>
                    Bu ölçüm kaba bir göstergedir: konuşmacının kastettiği vade, giriş seviyesi veya
                    koşul bizim varsayımımızdan farklı olabilir. Bir yorumcunun başarısı hakkında
                    kesin hüküm olarak okunmamalıdır.
                </p>

                <h2 className="h2" style={{ marginTop: 34 }}>Nerede hata yapabiliriz?</h2>
                <ul className="small">
                    <li>Yapay zeka bir cümleyi yanlış yorumlayabilir; koşullu ifadeleri kesin yön sanabilir</li>
                    <li>Otomatik altyazılar hatalı olabilir, özellikle rakam ve hisse kodlarında</li>
                    <li>Bir görüş bağlamından koparılmış görünebilir</li>
                    <li>Fiyat kaynakları gecikmeli veya farklı olabilir</li>
                </ul>
                <p className="small" style={{ marginTop: 10 }}>
                    Bu yüzden her sinyalin yanında kaynak videoya bağlantı ve{" "}
                    <strong>&ldquo;Bu özet yanlış&rdquo;</strong> bildirimi vardır. Bildirilen özet, biz
                    incelemeden önce otomatik olarak listeden çıkar.
                </p>
            </article>

            <section className="wrap section-tight">
                <LegalNotice updateFrequency={snapshot.updateFrequency} generatedAt={snapshot.generatedAt} />
            </section>
        </>
    );
}
