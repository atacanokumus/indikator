/**
 * REHBER YAZILARI — piyasalar (altın, döviz, borsa, kripto).
 *
 * guides.ts'teki YAZIM KURALLARI burada da geçerli: tavsiye yok, güncel rakam yok,
 * örnek rakamlar "örnek" diye etiketlenir, tartışmalı ilişkiler "çoğu zaman" ile yazılır.
 * Bu dosya guides.ts tarafından GUIDES listesine eklenir; ayrı tutulmasının tek nedeni boyut.
 */
import type { Guide } from "@/content/guides";
import { assetSlug } from "@/lib/slug";

const A = (asset: string, label: string) => `[${label}](/varlik/${assetSlug(asset)})`;

export const MARKET_GUIDES: Guide[] = [
    /* ------------------------------------------------------------------ */
    {
        slug: "ceyrek-yarim-tam-altin-farki",
        title: "Çeyrek, yarım, tam ve Cumhuriyet altını: gramajlar ve fiyat farkı",
        metaTitle: "Çeyrek, Yarım, Tam Altın Kaç Gram? Ziynet Altın Farkları",
        description:
            "Çeyrek altın kaç gram, kaç ayar? Çeyrek, yarım, tam, Cumhuriyet ve gremse altının gramajı, içindeki has altın miktarı ve fiyatlarının gram altından neden farklı çıktığı.",
        category: "Altın ve madenler",
        published: "2026-10-18",
        updated: "2026-10-18",
        intro:
            "Türkiye'de altın denince çoğu zaman külçe değil, düğünlerde takılan, yastık altında saklanan ziynet altınları akla gelir. " +
            "Bu yazıda çeyrekten gremseye kadar ziynet altınlarının ağırlığını, içindeki saf altın miktarını ve fiyatlarının gram " +
            "altından neden birebir hesaplanamadığını anlatıyoruz.",
        sections: [
            {
                id: "gramajlar",
                h2: "Ziynet altınların ağırlığı ve ayarı",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Çeyrek, yarım, tam ve Cumhuriyet altını gibi ürünler **22 ayar** basılır; yani ağırlığının yaklaşık %91,6'sı altındır, " +
                            "kalanı altını sertleştiren başka metallerdir. Ürünlerin standart brüt ağırlıkları şöyledir:",
                    },
                    {
                        t: "ul",
                        items: [
                            "**Çeyrek altın:** yaklaşık 1,75 gram",
                            "**Yarım altın:** yaklaşık 3,50 gram (iki çeyrek)",
                            "**Tam altın:** yaklaşık 7,00 gram (dört çeyrek)",
                            "**Cumhuriyet (Ata) altını:** yaklaşık 7,216 gram",
                            "**Gremse altın:** yaklaşık 17,5 gram (iki buçuk tam)",
                        ],
                    },
                    {
                        t: "p",
                        text:
                            "Tam altın ile Cumhuriyet altını aynı şey değildir: Cumhuriyet altını biraz daha ağırdır ve üzerinde Atatürk " +
                            "rölyefi bulunur. Reşat altını da ağırlık olarak Cumhuriyet altınına yakındır, ancak tarihi ve koleksiyon değeri " +
                            "nedeniyle çoğu zaman ayrı fiyatlanır.",
                    },
                ],
            },
            {
                id: "has-altin",
                h2: "İçinde ne kadar saf altın var?",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Bir ziynet altınının değerini belirleyen asıl şey, içindeki **has (saf) altın** miktarıdır. Bunu bulmak için brüt " +
                            "ağırlık ayar oranıyla çarpılır:",
                    },
                    {
                        t: "formula",
                        text: "Has altın (gram) = Brüt ağırlık × 0,916",
                        caption: "22 ayar = 916 milyem",
                    },
                    {
                        t: "ol",
                        items: [
                            "Çeyrek: 1,75 × 0,916 ≈ 1,60 gram has altın",
                            "Yarım: 3,50 × 0,916 ≈ 3,21 gram has altın",
                            "Tam: 7,00 × 0,916 ≈ 6,41 gram has altın",
                            "Cumhuriyet: 7,216 × 0,916 ≈ 6,61 gram has altın",
                        ],
                    },
                    {
                        t: "p",
                        text:
                            `Buradan bir çeyreğin teorik değerine ulaşmak kolaydır: has gram fiyatını yaklaşık 1,60 ile çarparsınız. Has gram ` +
                            `fiyatının nasıl hesaplandığını [gram altın rehberinde](/rehber/gram-altin-nasil-hesaplanir) anlattık; canlı ` +
                            `değer ve yorumcuların son görüşleri ${A("ALTIN", "altın sayfasında")}.`,
                    },
                ],
            },
            {
                id: "fiyat-farki",
                h2: "Çeyrek altının fiyatı neden hesapladığımdan yüksek?",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Kuyumcu ya da banka ekranındaki çeyrek fiyatı, yukarıdaki teorik değerin genellikle üzerindedir. Farkın kaynakları:",
                    },
                    {
                        t: "ul",
                        items: [
                            "**Basım ve işçilik payı:** ziynet altını basılmış bir üründür; ham altına göre üretim maliyeti taşır.",
                            "**Alış-satış makası:** satıcının size sattığı fiyat ile sizden aldığı fiyat arasındaki fark. Ziynet ürünlerinde bu fark külçeye göre çoğu zaman daha geniştir.",
                            "**Talep dalgalanması:** düğün mevsimi gibi dönemlerde ziynet altın talebi artar; fark açılabilir.",
                            "**Yeni ve eski tarihli ürün ayrımı:** basım yılı eski olan, el değiştirmiş ürünlerde aşınma ihtimali nedeniyle alım fiyatı daha düşük tutulabilir.",
                        ],
                    },
                    {
                        t: "note",
                        text:
                            "Aynı gün iki kuyumcuda çeyrek fiyatının farklı olması olağandır. Karşılaştırma yaparken her iki tarafın hem alış hem satış fiyatına bakmak, tek bir rakama bakmaktan daha doğru sonuç verir.",
                    },
                ],
            },
            {
                id: "ziynet-vs-gram",
                h2: "Ziynet altın, gram altın ve külçe arasındaki fark",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Üç ürün de sonuçta altındır ama elde tutma biçimleri ve maliyetleri farklıdır. Bu bir tercih önerisi değil, " +
                            "ürünlerin özelliklerinin karşılaştırmasıdır:",
                    },
                    {
                        t: "ul",
                        items: [
                            "**Külçe ve gram altın (24 ayar):** saflığı en yüksek üründür; işçilik payı genellikle düşüktür, fiyatı has altın fiyatına en yakın olandır.",
                            "**Ziynet altın (22 ayar):** bölünebilir ve kolay el değiştirir; kültürel kullanımı yaygındır, ancak basım payı ve makas fiyatına eklenir.",
                            "**Takı (bilezik, kolye):** ayarı ürüne göre değişir (22, 18, 14 ayar); işçilik bedeli en yüksek olan gruptur ve satarken çoğu zaman yalnızca altın değeri üzerinden işlem görür.",
                            "**Banka hesabındaki altın:** fiziki teslim yoktur; fiyat ekrandaki gram fiyatıdır, makas bankaya göre değişir.",
                        ],
                    },
                ],
            },
            {
                id: "sahte",
                h2: "Ziynet altında dikkat edilen noktalar",
                blocks: [
                    {
                        t: "ul",
                        items: [
                            "Ürünün ağırlığı hassas terazide tartılabilir; çeyrekte birkaç yüzde gramlık sapma olağandır, belirgin fark şüphe nedenidir.",
                            "Darphane basımı ürünler belirli bir kalıp, kenar tırtılı ve yazı düzenine sahiptir; tanınmış satıcılar bunları kontrol eder.",
                            "Fatura veya alım belgesi saklamak, ileride satışta ürünün kaynağını göstermeyi kolaylaştırır.",
                        ],
                    },
                ],
            },
        ],
        faq: [
            {
                q: "Çeyrek altın kaç gram ve kaç ayar?",
                a: "Çeyrek altın yaklaşık 1,75 gram ağırlığındadır ve 22 ayardır. İçindeki saf altın yaklaşık 1,60 gramdır.",
            },
            {
                q: "Tam altın ile Cumhuriyet altını aynı mı?",
                a: "Hayır. Tam altın yaklaşık 7,00 gram, Cumhuriyet (Ata) altını yaklaşık 7,216 gramdır; ikisi de 22 ayardır. Cumhuriyet altını biraz daha fazla saf altın içerir ve tasarımı farklıdır.",
            },
            {
                q: "Çeyrek altın fiyatı nasıl hesaplanır?",
                a: "Teorik değer, has gram altın fiyatının yaklaşık 1,60 ile çarpılmasıyla bulunur. Piyasadaki fiyat buna basım payı ve alış-satış makası eklenerek oluşur.",
            },
            {
                q: "Gremse altın nedir?",
                a: "Gremse, iki buçuk tam altın ağırlığında (yaklaşık 17,5 gram), 22 ayar basılan büyük bir ziynet altınıdır.",
            },
        ],
        assets: ["ALTIN", "GÜMÜŞ", "USD/TRY"],
        related: ["gram-altin-nasil-hesaplanir", "altin-fiyatini-ne-etkiler", "altin-gumus-orani-nedir"],
    },

    /* ------------------------------------------------------------------ */
    {
        slug: "altin-gumus-orani-nedir",
        title: "Altın/gümüş oranı nedir? Gümüş fiyatını ne etkiler?",
        metaTitle: "Altın/Gümüş Oranı Nedir? Gümüş Fiyatını Ne Etkiler",
        description:
            "Altın/gümüş oranı nasıl hesaplanır, ne anlatır, neyi anlatmaz? Gümüşü altından ayıran sanayi talebi, oynaklık ve gram gümüş hesabı.",
        category: "Altın ve madenler",
        published: "2026-10-18",
        updated: "2026-10-18",
        intro:
            "Gümüş çoğu zaman 'altının küçük kardeşi' diye anılır; oysa fiyatını belirleyen etkenlerin önemli bir kısmı altından farklıdır. " +
            "Bu yazıda yorumcuların sık kullandığı altın/gümüş oranını, gümüşü altından ayıran özellikleri ve gram gümüş hesabını anlatıyoruz.",
        sections: [
            {
                id: "oran",
                h2: "Altın/gümüş oranı nasıl hesaplanır?",
                blocks: [
                    {
                        t: "formula",
                        text: "Altın/gümüş oranı = Ons altın fiyatı ÷ Ons gümüş fiyatı",
                        caption: "İki fiyat da aynı birimde (genellikle dolar/ons) olmalı",
                    },
                    {
                        t: "p",
                        text:
                            "Oran, bir ons altınla kaç ons gümüş alınabileceğini gösterir. Örneğin (uydurma rakamlarla) ons altın 3.000 dolar, " +
                            "ons gümüş 40 dolar ise oran 75'tir. Oran birimden bağımsızdır: gram altın ve gram gümüş lira fiyatlarını bölerek de " +
                            "aynı sonuca ulaşırsınız, çünkü kur ve gram dönüşümü iki tarafta da aynıdır.",
                    },
                ],
            },
            {
                id: "ne-anlatir",
                h2: "Oran neyi anlatır, neyi anlatmaz?",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Oran yükseliyorsa altın gümüşe göre daha iyi performans gösteriyordur; düşüyorsa gümüş altına göre daha hızlı " +
                            "değer kazanıyordur (ya da daha yavaş kaybediyordur). Yorumcular oranı çoğu zaman 'tarihsel ortalamasına göre' " +
                            "yüksek ya da düşük diye değerlendirir.",
                    },
                    {
                        t: "p",
                        text: "Bu yaklaşımın sınırları da var:",
                    },
                    {
                        t: "ul",
                        items: [
                            "Oranın sabit bir 'doğru' değeri yoktur; on yıllar boyunca çok geniş bir aralıkta dalgalanmıştır.",
                            "Oranın ortalamaya döneceği varsayımı bir gözlemdir, kural değildir; uzun süre yüksek ya da düşük kalabilir.",
                            "Oran yalnızca göreli bir ölçüdür: ikisi birlikte düşerken de oran gümüş lehine dönebilir.",
                        ],
                    },
                ],
            },
            {
                id: "gumus-farki",
                h2: "Gümüşü altından ayıran üç özellik",
                blocks: [
                    {
                        t: "ul",
                        items: [
                            "**Sanayi talebi:** gümüşün önemli bir kısmı elektronik, güneş paneli, otomotiv ve tıp gibi alanlarda tüketilir. Bu yüzden gümüş, ekonomik büyüme beklentilerine altından daha duyarlıdır.",
                            "**Değer saklama rolü:** altın gibi gümüş de belirsizlik dönemlerinde talep görebilir, ancak merkez bankaları gümüşü rezerv olarak altın ölçüsünde tutmaz.",
                            "**Oynaklık:** gümüş piyasası altına göre çok daha küçüktür. Aynı büyüklükteki alım ya da satım fiyatı daha sert hareket ettirir; yükselişler de düşüşler de daha keskin olabilir.",
                        ],
                    },
                    {
                        t: "p",
                        text:
                            `Bu ikili yapı, gümüşün bazı dönemlerde altınla birlikte, bazı dönemlerde ise ${A("HG=F", "bakır")} gibi sanayi ` +
                            "metalleriyle birlikte hareket etmesini açıklar.",
                    },
                ],
            },
            {
                id: "gram-gumus",
                h2: "Gram gümüş nasıl hesaplanır?",
                blocks: [
                    {
                        t: "formula",
                        text: "Gram gümüş (TL) = Ons gümüş (USD) × Dolar/TL kuru ÷ 31,1035",
                        caption: "Gram altındaki formülle aynı; 1 troy ons = 31,1035 gram",
                    },
                    {
                        t: "p",
                        text:
                            "Örnek (uydurma rakamlar): ons gümüş 40 dolar, kur 40 lira ise 40 × 40 ÷ 31,1035 ≈ 51,4 TL. Fiziki gümüş alım " +
                            "satımında bu değere, altında olduğu gibi işçilik ve makas eklenir; gümüşte makas oransal olarak çoğu zaman daha geniştir.",
                    },
                ],
            },
            {
                id: "yorum-okuma",
                h2: "Gümüş yorumlarını okurken",
                blocks: [
                    {
                        t: "p",
                        text:
                            `Bir yorumcu gümüş için konuşurken gerekçesi sanayi talebi mi, yoksa altınla aynı 'güvenli liman' hikâyesi mi? İki ` +
                            `gerekçe farklı koşullarda geçerlidir. ${A("GÜMÜŞ", "Gümüş sayfasında")} her görüşün kısa gerekçesini ve videonun ` +
                            "bağlantısını görebilirsiniz; gerekçeyi bilmek, sayımı doğru okumanın yarısıdır.",
                    },
                ],
            },
        ],
        faq: [
            {
                q: "Altın/gümüş oranı yüksekse ne anlama gelir?",
                a: "Bir ons altınla daha fazla ons gümüş alınabildiği, yani gümüşün altına göre görece ucuz olduğu anlamına gelir. Oranın ne zaman ve ne yönde değişeceği ise bilinemez; tek başına bir sinyal değildir.",
            },
            {
                q: "Gümüş neden altından daha çok dalgalanır?",
                a: "Gümüş piyasası altına göre çok daha küçüktür ve talebin önemli bir kısmı sanayiye bağlıdır. Bu iki özellik fiyat hareketlerini sertleştirir.",
            },
            {
                q: "Gram gümüş nasıl hesaplanır?",
                a: "Ons gümüş fiyatı dolar/TL kuruyla çarpılıp 31,1035'e bölünür. Kuyumcu fiyatı buna işçilik ve alış-satış farkı eklenerek oluşur.",
            },
        ],
        assets: ["GÜMÜŞ", "ALTIN", "HG=F"],
        related: ["altin-fiyatini-ne-etkiler", "gram-altin-nasil-hesaplanir", "ceyrek-yarim-tam-altin-farki"],
    },

    /* ------------------------------------------------------------------ */
    {
        slug: "dolar-endeksi-dxy-nedir",
        title: "Dolar endeksi (DXY) nedir? Euro/dolar paritesi ve çapraz kur",
        metaTitle: "Dolar Endeksi (DXY) Nedir? Parite ve Çapraz Kur Hesabı",
        description:
            "Dolar endeksi DXY hangi para birimlerinden oluşur, neden euroya bu kadar bağlıdır? Euro/dolar paritesi, euro/TL çapraz kur hesabı ve DXY'nin altın ve gelişen piyasalarla ilişkisi.",
        category: "Döviz",
        published: "2026-10-18",
        updated: "2026-10-18",
        intro:
            "Yorumcular 'dolar güçleniyor' dediğinde çoğu zaman dolar/TL'yi değil, doların dünya genelindeki değerini kastederler. " +
            "Bunun en yaygın ölçüsü dolar endeksidir (DXY). Bu yazıda endeksin nasıl kurulduğunu, euro/dolar paritesiyle ilişkisini " +
            "ve çapraz kur hesabını anlatıyoruz.",
        sections: [
            {
                id: "dxy",
                h2: "DXY neyi ölçer?",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Dolar endeksi, ABD dolarının altı büyük para birimine karşı ağırlıklı ortalama değerini gösterir. Endeks 1973'te " +
                            "100 olarak başlatılmıştır; 110 değeri, doların o sepete karşı başlangıca göre yaklaşık %10 daha değerli olduğunu " +
                            "anlatır. Sepetteki para birimleri ve ağırlıkları şöyledir:",
                    },
                    {
                        t: "ul",
                        items: [
                            "**Euro:** %57,6",
                            "**Japon yeni:** %13,6",
                            "**İngiliz sterlini:** %11,9",
                            "**Kanada doları:** %9,1",
                            "**İsveç kronu:** %4,2",
                            "**İsviçre frangı:** %3,6",
                        ],
                    },
                    {
                        t: "p",
                        text:
                            "Ağırlıklar 1999'da euronun sepete girmesinden beri değişmemiştir. Çin yuanı ya da Türk lirası gibi para birimleri " +
                            "endekste yoktur; bu yüzden DXY, doların gelişen ülke paralarına karşı seyrini doğrudan göstermez.",
                    },
                ],
            },
            {
                id: "euro-agirligi",
                h2: "DXY neden neredeyse 'ters euro'dur?",
                blocks: [
                    {
                        t: "p",
                        text:
                            `Sepetin yarıdan fazlası euro olduğu için DXY ile ${A("EUR/USD", "euro/dolar paritesi")} çoğu zaman ayna gibi ` +
                            "hareket eder: parite yükselirken (euro güçlenirken) endeks düşer. Avrupa Merkez Bankası ile ABD Merkez Bankası " +
                            "(Fed) arasındaki faiz farkı beklentileri bu yüzden DXY'nin en önemli belirleyicilerinden biridir.",
                    },
                    {
                        t: "p",
                        text:
                            "Endeksi okurken 'dolar mı güçlendi, euro mu zayıfladı?' sorusunu sormak faydalıdır. Euro bölgesine özgü kötü bir " +
                            "haber de DXY'yi yükseltebilir; bu, doların her yerde güçlendiği anlamına gelmez.",
                    },
                ],
            },
            {
                id: "parite",
                h2: "Parite ve çapraz kur hesabı",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Parite, iki yabancı para biriminin birbirine oranıdır. EUR/USD = 1,10 demek, 1 euronun 1,10 dolar ettiği demektir. " +
                            "Türkiye'de euro/TL kuru doğrudan da işlem görür, ancak pratikte parite ve dolar/TL kuru üzerinden tutarlı kalır:",
                    },
                    {
                        t: "formula",
                        text: "Euro/TL ≈ EUR/USD paritesi × Dolar/TL kuru",
                        caption: "Çapraz kur: iki kurun çarpımı",
                    },
                    {
                        t: "p",
                        text:
                            `Örnek (uydurma rakamlar): parite 1,10, dolar/TL 40 ise euro/TL ≈ 44. Bu yüzden ${A("EUR/TRY", "euro/TL")} ` +
                            `dolar/TL sabitken bile hareket edebilir; tek neden paritenin değişmesidir. Dolar/TL'yi belirleyen etkenleri ` +
                            `[dolar kuru rehberinde](/rehber/dolar-kuru-neye-gore-belirlenir) anlattık.`,
                    },
                ],
            },
            {
                id: "etkiler",
                h2: "Güçlü dolar neyi etkiler?",
                blocks: [
                    {
                        t: "p",
                        text: "Aşağıdaki ilişkiler sık gözlenir ama her dönemde geçerli değildir:",
                    },
                    {
                        t: "ul",
                        items: [
                            `**Altın ve emtialar:** dolarla fiyatlandıkları için güçlü dolar çoğu zaman ${A("ALTIN", "altın")} ve ${A("CL=F", "petrol")} fiyatları üzerinde baskı yaratır; diğer para birimleriyle alan için aynı ürün pahalılaşır.`,
                            "**Gelişen piyasalar:** dolar cinsinden borcu olan ülke ve şirketler için güçlü dolar borç yükünü artırır; bu ülkelerin para birimleri çoğu zaman baskı altına girer.",
                            "**ABD şirketleri:** yurt dışı gelirlerinin dolar karşılığı azalır; bu, büyük ABD şirketlerinin kâr beklentilerine yansıyabilir.",
                        ],
                    },
                    {
                        t: "note",
                        text:
                            "DXY ile dolar/TL farklı şeyleri ölçer. DXY düşerken dolar/TL yükselebilir; çünkü dolar/TL'yi büyük ölçüde Türkiye'ye özgü etkenler (enflasyon farkı, faiz, cari denge) belirler.",
                    },
                ],
            },
        ],
        faq: [
            {
                q: "Dolar endeksi (DXY) nedir?",
                a: "ABD dolarının euro, yen, sterlin, Kanada doları, İsveç kronu ve İsviçre frangından oluşan bir sepete karşı ağırlıklı değeridir. 1973'te 100 olarak başlatılmıştır.",
            },
            {
                q: "DXY'de Türk lirası var mı?",
                a: "Hayır. Endekste yalnızca altı gelişmiş ülke para birimi vardır; Türk lirası ya da Çin yuanı gibi para birimleri yer almaz.",
            },
            {
                q: "Euro/TL nasıl hesaplanır?",
                a: "Yaklaşık olarak euro/dolar paritesi ile dolar/TL kurunun çarpımıdır. Parite 1,10, dolar/TL 40 ise euro/TL yaklaşık 44 olur (örnek rakamlar).",
            },
            {
                q: "Dolar endeksi yükselince altın düşer mi?",
                a: "Çoğu zaman ters yönde hareket ederler, çünkü altın dolarla fiyatlanır. Ancak jeopolitik risk gibi dönemlerde ikisi birlikte yükselebilir; ilişki kural değildir.",
            },
        ],
        assets: ["DXY", "EUR/USD", "EUR/TRY", "USD/TRY"],
        related: ["dolar-kuru-neye-gore-belirlenir", "faiz-karari-piyasalari-nasil-etkiler", "abd-10-yillik-tahvil-faizi-neden-onemli"],
    },

    /* ------------------------------------------------------------------ */
    {
        slug: "sp-500-nasdaq-dow-jones-farki",
        title: "S&P 500, Nasdaq ve Dow Jones arasındaki fark nedir?",
        metaTitle: "S&P 500, Nasdaq ve Dow Jones Farkı: ABD Endeksleri Rehberi",
        description:
            "ABD borsasının üç ana endeksi S&P 500, Nasdaq ve Dow Jones nasıl hesaplanır, hangi şirketleri içerir, neden farklı hareket eder? Nasdaq-100 ile Nasdaq Composite farkı.",
        category: "Borsa",
        published: "2026-10-18",
        updated: "2026-10-18",
        intro:
            "Haberlerde 'ABD borsaları' diye tek bir şeymiş gibi anılan şey aslında farklı kurallarla hesaplanan birkaç endekstir. " +
            "S&P 500, Nasdaq ve Dow Jones aynı gün farklı yönlere gidebilir. Bu yazıda her birinin nasıl kurulduğunu ve yorumcuların " +
            "hangisini kastettiğini nasıl anlayacağınızı anlatıyoruz.",
        sections: [
            {
                id: "sp500",
                h2: "S&P 500: ABD ekonomisinin genel fotoğrafı",
                blocks: [
                    {
                        t: "p",
                        text:
                            "S&P 500, ABD'de işlem gören yaklaşık 500 büyük şirketten oluşur. Şirketler bir komite tarafından seçilir; büyüklük " +
                            "ve likiditenin yanında kârlılık gibi ölçütler de aranır. Endeks **piyasa değeriyle ağırlıklandırılır**: değeri büyük " +
                            "olan şirketin endekse etkisi de büyüktür.",
                    },
                    {
                        t: "p",
                        text:
                            `Teknoloji, sağlık, finans, enerji, sanayi gibi bütün ana sektörleri içerdiği için ${A("SP500", "S&P 500")} çoğu ` +
                            "yatırımcı ve yorumcu için 'ABD borsası' denince ilk akla gelen ölçüdür. Son yıllarda en büyük birkaç teknoloji " +
                            "şirketinin endeks içindeki payı belirgin biçimde arttı; bu, endeksin bu şirketlere duyarlılığını da artırdı.",
                    },
                ],
            },
            {
                id: "nasdaq",
                h2: "Nasdaq: Composite ve Nasdaq-100",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Nasdaq aslında bir borsanın adıdır ve iki farklı endeks bu adı taşır. Yorumcular 'Nasdaq' dediğinde hangisini " +
                            "kastettiklerini çoğu zaman belirtmez:",
                    },
                    {
                        t: "ul",
                        items: [
                            "**Nasdaq Composite:** Nasdaq borsasında işlem gören binlerce şirketin neredeyse tamamını içerir.",
                            "**Nasdaq-100:** Nasdaq'ta işlem gören, finans sektörü dışındaki en büyük 100 şirketten oluşur. Vadeli işlemler ve fonlar çoğunlukla bu endeksi takip eder.",
                        ],
                    },
                    {
                        t: "p",
                        text:
                            `Her iki endekste de teknoloji ağırlığı yüksektir. Bu yüzden ${A("NASDAQ", "Nasdaq")}, faiz beklentilerine ve büyük ` +
                            `teknoloji şirketlerinin bilançolarına S&P 500'den daha duyarlı olma eğilimindedir. Örneğin ${A("NVDA", "Nvidia")} ` +
                            "gibi tek bir şirketin bilançosu bile endeksi belirgin hareket ettirebilir.",
                    },
                ],
            },
            {
                id: "dow",
                h2: "Dow Jones: 30 şirket, fiyat ağırlıklı",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Dow Jones Sanayi Ortalaması 19. yüzyılın sonundan beri hesaplanan, en eski ABD endekslerinden biridir ve yalnızca " +
                            "30 büyük şirketten oluşur. En önemli farkı **fiyat ağırlıklı** olmasıdır: hisse fiyatı yüksek olan şirket, piyasa " +
                            "değeri daha küçük olsa bile endekse daha çok etki eder.",
                    },
                    {
                        t: "p",
                        text:
                            "Bu yöntem bugün pek kullanılmaz; ama endeksin uzun geçmişi ve haberlerdeki yaygınlığı yüzünden Dow Jones hâlâ sık " +
                            "anılır. Az sayıda şirket içerdiği için genel piyasayı S&P 500 kadar geniş temsil etmez.",
                    },
                ],
            },
            {
                id: "karsilastirma",
                h2: "Üç endeks neden farklı hareket eder?",
                blocks: [
                    {
                        t: "ul",
                        items: [
                            "**Sektör karışımı:** teknoloji hisseleri düşerken enerji ve finans yükseliyorsa Nasdaq düşer, Dow Jones yükselebilir.",
                            "**Ağırlık yöntemi:** piyasa değeri ağırlığı büyük şirketleri, fiyat ağırlığı yüksek fiyatlı hisseleri öne çıkarır.",
                            "**Şirket sayısı:** 30 şirketlik bir endekste tek bir şirketin haberi, 500 şirketlik bir endekse göre daha büyük iz bırakır.",
                        ],
                    },
                    {
                        t: "p",
                        text:
                            `Geniş ABD piyasası hakkındaki görüşleri ayrıca ${A("ABD-HISSE", "ABD hisseleri")} başlığında topluyoruz; bir ` +
                            "yorumcu belirli bir endeks adı vermeden 'Amerikan borsası' dediğinde sayım oraya gider.",
                    },
                ],
            },
            {
                id: "saatler",
                h2: "İşlem saatleri ve vadeli kontratlar",
                blocks: [
                    {
                        t: "p",
                        text:
                            "ABD borsaları New York saatiyle 09.30–16.00 arasında açıktır; bu, Türkiye saatiyle genellikle akşamüstü ile gece " +
                            "yarısı arasına denk gelir (yaz saati uygulamasına göre bir saat kayar). Endekslerin vadeli kontratları ise neredeyse " +
                            "gün boyu işlem gördüğü için sabah saatlerinde gördüğünüz 'ABD vadelileri' borsa açılmadan önceki beklentiyi yansıtır.",
                    },
                    {
                        t: "note",
                        text:
                            "Endeksin kendisi alınıp satılan bir ürün değildir; bir hesaplamadır. Endeksi takip eden fonlar ve vadeli kontratlar ayrı ürünlerdir ve her birinin kendi maliyeti ile riski vardır.",
                    },
                ],
            },
        ],
        faq: [
            {
                q: "S&P 500 ile Nasdaq arasındaki fark nedir?",
                a: "S&P 500 tüm sektörlerden yaklaşık 500 büyük ABD şirketini içerir. Nasdaq endeksleri ise Nasdaq borsasındaki şirketlerden oluşur ve teknoloji ağırlığı daha yüksektir; bu yüzden faiz ve teknoloji haberlerine daha duyarlıdır.",
            },
            {
                q: "Nasdaq-100 ile Nasdaq Composite aynı mı?",
                a: "Hayır. Composite, Nasdaq'taki binlerce şirketin neredeyse tamamını; Nasdaq-100 ise finans dışındaki en büyük 100 şirketi içerir.",
            },
            {
                q: "Dow Jones neden fiyat ağırlıklı?",
                a: "Endeks 19. yüzyılda hisse fiyatlarının basit ortalaması olarak kuruldu ve bu yöntem korundu. Bu yüzden hisse fiyatı yüksek olan şirketin endekse etkisi daha büyüktür.",
            },
            {
                q: "ABD borsası Türkiye saatiyle kaçta açılır?",
                a: "New York saatiyle 09.30'da açılır; bu, Türkiye saatiyle yaz saati uygulamasına bağlı olarak genellikle 16.30 ya da 17.30'a denk gelir.",
            },
        ],
        assets: ["SP500", "NASDAQ", "ABD-HISSE", "NVDA"],
        related: ["fk-orani-nedir-hisse-degerleme", "abd-10-yillik-tahvil-faizi-neden-onemli", "bist-100-nedir"],
    },

    /* ------------------------------------------------------------------ */
    {
        slug: "fk-orani-nedir-hisse-degerleme",
        title: "F/K oranı nedir? PD/DD, FD/FAVÖK ve temettü verimi",
        metaTitle: "F/K Oranı Nedir? PD/DD ve FD/FAVÖK ile Hisse Değerleme",
        description:
            "Fiyat/kazanç (F/K), piyasa değeri/defter değeri (PD/DD), FD/FAVÖK ve temettü verimi nasıl hesaplanır, ne anlatır? Rasyoları okurken yapılan yaygın hatalar.",
        category: "Borsa",
        published: "2026-10-18",
        updated: "2026-10-18",
        intro:
            "Bir yorumcu 'hisse ucuz' ya da 'pahalı' dediğinde çoğu zaman arkasında birkaç rasyo vardır. Bu yazıda en sık kullanılan " +
            "değerleme oranlarının nasıl hesaplandığını, ne anlattığını ve tek başına neden yeterli olmadığını örneklerle anlatıyoruz.",
        sections: [
            {
                id: "fk",
                h2: "F/K: fiyat / kazanç",
                blocks: [
                    {
                        t: "formula",
                        text: "F/K = Hisse fiyatı ÷ Hisse başına net kâr  =  Piyasa değeri ÷ Yıllık net kâr",
                    },
                    {
                        t: "p",
                        text:
                            "F/K, şirketin bugünkü kârıyla piyasa değerini kaç yılda 'geri kazandıracağını' kabaca gösterir. Örnek (uydurma " +
                            "rakamlar): piyasa değeri 10 milyar TL, son 12 aylık net kârı 1 milyar TL olan bir şirketin F/K'sı 10'dur.",
                    },
                    {
                        t: "p",
                        text: "F/K'yı okurken dikkat edilen noktalar:",
                    },
                    {
                        t: "ul",
                        items: [
                            "**Geçmiş mi, beklenen mi?** Son 12 ayın kârıyla hesaplanan F/K ile gelecek yıl beklentisiyle hesaplanan F/K farklı sonuç verir.",
                            "**Tek seferlik kalemler:** bir varlık satışından gelen kâr F/K'yı yapay olarak düşürür.",
                            "**Zarar eden şirket:** kâr negatifse F/K anlamsızdır.",
                            "**Sektör farkı:** hızlı büyüyen sektörlerde F/K yapısal olarak yüksek, olgun sektörlerde düşük olabilir. Karşılaştırma aynı sektör içinde daha anlamlıdır.",
                        ],
                    },
                ],
            },
            {
                id: "pddd",
                h2: "PD/DD: piyasa değeri / defter değeri",
                blocks: [
                    {
                        t: "formula",
                        text: "PD/DD = Piyasa değeri ÷ Özkaynaklar",
                    },
                    {
                        t: "p",
                        text:
                            "Defter değeri, şirketin varlıklarından borçları düşüldüğünde kalan özkaynaktır. PD/DD 1'in altındaysa piyasa şirkete " +
                            "muhasebe kayıtlarındaki net varlığından daha düşük değer biçiyor demektir. Bu oran özellikle bilançosu büyük ölçüde " +
                            `finansal varlıklardan oluşan ${A("BANKA-HISSE", "banka hisselerinde")} yaygın kullanılır.`,
                    },
                    {
                        t: "p",
                        text:
                            "Düşük PD/DD her zaman 'ucuzluk' anlamına gelmez; piyasa, şirketin özkaynağını zamanla eriteceğini ya da varlıkların " +
                            "kayıtlardaki değerini taşımadığını düşünüyor olabilir.",
                    },
                ],
            },
            {
                id: "fd-favok",
                h2: "FD/FAVÖK: borcu da hesaba katan oran",
                blocks: [
                    {
                        t: "formula",
                        text: "FD/FAVÖK = (Piyasa değeri + Net borç) ÷ Faiz, amortisman ve vergi öncesi kâr",
                        caption: "FD: firma değeri",
                    },
                    {
                        t: "p",
                        text:
                            "F/K yalnızca hissedarın payına bakar. FD/FAVÖK ise şirketin borcunu da değerine ekler ve faaliyet kârıyla karşılaştırır. " +
                            "Bu yüzden borç yapısı farklı şirketleri karşılaştırmak için daha uygundur; sanayi, enerji ve perakende gibi yoğun " +
                            "yatırım gerektiren sektörlerde sık kullanılır. Bankalar için ise anlamlı değildir, çünkü borç bankanın hammaddesidir.",
                    },
                ],
            },
            {
                id: "temettu",
                h2: "Temettü verimi",
                blocks: [
                    {
                        t: "formula",
                        text: "Temettü verimi = Hisse başına yıllık temettü ÷ Hisse fiyatı",
                    },
                    {
                        t: "p",
                        text:
                            "Temettü verimi, hisse fiyatına göre dağıtılan kâr payının oranıdır. Yüksek verim, fiyatın düşmüş olmasından da " +
                            "kaynaklanabilir; bu yüzden şirketin kârının bu dağıtımı sürdürüp sürdüremeyeceğine (dağıtım oranına) da bakılır. " +
                            "Temettü ödendiği gün hisse fiyatı genellikle temettü tutarı kadar düzeltilir.",
                    },
                ],
            },
            {
                id: "turkiye",
                h2: "Türkiye'de rasyoları okurken: enflasyon muhasebesi",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Yüksek enflasyon dönemlerinde geçmiş yıllara ait kâr ve özkaynak rakamları bugünün parasıyla karşılaştırılabilir " +
                            "değildir. Türkiye'de şirketler 2023 yılı sonundan itibaren finansal tablolarını enflasyon muhasebesine (TMS 29) göre " +
                            "düzeltmeye başladı. Bu, bazı şirketlerin kârını belirgin biçimde değiştirdi; düzeltme öncesi ve sonrası rasyoları " +
                            "karşılaştırırken bu fark akılda tutulmalıdır.",
                    },
                    {
                        t: "p",
                        text:
                            `Endeks düzeyinde de F/K hesaplanır; ${A("XU100", "BIST 100")} için yapılan 'piyasa ucuz/pahalı' yorumları çoğu ` +
                            `zaman endeksin toplam F/K'sına dayanır. Endeksin nasıl kurulduğunu [BIST 100 rehberinde](/rehber/bist-100-nedir) anlattık.`,
                    },
                    {
                        t: "note",
                        text:
                            "Hiçbir rasyo tek başına bir hissenin ucuz ya da pahalı olduğunu kanıtlamaz. Rasyolar, şirketin büyümesi, borcu, sektörü ve riskiyle birlikte okunduğunda anlam kazanır.",
                    },
                ],
            },
        ],
        faq: [
            {
                q: "F/K oranı ne anlatır?",
                a: "Hisse fiyatının hisse başına yıllık net kârın kaç katı olduğunu gösterir. Piyasanın şirketin bir birim kârı için ne kadar ödemeye razı olduğunun kaba bir ölçüsüdür.",
            },
            {
                q: "Düşük F/K hissenin ucuz olduğu anlamına gelir mi?",
                a: "Her zaman değil. Kârın tek seferlik olması, düşmesinin beklenmesi ya da sektörün yapısı F/K'yı düşük gösterebilir. Karşılaştırma aynı sektördeki şirketlerle ve beklenen kârla yapıldığında daha anlamlıdır.",
            },
            {
                q: "Bankalar için neden PD/DD kullanılır?",
                a: "Bankaların bilançosu büyük ölçüde finansal varlık ve yükümlülüklerden oluşur; özkaynak, bankanın değerinin daha doğrudan bir ölçüsüdür. FD/FAVÖK ise bankalar için anlamlı değildir.",
            },
            {
                q: "FAVÖK nedir?",
                a: "Faiz, amortisman ve vergi öncesi kârdır. Şirketin finansman yapısından ve muhasebe tercihlerinden bağımsız faaliyet kârlılığını görmeye yarar.",
            },
        ],
        assets: ["XU100", "BANKA-HISSE", "SP500"],
        related: ["bist-100-nedir", "sp-500-nasdaq-dow-jones-farki", "youtube-ekonomist-yorumlari-nasil-okunur"],
    },

    /* ------------------------------------------------------------------ */
    {
        slug: "ethereum-nedir-bitcoin-farki",
        title: "Ethereum nedir? Bitcoin'den farkı, akıllı sözleşmeler ve staking",
        metaTitle: "Ethereum Nedir? Bitcoin'den Farkı ve Akıllı Sözleşmeler",
        description:
            "Ethereum ve ether nedir, Bitcoin'den nasıl ayrılır? Akıllı sözleşmeler, gas ücreti, 2022'deki hisse kanıtına geçiş (Merge), staking ve katman 2 ağları.",
        category: "Kripto",
        published: "2026-10-18",
        updated: "2026-10-18",
        intro:
            "Bitcoin'den sonra en çok konuşulan kripto varlık Ethereum'dur; ama ikisi aynı işi yapmak için tasarlanmamıştır. Bu yazıda " +
            "Ethereum'un ne olduğunu, Bitcoin'den hangi noktalarda ayrıldığını ve yorumlarda sık geçen 'gas', 'staking', 'katman 2' " +
            "kavramlarını anlatıyoruz.",
        sections: [
            {
                id: "nedir",
                h2: "Ethereum ve ether: ağ ve para birimi",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Ethereum, 2015'te çalışmaya başlayan, üzerinde program çalıştırılabilen bir blokzinciri ağıdır. Ağın kendi para " +
                            "birimine **ether (ETH)** denir; günlük dilde ağ ile para birimi çoğu zaman aynı adla anılır. Ether, ağda işlem " +
                            "yapmanın ve program çalıştırmanın ücretini ödemek için kullanılır.",
                    },
                    {
                        t: "p",
                        text:
                            `[Bitcoin](/rehber/bitcoin-nedir-halving-nedir) öncelikle bir dijital para ve değer saklama aracı olarak ` +
                            "tasarlanmıştır. Ethereum ise bir 'dünya bilgisayarı' fikrinden doğmuştur: herkesin üzerinde uygulama " +
                            "çalıştırabileceği ortak bir altyapı.",
                    },
                ],
            },
            {
                id: "akilli-sozlesme",
                h2: "Akıllı sözleşme nedir?",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Akıllı sözleşme, blokzincirine yüklenen ve belirli koşullar gerçekleştiğinde kendiliğinden çalışan bir programdır. " +
                            "Bir kez yüklendikten sonra kodu herkes görebilir ve kimse tek başına durduramaz. Ethereum üzerindeki pek çok " +
                            "uygulama bu sözleşmelerle çalışır:",
                    },
                    {
                        t: "ul",
                        items: [
                            "**Merkeziyetsiz finans (DeFi):** borç verme, takas ve getiri uygulamaları.",
                            "**Sabit paralar (stablecoin):** dolara endeksli tokenların önemli bir kısmı Ethereum üzerinde çıkarılır.",
                            "**Tokenlar ve NFT'ler:** ağ üzerinde yeni dijital varlıklar oluşturulabilir.",
                        ],
                    },
                    {
                        t: "note",
                        text:
                            "Kod herkese açık olsa da hatasız değildir. Akıllı sözleşmelerdeki açıklar geçmişte büyük kayıplara yol açtı; 'blokzincirinde' olmak bir uygulamanın güvenli olduğu anlamına gelmez.",
                    },
                ],
            },
            {
                id: "gas",
                h2: "Gas ücreti",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Ethereum'da her işlem ve her program adımı belirli bir hesaplama maliyeti taşır; buna **gas** denir. Kullanıcı bu " +
                            "maliyeti ether ile öder. Ağ yoğunlaştığında gas ücreti yükselir, sakin dönemlerde düşer. 2021'den bu yana ödenen " +
                            "ücretin bir kısmı 'yakılarak' dolaşımdan çıkarılır; bu, ağ kullanımı ile ether arzı arasında bir bağ kurar.",
                    },
                ],
            },
            {
                id: "merge",
                h2: "İş kanıtından hisse kanıtına: Merge ve staking",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Bitcoin, işlemleri doğrulamak için **iş kanıtı** (proof of work) kullanır: madenciler yoğun elektrik harcayarak " +
                            "bulmaca çözer. Ethereum da başlangıçta böyleydi; Eylül 2022'deki 'Merge' güncellemesiyle **hisse kanıtına** " +
                            "(proof of stake) geçti. Bu geçişle ağın enerji tüketimi çok büyük ölçüde azaldı.",
                    },
                    {
                        t: "p",
                        text:
                            "Hisse kanıtında işlemleri doğrulayanlar, ağa belirli miktarda ether kilitleyen 'doğrulayıcılardır'. Bu kilitleme " +
                            "işlemine **staking** denir ve karşılığında ödül alınır. Staking'in de riskleri vardır: kilitli varlığa erişim " +
                            "gecikebilir, kurallara uymayan doğrulayıcının payı kesilebilir ve aracı platformlar ayrı bir risk katmanı ekler.",
                    },
                ],
            },
            {
                id: "fark",
                h2: "Bitcoin ile Ethereum: özet karşılaştırma",
                blocks: [
                    {
                        t: "ul",
                        items: [
                            "**Amaç:** Bitcoin dijital para ve değer saklama; Ethereum uygulama altyapısı.",
                            "**Arz:** Bitcoin'in en fazla 21 milyon adetlik sabit üst sınırı vardır. Ether'in sabit bir üst sınırı yoktur; arz, yeni basılan ve yakılan miktarın dengesine göre değişir.",
                            "**Doğrulama:** Bitcoin iş kanıtı, Ethereum hisse kanıtı kullanır.",
                            "**Fiyatı etkileyenler:** Bitcoin daha çok makro ve kurumsal talep hikâyesiyle; Ethereum bunlara ek olarak ağ kullanımı, uygulama ekosistemi ve rekabet eden ağlarla birlikte konuşulur.",
                        ],
                    },
                    {
                        t: "p",
                        text:
                            "Katman 2 (layer 2) ağları, işlemleri Ethereum'un dışında toplu olarak işleyip sonucu ana ağa yazan ve böylece " +
                            "ücretleri düşüren ağlardır. Ethereum'un ölçeklenme stratejisinin önemli bir parçasıdır; ancak ana ağdaki ücret " +
                            "gelirini azalttığı için yorumcular arasında tartışılan bir konudur.",
                    },
                    {
                        t: "p",
                        text:
                            `Güncel görüş sayımı için ${A("ETH", "Ethereum sayfasına")}, kripto piyasasının geneli hakkındaki yorumlar için ` +
                            `${A("KRIPTO", "kripto paralar")} başlığına bakabilirsiniz.`,
                    },
                ],
            },
        ],
        faq: [
            {
                q: "Ethereum ile ether aynı şey mi?",
                a: "Ethereum ağın adıdır; ether (ETH) ise bu ağın para birimidir. Günlük dilde ikisi çoğu zaman aynı anlamda kullanılır.",
            },
            {
                q: "Ethereum'un arzı sınırlı mı?",
                a: "Bitcoin'deki gibi sabit bir üst sınır yoktur. Yeni ether doğrulayıcılara ödül olarak basılır, işlem ücretlerinin bir kısmı ise yakılır; toplam arz bu ikisinin dengesine göre değişir.",
            },
            {
                q: "Staking nedir?",
                a: "Hisse kanıtı kullanan ağlarda, işlemleri doğrulamaya katılmak için varlığın ağa kilitlenmesidir. Karşılığında ödül verilir; ancak erişim gecikmesi, ceza kesintisi ve aracı platform riski gibi riskleri vardır.",
            },
            {
                q: "Gas ücreti neden değişiyor?",
                a: "Gas, ağdaki hesaplama alanının fiyatıdır. Ağ yoğunlaştığında kullanıcılar sıraya girmek için daha yüksek ücret önerir, sakin dönemlerde ücret düşer.",
            },
        ],
        assets: ["ETH", "BTC", "KRIPTO"],
        related: ["bitcoin-nedir-halving-nedir", "yatirim-dolandiriciligi-nasil-anlasilir", "youtube-ekonomist-yorumlari-nasil-okunur"],
    },
];
