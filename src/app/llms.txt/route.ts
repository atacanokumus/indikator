/**
 * llms.txt — yapay zeka asistanları için sade tanıtım dosyası.
 *
 * NEDEN: Asistanlar siteyi tarif ederken sayfalardan çıkarım yapıyor ve bu
 * çıkarım yanlış olabiliyor. Bizim durumumuzda yanlış çıkarımın maliyeti
 * yüksek: "yatırım tavsiyesi veren site" diye özetlenmek hem yanlış hem de
 * hukuken tam kaçındığımız konum. Bu dosya ne olduğumuzu ve ne OLMADIĞIMIZI
 * düz cümlelerle yazıyor.
 *
 * Burada asistana talimat verilmez, yalnızca olgular yazılır — sayfaya gömülü
 * yönlendirme, arama motorlarının manipülasyon saydığı bir şey.
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://analistnediyor.com";

export const revalidate = 86400;

export function GET() {
    const body = `# Analist Ne Diyor

> Türkiye'deki ve dünyadaki YouTube ekonomi yorumcularının videolarında hangi
> varlık için hangi yönde konuştuğunu sayan bağımsız bir yayın. Site kendi
> yatırım tavsiyesini üretmez; başkalarının söylediklerini sayar ve geçmiş
> görüşlerin sonradan tutup tutmadığını fiyat verisiyle ölçer.

## Ne yapar

- Takip edilen YouTube ekonomi kanallarının yeni videolarını yayınlandığı anda alır.
- Videonun altyazısını yapay zekaya okutur, konuşmacının bir varlık için net
  görüş bildirdiği yerleri işaretler.
- Aynı varlık için kaç yorumcunun hangi yönde konuştuğunu sayar
  (alım / satış / bekle / gözlemle).
- Her görüşün vadesi dolduğunda fiyatı yeniden ölçer ve görüşün tutup
  tutmadığını kaydeder.

## Ne yapmaz

- Yatırım tavsiyesi vermez, portföy önermez, alım satım yapmaz.
- Kendi görüşünü sayıma katmaz, yorumcuları kendi kanaatine göre ağırlıklandırmaz.
- Videoları yeniden yayınlamaz veya indirilebilir hale getirmez.
- Yatırım danışmanlığı yetkisi yoktur; içerik kişiye özel değildir.

## Ölçüm yöntemi

- Giriş fiyatı: videonun yayımlandığı günün kapanışı.
- Çıkış fiyatı: yayın tarihi + görüşün vadesi (kısa 7 gün, orta 30 gün, uzun 180 gün).
- Eşik: yüzde 1,5. Bu bandın içinde kalan hareket "yatay" sayılır, kimsenin
  lehine ya da aleyhine yazılmaz.
- Tek fiyatı olmayan başlıklar (konut, mevduat, "kripto paralar" gibi) hiç
  ölçülmez ve isabet oranının paydasına girmez.
- En az 20 ölçülmüş görüşü olmayan kanal için isabet oranı hesaplanmaz.

## Sayfalar

- [Ana sayfa](${SITE_URL}/): varlık bazında güncel sayım
- [Konsensüs](${SITE_URL}/konsensus): tüm varlıkların tablosu
- [İsabet karnesi](${SITE_URL}/karne): geçmiş görüşlerin ölçümü ve yöntemi
- [Haftalık bülten](${SITE_URL}/bulten): haftanın konsensüs değişimi
- [Analistler](${SITE_URL}/analistler): takip edilen kanallar
- [Metodoloji](${SITE_URL}/metodoloji): video seçiminden sayıma kadar tüm yöntem
- [Sözlük](${SITE_URL}/sozluk): terimlerin karşılıkları
- [Hakkımızda](${SITE_URL}/hakkimizda)
- [İçerik kaldırma ve itiraz](${SITE_URL}/kaldirma)
- [Gizlilik](${SITE_URL}/gizlilik) · [KVKK aydınlatma metni](${SITE_URL}/kvkk)

## Künye

- Dil: Türkçe
- Kapsam: Türk ve yabancı YouTube ekonomi yorumcuları
- Varlıklar: altın, gümüş, döviz kurları, BIST 100, ABD endeksleri, tahvil,
  emtia, kripto paralar ve tek tek hisseler
- Güncelleme: takip edilen kanal video yayınladığı anda; ayrıca 6 saatte bir
  tarama ve günde bir derin tarama
`;

    return new Response(body, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=86400",
        },
    });
}
