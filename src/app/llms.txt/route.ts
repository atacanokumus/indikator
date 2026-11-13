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
import { GUIDES } from "@/content/guides";
import { TOOLS } from "@/content/tools";
import { PROFILED_ASSETS } from "@/content/assets";
import { assetSeoName } from "@/lib/asset-seo";
import { SITE_URL } from "@/lib/seo";
import { assetSlug } from "@/lib/slug";

export const revalidate = 86400;

export function GET() {
    const body = `# Analist Ne Diyor

> Türkiye'deki ve dünyadaki YouTube ekonomi yorumcularının videolarında hangi
> varlık için hangi yönde konuştuğunu sayan bağımsız bir yayın. Site kendi
> yatırım tavsiyesini üretmez; başkalarının söylediklerini sayar ve
> yorumcuların görüş değişikliklerini tarihleriyle birlikte gösterir.

## Ne yapar

- Takip edilen YouTube ekonomi kanallarının yeni videolarını yayınlandığı anda alır.
- Videonun altyazısını yapay zekaya okutur, konuşmacının bir varlık için net
  görüş bildirdiği yerleri işaretler.
- Aynı varlık için kaç yorumcunun hangi yönde konuştuğunu sayar
  (alım / satış / bekle / gözlemle).
- Aynı yorumcu bir varlıkta yön değiştirdiğinde önceki görüşünü ve tarihini de gösterir.

## Ne yapmaz

- Yatırım tavsiyesi vermez, portföy önermez, alım satım yapmaz.
- Kendi görüşünü sayıma katmaz, yorumcuları kendi kanaatine göre ağırlıklandırmaz.
- Videoları yeniden yayınlamaz veya indirilebilir hale getirmez.
- Yatırım danışmanlığı yetkisi yoktur; içerik kişiye özel değildir.
- Yorumcuları puanlamaz, sıralamaz, isabet ya da başarı oranı yayımlamaz.

## Sayım yöntemi

- Bir varlık için her yorumcunun yalnızca en güncel görüşü sayılır; aynı kişi iki kez sayılmaz.
- Sonuç ortalama, puan ya da ağırlıklı skor değildir; düz sayımdır.
- Sayım penceresi son 30 gündür; daha eski görüşler sayıma girmez.
- Her özet kaynak videoya bağlıdır ve yapay zeka ile çıkarılmıştır; hata içerebilir.

## Sayfalar

- [Ana sayfa](${SITE_URL}/): varlık bazında güncel sayım
- [Konsensüs](${SITE_URL}/konsensus): tüm varlıkların tablosu
- [Haftalık bülten](${SITE_URL}/bulten): haftanın konsensüs değişimi ([RSS](${SITE_URL}/bulten/rss.xml))
- [Ekonomi rehberi](${SITE_URL}/rehber): altın, döviz, borsa ve kripto için tavsiye içermeyen açıklayıcı yazılar
- [Hesaplama araçları](${SITE_URL}/araclar): gram altın, mevduat faizi ve reel getiri hesaplayıcıları
- Yorumcu sayfaları: her kanalın son görüşleri ${SITE_URL}/analist/<kanal-adı> adresindedir (ana sayfada listelenir)
- [Metodoloji](${SITE_URL}/metodoloji): video seçiminden sayıma kadar tüm yöntem
- [Sözlük](${SITE_URL}/sozluk): terimlerin karşılıkları
- [Hakkımızda](${SITE_URL}/hakkimizda)
- [İçerik kaldırma ve itiraz](${SITE_URL}/kaldirma)
- [Gizlilik](${SITE_URL}/gizlilik) · [KVKK aydınlatma metni](${SITE_URL}/kvkk)

## Rehber yazıları

${GUIDES.map((g) => `- [${g.title}](${SITE_URL}/rehber/${g.slug}): ${g.description}`).join("\n")}

## Hesaplama araçları

${TOOLS.map((t) => `- [${t.title}](${SITE_URL}/araclar/${t.slug}): ${t.description}`).join("\n")}

## Varlık sayfaları (güncel analist sayımı)

${PROFILED_ASSETS.map((a) => `- [${assetSeoName(a)}](${SITE_URL}/varlik/${assetSlug(a)})`).join("\n")}

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
