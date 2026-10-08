/**
 * VARLIK PROFİLLERİ — sayfaya özgü, zamanla ESKİMEYEN açıklama metinleri.
 *
 * Varlık sayfalarının canlı kısmı (kaç analist ne dedi) her sayfada aynı
 * şablondan çıkar. Arama motorunun o sayfayı "kendine özgü" görmesi ve
 * okuyucunun orada gerçekten bir şey öğrenmesi için sayıların yanına,
 * varlığın ne olduğunu ve fiyatını neyin etkilediğini anlatan bir bölüm
 * koyuyoruz. Buradaki metin:
 *
 *  - güncel fiyat, oran, tarih ya da tahmin İÇERMEZ (eskirse yalan söyler),
 *  - al/sat anlamına gelen hiçbir cümle kurmaz (README: hukuki tasarım kararları),
 *  - ilişkileri "genellikle", "çoğu zaman" diye yazar; piyasada kesin kural yoktur.
 *
 * Bir varlık için profil yoksa sayfa yine çalışır, yalnızca bu bölümü göstermez.
 */

import { BIST_TICKERS } from "@/lib/slug";

export type AssetKind =
    | "maden" | "doviz" | "endeks" | "kripto" | "emtia"
    | "hisse-bist" | "hisse-abd" | "tahvil" | "sinif";

export interface AssetProfile {
    kind: AssetKind;
    /** Başlıkta ve cümlelerde geçen ad (verilmezse varlık etiketi). */
    name?: string;
    /** İnsanların aynı şey için kullandığı diğer adlar: arama eşanlamlıları. */
    also?: string[];
    /** "X nedir?" — 1-2 cümle. */
    summary: string;
    /** "X fiyatını ne etkiler?" — başlık + 1-2 cümle. */
    drivers: { t: string; d: string }[];
    /** Varlığa özgü sorular. Genel sorular (güncelleme, tavsiye) sayfa tarafından eklenir. */
    faq: { q: string; a: string }[];
    /** Rehber yazılarının adresleri (src/content/guides.ts). */
    guides: string[];
    /** İlgili varlık kodları. */
    related: string[];
}

export const ASSET_PROFILES: Record<string, AssetProfile> = {
    ALTIN: {
        kind: "maden",
        also: ["gram altın", "ons altın", "XAU/USD"],
        summary:
            "Altın, hem uluslararası piyasada ons cinsinden dolarla hem de Türkiye'de gram cinsinden " +
            "lirayla takip edilen değerli madendir. Bu sayfadaki fiyat, 24 ayar gram altının lira karşılığıdır: " +
            "ons fiyatı 31,1035'e bölünüp dolar kuruyla çarpılarak hesaplanır.",
        drivers: [
            {
                t: "Ons fiyatı ve dolar/TL kuru",
                d: "Gram altın iki şeye birden bağlıdır: uluslararası ons fiyatına ve dolar kuruna. Ons yerinde dururken " +
                    "kur yükselirse gram altın lira cinsinden yükselir; kur sabitken ons düşerse gram altın da düşer.",
            },
            {
                t: "Faiz beklentileri",
                d: "Altın faiz ya da temettü getirmez. Bu yüzden ABD başta olmak üzere faiz beklentileri ve reel getiriler " +
                    "altına olan ilginin en çok konuşulan belirleyicilerinden biridir; ilişki her dönemde aynı işlemez.",
            },
            {
                t: "Dolar endeksi",
                d: "Altın dolar üzerinden fiyatlandığı için doların diğer para birimleri karşısındaki gücü (DXY) ons fiyatıyla " +
                    "çoğu zaman ters yönde hareket eder.",
            },
            {
                t: "Jeopolitik belirsizlik ve merkez bankaları",
                d: "Savaş, kriz ve belirsizlik dönemlerinde altına 'güvenli liman' talebi gelir. Merkez bankalarının rezerv " +
                    "amaçlı alımları ve ziynet talebi de fiyata etki eden yapısal kalemlerdir.",
            },
        ],
        faq: [
            {
                q: "Gram altın nasıl hesaplanır?",
                a: "Gram altın (24 ayar) kabaca ons altın fiyatının 31,1035'e bölünüp dolar/TL kuruyla çarpılmasıyla bulunur. " +
                    "Kuyumcudaki satış fiyatı bunun üzerine işçilik ve kuyumcu marjı eklendiği için farklıdır.",
            },
            {
                q: "Ons altın ile gram altın arasındaki fark nedir?",
                a: "Ons, uluslararası piyasada kullanılan ağırlık birimidir (1 ons = 31,1035 gram) ve fiyatı dolarla belirtilir. " +
                    "Gram altın ise Türkiye'de gündelik olarak izlenen, lirayla belirtilen fiyattır.",
            },
        ],
        guides: ["gram-altin-nasil-hesaplanir", "altin-fiyatini-ne-etkiler", "youtube-ekonomist-yorumlari-nasil-okunur"],
        related: ["GÜMÜŞ", "USD/TRY", "XU100", "BTC"],
    },

    "GÜMÜŞ": {
        kind: "maden",
        also: ["gram gümüş", "ons gümüş", "XAG/USD"],
        summary:
            "Gümüş hem değerli maden hem de sanayi metalidir. Bu sayfadaki fiyat gram gümüşün lira karşılığıdır; " +
            "ons fiyatı gram birimine çevrilip dolar kuruyla çarpılarak hesaplanır.",
        drivers: [
            {
                t: "Altınla birlikte hareket eder, ama daha oynaktır",
                d: "Gümüş çoğu zaman altının yönünü izler; fakat piyasası daha küçük olduğu için fiyatı genellikle daha sert dalgalanır.",
            },
            {
                t: "Sanayi talebi",
                d: "Gümüşün önemli bir bölümü güneş enerjisi panelleri, elektronik ve otomotiv gibi sanayi kollarında kullanılır. " +
                    "Küresel sanayi üretimi ve yatırım iştahı bu yüzden fiyata etki eder.",
            },
            {
                t: "Altın/gümüş rasyosu",
                d: "Bir ons altının kaç ons gümüşe denk geldiğini gösteren oran, iki madenin birbirine göre pahalı ya da ucuz " +
                    "kaldığını tartışmak için sık kullanılır.",
            },
            {
                t: "Dolar kuru ve faiz beklentileri",
                d: "Altında olduğu gibi dolar endeksi, ABD faiz beklentileri ve dolar/TL kuru gümüşün lira fiyatını belirleyen unsurlardandır.",
            },
        ],
        faq: [
            {
                q: "Gümüş neden altından daha çok dalgalanır?",
                a: "Gümüş piyasası altına göre çok daha küçüktür; aynı büyüklükteki bir alım ya da satış emri fiyatı daha fazla oynatır. " +
                    "Ayrıca sanayi talebi nedeniyle ekonomik büyüme haberlerine de duyarlıdır.",
            },
        ],
        guides: ["altin-fiyatini-ne-etkiler", "youtube-ekonomist-yorumlari-nasil-okunur"],
        related: ["ALTIN", "PL=F", "HG=F", "USD/TRY"],
    },

    "USD/TRY": {
        kind: "doviz",
        name: "Dolar",
        also: ["dolar kuru", "dolar/TL", "USD/TRY", "dolar kaç TL"],
        summary:
            "USD/TRY, bir ABD dolarının kaç Türk lirası ettiğini gösteren paritedir. Türkiye'de ithalat, borçlanma, " +
            "tasarruf ve fiyatlama kararlarının merkezindeki göstergelerden biri olduğu için en çok konuşulan varlıktır.",
        drivers: [
            {
                t: "Merkez Bankası'nın faiz ve para politikası",
                d: "TCMB'nin politika faizi ve kullandığı diğer araçlar, liraya olan talebi ve dolaylı olarak kuru etkiler.",
            },
            {
                t: "Enflasyon farkı",
                d: "Türkiye'deki enflasyon ABD'dekinden uzun süre yüksek seyrettiğinde, lira doların karşısında satın alma gücü " +
                    "kaybeder; kurun yükselme eğilimini açıklarken en sık başvurulan çerçeve budur.",
            },
            {
                t: "Dış finansman ve cari denge",
                d: "İhracat, turizm geliri, enerji ithalatı ve yabancı sermaye girişleri döviz arzı ve talebini belirler.",
            },
            {
                t: "Küresel dolar ve risk iştahı",
                d: "ABD faizleri, dolar endeksi ve gelişmekte olan ülkelere yönelik yatırımcı iştahı kuru Türkiye'den bağımsız " +
                    "gelişmelerle de hareket ettirebilir.",
            },
        ],
        faq: [
            {
                q: "USD/TRY ne demek?",
                a: "Para birimi çiftinin kısaltmasıdır: 1 ABD dolarının kaç Türk lirası ettiğini gösterir. Fiyat 40 ise 1 dolar 40 liradır. " +
                    "(Bu bir örnektir, güncel kuru değil.)",
            },
            {
                q: "Dolar kurunu kim belirler?",
                a: "Kur, piyasadaki döviz arz ve talebiyle oluşur. Merkez Bankası politika faizi, rezerv kullanımı ve düzenlemelerle " +
                    "bu süreci etkileyebilir ama tek başına belirlemez.",
            },
        ],
        guides: ["dolar-kuru-neye-gore-belirlenir", "faiz-karari-piyasalari-nasil-etkiler", "youtube-ekonomist-yorumlari-nasil-okunur"],
        related: ["EUR/TRY", "ALTIN", "XU100", "DXY"],
    },

    "EUR/TRY": {
        kind: "doviz",
        name: "Euro",
        also: ["euro kuru", "euro/TL", "EUR/TRY"],
        summary:
            "EUR/TRY, bir euronun kaç Türk lirası ettiğini gösterir. Avrupa Birliği Türkiye'nin en büyük ticaret " +
            "ortaklarından biri olduğundan, özellikle ihracatçılar ve Avrupa'yla alışverişi olanlar için dolar kadar önemlidir.",
        drivers: [
            {
                t: "EUR/USD paritesi",
                d: "Euro/TL kuru kabaca dolar/TL ile EUR/USD paritesinin çarpımıdır. Parite yükselirken dolar/TL sabit kalsa bile euro/TL yükselir.",
            },
            {
                t: "Avrupa Merkez Bankası (ECB) politikası",
                d: "ECB'nin faiz kararları ve enflasyon görünümü euronun değerini belirleyen ana kalemlerdir.",
            },
            {
                t: "Türkiye'ye özgü etkenler",
                d: "TCMB politikası, enflasyon ve cari denge liranın euro karşısındaki seyrini dolarda olduğu gibi etkiler.",
            },
        ],
        faq: [
            {
                q: "Euro/TL kuru nasıl oluşur?",
                a: "Doğrudan işlem gören bir çift olmasının yanında, dolar/TL ve EUR/USD kurlarından türetilen 'çapraz kur' mantığıyla da tutarlı kalır.",
            },
        ],
        guides: ["dolar-kuru-neye-gore-belirlenir", "faiz-karari-piyasalari-nasil-etkiler"],
        related: ["USD/TRY", "EUR/USD", "ALTIN"],
    },

    "EUR/USD": {
        kind: "doviz",
        name: "Euro / Dolar paritesi",
        also: ["EUR/USD", "parite"],
        summary:
            "EUR/USD, bir euronun kaç dolar ettiğini gösteren paritedir. Dünyada en çok işlem gören para birimi çiftidir " +
            "ve Türkiye'de euro/TL ile dolar/TL kurları arasındaki bağı kurar.",
        drivers: [
            {
                t: "ECB ve Fed faiz farkı",
                d: "Avrupa ve ABD merkez bankalarının faiz politikaları arasındaki fark, paritenin yönüne dair en çok izlenen göstergedir.",
            },
            {
                t: "Büyüme ve enflasyon verileri",
                d: "Euro bölgesi ve ABD'deki büyüme, istihdam ve enflasyon verileri beklentileri değiştirir.",
            },
            {
                t: "Enerji ve jeopolitik",
                d: "Avrupa'nın enerji bağımlılığı ve bölgedeki gerginlikler euro üzerinde zaman zaman baskı yaratır.",
            },
        ],
        faq: [
            {
                q: "Parite ne demek?",
                a: "İki yabancı para biriminin birbirine oranıdır; burada Türk lirası yoktur. Parite yükselirse euro dolara karşı değer kazanmış demektir.",
            },
        ],
        guides: ["dolar-kuru-neye-gore-belirlenir", "faiz-karari-piyasalari-nasil-etkiler"],
        related: ["EUR/TRY", "USD/TRY", "DXY", "ALTIN"],
    },

    DXY: {
        kind: "doviz",
        name: "Dolar endeksi",
        also: ["DXY", "dolar endeksi"],
        summary:
            "Dolar endeksi (DXY), doların bir grup büyük para birimi karşısındaki ortalama gücünü gösterir. " +
            "Ağırlığın büyük kısmı euroya aittir; ayrıca yen, sterlin, Kanada doları, İsveç kronu ve İsviçre frankı sepete dahildir.",
        drivers: [
            {
                t: "Fed politikası",
                d: "ABD faiz beklentileri değiştiğinde dolar endeksi genellikle ilk tepki veren göstergelerden biri olur.",
            },
            {
                t: "Euro ağırlığı",
                d: "Endeksin yarıdan fazlası euroya bağlı olduğu için EUR/USD paritesindeki hareket endeksi büyük ölçüde belirler.",
            },
        ],
        faq: [
            {
                q: "Dolar endeksi neden önemli?",
                a: "Altın, petrol ve birçok gelişmekte olan ülke varlığı dolar cinsinden fiyatlandığı için, doların genel gücü bu varlıkların fiyatını dolaylı olarak etkiler.",
            },
        ],
        guides: ["dolar-kuru-neye-gore-belirlenir", "faiz-karari-piyasalari-nasil-etkiler"],
        related: ["USD/TRY", "EUR/USD", "ALTIN"],
    },

    BTC: {
        kind: "kripto",
        name: "Bitcoin",
        also: ["BTC", "bitcoin fiyatı"],
        summary:
            "Bitcoin, merkezi bir kurumu olmayan, toplam arzı 21 milyon adetle sınırlı ilk ve en büyük kripto paradır. " +
            "Hafta sonu dahil 7 gün 24 saat işlem görür ve fiyatı genellikle dolar üzerinden izlenir.",
        drivers: [
            {
                t: "Arz kuralı ve yarılanma (halving)",
                d: "Yeni bitcoin üretimi yaklaşık dört yılda bir yarıya iner. Bu olay arz tarafındaki en çok konuşulan döngüdür.",
            },
            {
                t: "Kurumsal talep ve ETF akışları",
                d: "Spot Bitcoin ETF'leri ile kurumsal alımlar, talebin büyüklüğünü ve sürekliliğini gösteren ana göstergelerdir.",
            },
            {
                t: "Küresel likidite ve faiz",
                d: "Bitcoin çoğu zaman risk iştahı yüksek dönemlerde güçlenen, likidite daraldığında zorlanan bir varlık gibi davranır.",
            },
            {
                t: "Düzenleme ve haber akışı",
                d: "Ülkelerin kripto düzenlemeleri, borsa olayları ve güvenlik haberleri kısa vadede sert hareketlere yol açabilir.",
            },
        ],
        faq: [
            {
                q: "Bitcoin halving nedir?",
                a: "Yeni bitcoin üreten madencilere verilen ödülün yaklaşık her 210.000 blokta (kabaca dört yılda bir) yarıya indiği programlı olaydır. " +
                    "En son yarılanma Nisan 2024'te gerçekleşti.",
            },
            {
                q: "Bitcoin ne zaman işlem görür?",
                a: "Kripto piyasaları kapanmaz; hafta sonu ve resmi tatillerde dahil kesintisiz işlem yapılır.",
            },
        ],
        guides: ["bitcoin-nedir-halving-nedir", "youtube-ekonomist-yorumlari-nasil-okunur", "faiz-karari-piyasalari-nasil-etkiler"],
        related: ["ETH", "KRIPTO", "NASDAQ", "ALTIN"],
    },

    ETH: {
        kind: "kripto",
        name: "Ethereum",
        also: ["ETH", "ether"],
        summary:
            "Ethereum, akıllı sözleşmelerin çalıştığı ve yüzlerce uygulamanın üzerinde kurulduğu ikinci büyük kripto para ağıdır. " +
            "Ağın yerel para birimi ETH'tir; 2022'de 'Merge' ile işlem doğrulama yöntemi 'proof of stake'e geçti.",
        drivers: [
            {
                t: "Ağ kullanımı",
                d: "Üzerinde çalışan uygulamalar (merkeziyetsiz finans, token ihraçları) arttıkça işlem ücreti ve ETH talebi de artar.",
            },
            {
                t: "Staking ve arz yapısı",
                d: "ETH'in bir bölümü ağı güvence altına almak için kilitlenir; bu, piyasada dolaşan miktarı etkiler.",
            },
            {
                t: "Bitcoin ve genel kripto iştahı",
                d: "ETH çoğu zaman Bitcoin'in yönünü, ama daha yüksek oynaklıkla izler.",
            },
        ],
        faq: [
            {
                q: "Ethereum ile Bitcoin arasındaki fark nedir?",
                a: "Bitcoin ağırlıklı olarak bir değer saklama ve transfer aracı olarak konumlanır; Ethereum ise üzerinde program (akıllı sözleşme) çalıştırılabilen bir platformdur.",
            },
        ],
        guides: ["bitcoin-nedir-halving-nedir", "youtube-ekonomist-yorumlari-nasil-okunur"],
        related: ["BTC", "SOL", "KRIPTO"],
    },

    KRIPTO: {
        kind: "sinif",
        name: "Kripto paralar",
        also: ["kripto para", "altcoin"],
        summary:
            "Bu başlık tek bir varlık değil, kripto para sınıfı hakkında genel konuşulan görüşleri toplar. " +
            "Tek bir fiyatı olmadığı için fiyat gösterilmez ve isabet ölçümüne girmez.",
        drivers: [
            {
                t: "Bitcoin'in yönü",
                d: "Altcoin olarak adlandırılan diğer kripto paraların çoğu, Bitcoin'in genel eğilimini daha yüksek oynaklıkla izler.",
            },
            {
                t: "Düzenleme ve borsa güvenliği",
                d: "Ülkelerin düzenlemeleri ve işlem platformlarına dair haberler tüm sınıfı aynı anda etkileyebilir.",
            },
        ],
        faq: [
            {
                q: "Kripto paralar için neden tek fiyat gösterilmiyor?",
                a: "Çünkü sınıf içinde binlerce farklı varlık var. Yorumcu 'kripto' dediğinde hangisini kastettiği belirsiz olduğundan bu başlık fiyat ölçümüne dahil edilmez.",
            },
        ],
        guides: ["bitcoin-nedir-halving-nedir", "youtube-ekonomist-yorumlari-nasil-okunur"],
        related: ["BTC", "ETH", "SOL"],
    },

    XU100: {
        kind: "endeks",
        name: "BIST 100",
        also: ["XU100", "borsa", "Borsa İstanbul", "BIST 100 endeksi"],
        summary:
            "BIST 100 (XU100), Borsa İstanbul'da işlem gören şirketler arasından seçilen en büyük ve en likit 100 hissenin " +
            "performansını gösteren endekstir. Türkiye'de 'borsa yükseldi' denildiğinde çoğunlukla bu endeks kastedilir.",
        drivers: [
            {
                t: "Faiz ve kur",
                d: "TCMB'nin faiz kararları ve dolar/TL kuru, şirketlerin maliyetini, yabancı yatırımcının ilgisini ve hisselerin değerlemesini etkiler.",
            },
            {
                t: "Enflasyon ortamı",
                d: "Enflasyonun yüksek olduğu dönemlerde endeksin lira cinsinden artması, reel (enflasyondan arındırılmış) getiri anlamına gelmeyebilir.",
            },
            {
                t: "Yabancı yatırımcı akışı",
                d: "Yabancıların Türk hisselerine olan ilgisi, küresel risk iştahıyla birlikte endeks üzerinde belirleyici olabilir.",
            },
            {
                t: "Bilanço dönemleri ve sektör ağırlıkları",
                d: "Endekste bankalar, holdingler, sanayi ve havacılık gibi sektörlerin payı yüksektir; bu sektörlerin bilanço ve haberleri endeksi öne çıkan biçimde etkiler.",
            },
        ],
        faq: [
            {
                q: "BIST 100 nedir?",
                a: "Borsa İstanbul'da işlem gören hisseler arasından piyasa değeri ve işlem hacmine göre seçilen 100 şirketin oluşturduğu, lira cinsinden hesaplanan endekstir.",
            },
            {
                q: "BIST 100 hangi saatlerde işlem görür?",
                a: "Borsa İstanbul hafta içi çalışır; resmi tatillerde kapalıdır. Seans saatleri Borsa İstanbul tarafından belirlenir ve zaman zaman değişebilir.",
            },
        ],
        guides: ["bist-100-nedir", "faiz-karari-piyasalari-nasil-etkiler", "youtube-ekonomist-yorumlari-nasil-okunur"],
        related: ["BANKA-HISSE", "USD/TRY", "ALTIN", "SP500"],
    },

    "BANKA-HISSE": {
        kind: "sinif",
        name: "Banka hisseleri",
        also: ["bankacılık endeksi", "XBANK"],
        summary:
            "Bu başlık tek bir hisse değil, Borsa İstanbul'daki bankacılık sektörü hakkında konuşulan görüşleri toplar. " +
            "Bankalar BIST 100 içinde yüksek ağırlığa sahip olduğundan sektörün seyri endeksi de belirgin biçimde etkiler.",
        drivers: [
            {
                t: "Faiz ve net faiz marjı",
                d: "Bankaların kârlılığı, mevduat ve kredi faizleri arasındaki fark ile politika faizinin seyrine duyarlıdır.",
            },
            {
                t: "Kredi büyümesi ve varlık kalitesi",
                d: "Kredilerin büyümesi, takipteki kredi oranı ve düzenleyici sınırlamalar sektörün bilançosunu etkiler.",
            },
            {
                t: "Kur ve yabancı yatırımcı ilgisi",
                d: "Bankalar yabancı yatırımcıların Türkiye'ye en kolay erişim yolu olduğundan, küresel risk iştahı bu hisselerde daha belirgin görülür.",
            },
        ],
        faq: [
            {
                q: "Banka hisseleri neden BIST 100'ü bu kadar etkiler?",
                a: "Endeks piyasa değeri ağırlıklı hesaplandığı için büyük bankaların payı yüksektir; bankacılık sektöründeki hareket endekse orantılı olarak yansır.",
            },
        ],
        guides: ["bist-100-nedir", "faiz-karari-piyasalari-nasil-etkiler"],
        related: ["XU100", "GARAN", "AKBNK", "USD/TRY"],
    },

    SP500: {
        kind: "endeks",
        name: "S&P 500",
        also: ["SP500", "S&P 500 endeksi", "ABD borsası"],
        summary:
            "S&P 500, ABD borsalarında işlem gören 500 büyük şirketin piyasa değeri ağırlıklı endeksidir. " +
            "ABD ekonomisinin ve küresel hisse piyasalarının en çok izlenen göstergelerinden biridir.",
        drivers: [
            {
                t: "Fed faiz politikası",
                d: "ABD faiz beklentileri hisse değerlemelerinin belirleyicisidir; faiz yükseldiğinde gelecekteki kazançların bugünkü değeri düşer.",
            },
            {
                t: "Şirket kârları",
                d: "Üç ayda bir açıklanan bilançolar, endeksin ağırlıklı şirketleri üzerinden fiyata yansır.",
            },
            {
                t: "Büyük teknoloji şirketlerinin payı",
                d: "Endeksteki birkaç dev teknoloji şirketinin ağırlığı yüksektir; bu yüzden endeks onların performansına duyarlıdır.",
            },
            {
                t: "ABD makro verileri",
                d: "İstihdam, enflasyon ve büyüme verileri faiz beklentilerini, dolayısıyla endeksi etkiler.",
            },
        ],
        faq: [
            {
                q: "S&P 500 nedir?",
                a: "ABD'deki en büyük 500 halka açık şirketin hisse performansını temsil eden endekstir. Şirketler piyasa değerlerine göre ağırlıklandırılır.",
            },
        ],
        guides: ["faiz-karari-piyasalari-nasil-etkiler", "youtube-ekonomist-yorumlari-nasil-okunur"],
        related: ["NASDAQ", "ABD-HISSE", "US10Y", "ALTIN"],
    },

    NASDAQ: {
        kind: "endeks",
        name: "Nasdaq",
        also: ["Nasdaq endeksi", "Nasdaq 100"],
        summary:
            "Nasdaq endeksleri, ABD'deki Nasdaq borsasında işlem gören ve ağırlıklı olarak teknoloji ile büyüme şirketlerinden " +
            "oluşan hisse gruplarını izler. Faiz beklentilerine S&P 500'den genellikle daha duyarlıdır.",
        drivers: [
            {
                t: "Faiz beklentileri",
                d: "Gelecekteki kazançlara dayalı büyüme hisseleri, faiz değişimlerine daha hassas tepki verir.",
            },
            {
                t: "Yapay zeka ve yarı iletken döngüsü",
                d: "Endeksin ağırlıklı şirketleri bu alanda yoğunlaştığı için sektördeki yatırım ve talep haberleri endeksi etkiler.",
            },
            {
                t: "Dev şirket bilançoları",
                d: "Birkaç büyük şirketin bilançosu endeksin tamamının yönünü kısa sürede değiştirebilir.",
            },
        ],
        faq: [
            {
                q: "Nasdaq ile S&P 500 arasındaki fark nedir?",
                a: "S&P 500 farklı sektörlerden 500 büyük şirketi kapsar; Nasdaq endeksleri ise teknoloji ve büyüme şirketlerinin ağırlığıyla öne çıkar.",
            },
        ],
        guides: ["faiz-karari-piyasalari-nasil-etkiler", "youtube-ekonomist-yorumlari-nasil-okunur"],
        related: ["SP500", "NVDA", "BTC", "ABD-HISSE"],
    },

    "ABD-HISSE": {
        kind: "sinif",
        name: "ABD hisseleri",
        also: ["Amerikan borsası", "ABD borsası"],
        summary:
            "Bu başlık tek bir hisse değil, ABD borsalarındaki hisse piyasası hakkında genel konuşulan görüşleri toplar. " +
            "Tek bir fiyatı olmadığı için fiyat gösterilmez; ilgili endeksler için S&P 500 ve Nasdaq sayfalarına bakılabilir.",
        drivers: [
            {
                t: "Fed ve faiz beklentileri",
                d: "ABD hisselerinin değerlemesi faiz patikasına duyarlıdır.",
            },
            {
                t: "Kârlılık ve büyüme",
                d: "Bilanço dönemleri ve ekonomik büyüme görünümü hisse piyasasının yönünü belirler.",
            },
        ],
        faq: [
            {
                q: "Türkiye'den ABD hisselerine bakmak için hangi endeksler izlenir?",
                a: "Genel görünüm için çoğunlukla S&P 500, teknoloji ağırlıklı görünüm için Nasdaq ve sanayi için Dow Jones izlenir.",
            },
        ],
        guides: ["faiz-karari-piyasalari-nasil-etkiler", "youtube-ekonomist-yorumlari-nasil-okunur"],
        related: ["SP500", "NASDAQ", "NVDA", "DJI"],
    },

    "CL=F": {
        kind: "emtia",
        name: "Petrol",
        also: ["ham petrol", "WTI petrol", "petrol fiyatı"],
        summary:
            "Bu sayfadaki fiyat, ABD'nin referans ham petrolü olan WTI'ın vadeli işlem (futures) fiyatıdır ve varil başına dolar olarak verilir. " +
            "Vadeli kontrat fiyatı, fiziki (spot) fiyattan farklı olabilir.",
        drivers: [
            {
                t: "OPEC+ üretim kararları",
                d: "Üretici ülkelerin arzı artırma ya da kısma kararları fiyatın en çok izlenen belirleyicisidir.",
            },
            {
                t: "Küresel talep",
                d: "Çin başta olmak üzere büyük ekonomilerin büyüme hızı petrol talebini ve fiyatını etkiler.",
            },
            {
                t: "Stoklar",
                d: "ABD'de her hafta açıklanan ham petrol stok verileri kısa vadeli hareketlerde sık takip edilir.",
            },
            {
                t: "Jeopolitik gelişmeler ve dolar",
                d: "Üretici bölgelerdeki gerginlikler fiyatı hızla değiştirebilir; petrol dolarla fiyatlandığı için dolar endeksi de etkilidir.",
            },
        ],
        faq: [
            {
                q: "WTI ile Brent arasındaki fark nedir?",
                a: "WTI, ABD'de üretilen ham petrolün referans fiyatıdır; Brent ise Kuzey Denizi petrolüne dayanır ve Avrupa, Asya ve Türkiye'nin alımlarında daha yaygın referanstır.",
            },
            {
                q: "Petrol fiyatı Türkiye'yi neden etkiler?",
                a: "Türkiye enerjisinin büyük kısmını ithal eder. Petrol fiyatı yükseldiğinde ithalat faturası, cari denge ve akaryakıt fiyatları etkilenir.",
            },
        ],
        guides: ["petrol-fiyatlari-neden-degisir-brent-wti", "youtube-ekonomist-yorumlari-nasil-okunur"],
        related: ["BZ=F", "NG=F", "USD/TRY", "XU100"],
    },

    "BZ=F": {
        kind: "emtia",
        name: "Brent petrol",
        also: ["Brent", "Brent petrol fiyatı"],
        summary:
            "Brent, Kuzey Denizi'nde üretilen ham petrole dayanan uluslararası referans fiyattır. Dünyadaki ham petrol ticaretinin " +
            "önemli bir bölümü Brent'e göre fiyatlandığı için Türkiye'de petrolden söz edilirken çoğunlukla bu referans kastedilir.",
        drivers: [
            {
                t: "OPEC+ kararları ve arz",
                d: "Üretici ülkelerin üretim politikası Brent fiyatını doğrudan etkiler.",
            },
            {
                t: "Küresel talep ve dolar",
                d: "Avrupa ve Asya'nın talebi ile dolar endeksi fiyatın yönünü etkiler.",
            },
            {
                t: "Jeopolitik riskler",
                d: "Enerji arzında aksama yaratabilecek bölgesel gerginlikler fiyatlarda hızlı hareketlere yol açabilir.",
            },
        ],
        faq: [
            {
                q: "Brent petrol neden referans kabul edilir?",
                a: "Hacmi büyük, denizyoluyla taşınabildiği için dünya çapında alım satımı kolay ve birçok ülkenin ithalat sözleşmesi bu fiyata endekslidir.",
            },
        ],
        guides: ["petrol-fiyatlari-neden-degisir-brent-wti", "youtube-ekonomist-yorumlari-nasil-okunur"],
        related: ["CL=F", "NG=F", "USD/TRY"],
    },

    "NG=F": {
        kind: "emtia",
        name: "Doğalgaz",
        also: ["doğalgaz fiyatı", "Henry Hub"],
        summary:
            "Bu sayfadaki fiyat, ABD'deki Henry Hub merkezli doğalgaz vadeli işlem fiyatıdır ve milyon BTU başına dolar olarak verilir. " +
            "Avrupa ve Türkiye'de uygulanan doğalgaz fiyatları farklı referanslara bağlıdır.",
        drivers: [
            {
                t: "Hava durumu ve mevsim",
                d: "Soğuk kış ısınma talebini, sıcak yaz elektrik üretimi talebini artırır.",
            },
            {
                t: "Depolama seviyeleri",
                d: "Haftalık depolama verileri arz-talep dengesinin en çok izlenen göstergelerindendir.",
            },
            {
                t: "LNG ihracatı",
                d: "ABD'nin sıvılaştırılmış doğalgaz ihracat kapasitesi iç piyasa fiyatını küresel talebe bağlar.",
            },
        ],
        faq: [
            {
                q: "Bu fiyat Türkiye'deki doğalgaz faturasını belirler mi?",
                a: "Hayır. Türkiye'de tüketiciye yansıyan fiyat BOTAŞ tarifelerine ve ithalat sözleşmelerine bağlıdır; Henry Hub yalnızca küresel eğilimi gösteren bir referanstır.",
            },
        ],
        guides: ["petrol-fiyatlari-neden-degisir-brent-wti"],
        related: ["CL=F", "BZ=F", "USD/TRY"],
    },

    "HG=F": {
        kind: "emtia",
        name: "Bakır",
        also: ["bakır fiyatı", "Dr. Copper"],
        summary:
            "Bakır elektrik şebekelerinden inşaata, elektronikten otomotive pek çok sanayi kolunda kullanıldığı için küresel ekonominin " +
            "sağlığına dair ipucu verdiği düşünülür ve bu nedenle 'Doktor Bakır' diye anılır.",
        drivers: [
            {
                t: "Çin talebi",
                d: "Dünya bakır tüketiminin yarısını aşan bölümü Çin'e aittir; oradaki sanayi ve inşaat faaliyeti fiyatı belirgin biçimde etkiler.",
            },
            {
                t: "Enerji dönüşümü",
                d: "Elektrikli araç, şebeke yatırımı ve yenilenebilir enerji, bakıra olan uzun vadeli talebe dair tartışmanın merkezinde yer alır.",
            },
            {
                t: "Stoklar ve dolar",
                d: "Borsalardaki stok miktarı ve dolar endeksi kısa vadeli fiyatı etkileyen unsurlardır.",
            },
        ],
        faq: [
            {
                q: "Bakır fiyatı neden ekonomi göstergesi sayılır?",
                a: "Sanayi, inşaat ve altyapı faaliyetinin yoğun olduğu dönemlerde talebi artar; durgunlukta düşer. Bu yüzden eğilimi, genel ekonomik aktivite hakkında bir fikir verir.",
            },
        ],
        guides: ["youtube-ekonomist-yorumlari-nasil-okunur"],
        related: ["ALTIN", "GÜMÜŞ", "CL=F"],
    },

    TAHVIL: {
        kind: "tahvil",
        name: "Tahvil",
        also: ["devlet tahvili", "tahvil faizi", "bono"],
        summary:
            "Tahvil, devletin ya da şirketin borçlanmak için çıkardığı, belirli bir faiz ödeyen borç senedidir. " +
            "Bu başlık tek bir tahvili değil, tahvil piyasası hakkında genel konuşulan görüşleri toplar; tek bir fiyatı olmadığı için fiyat gösterilmez.",
        drivers: [
            {
                t: "Fiyat ve faiz ters yönde hareket eder",
                d: "Piyasa faizleri yükseldiğinde eski tahvillerin fiyatı düşer, faizler düştüğünde yükselir. Tahvil piyasasını anlamanın temel kuralı budur.",
            },
            {
                t: "Merkez bankası politikası",
                d: "Politika faizi ve gelecekteki faiz beklentileri tahvil getirilerini doğrudan belirler.",
            },
            {
                t: "Enflasyon beklentisi ve ülke riski",
                d: "Yüksek enflasyon beklentisi ve yüksek ülke riski, yatırımcının tahvilden talep ettiği getiriyi yükseltir.",
            },
        ],
        faq: [
            {
                q: "Tahvil getirisi ne demek?",
                a: "Tahvili bugünkü fiyatından alıp vadesine kadar tutan bir yatırımcının yıllık bazda elde edeceği tahmini getiridir. Fiyat düştükçe getiri yükselir.",
            },
        ],
        guides: ["faiz-karari-piyasalari-nasil-etkiler", "youtube-ekonomist-yorumlari-nasil-okunur"],
        related: ["US10Y", "MEVDUAT", "USD/TRY", "XU100"],
    },

    US10Y: {
        kind: "tahvil",
        name: "ABD 10 yıllık tahvil faizi",
        also: ["ABD 10 yıllık tahvil", "US10Y", "10 yıllık Treasury"],
        summary:
            "ABD hazinesinin 10 yıl vadeli tahvilinin getirisi, küresel finans sisteminin 'risksiz' faiz referansı sayılır. " +
            "Dünyadaki birçok varlığın fiyatlanması bu faizin yanında yapılır.",
        drivers: [
            {
                t: "Fed politikası ve enflasyon beklentisi",
                d: "Faiz indirimi ya da artırımı beklentisi ile enflasyon beklentileri uzun vadeli getirileri belirler.",
            },
            {
                t: "Ekonomik büyüme verileri",
                d: "Güçlü büyüme çoğu zaman getirileri yukarı, zayıf büyüme aşağı çeker.",
            },
            {
                t: "Borçlanma ihtiyacı ve talep",
                d: "ABD Hazinesi'nin borçlanma miktarı ile yurt içi ve yurt dışı alıcıların talebi getiriyi etkiler.",
            },
        ],
        faq: [
            {
                q: "ABD tahvil faizi altını ve borsayı neden etkiler?",
                a: "Tahvil faizi yükseldiğinde faiz getirmeyen altının cazibesi görece azalabilir, hisselerin değerleme hesabında kullanılan iskonto oranı yükselir. İlişki her dönemde aynı işlemez.",
            },
        ],
        guides: ["faiz-karari-piyasalari-nasil-etkiler"],
        related: ["TAHVIL", "SP500", "ALTIN", "DXY"],
    },

    KONUT: {
        kind: "sinif",
        name: "Konut",
        also: ["konut fiyatları", "gayrimenkul", "emlak"],
        summary:
            "Bu başlık tek bir varlık değil, konut ve gayrimenkul piyasası hakkında konuşulan görüşleri toplar. " +
            "Tek bir canlı fiyatı olmadığı için fiyat gösterilmez ve isabet ölçümüne girmez.",
        drivers: [
            {
                t: "Konut kredisi faizleri",
                d: "Kredi faizleri ve kredi erişimi satışları ve fiyatları belirleyen en önemli kalemlerden biridir.",
            },
            {
                t: "İnşaat maliyetleri ve arz",
                d: "Malzeme ve işçilik maliyetleri ile yeni konut arzı fiyatların alt sınırını etkiler.",
            },
            {
                t: "Kira artışları ve kentsel dönüşüm",
                d: "Kira seviyeleri, dönüşüm projeleri ve bölgesel talep, fiyatların şehirler arasında farklılaşmasına yol açar.",
            },
        ],
        faq: [
            {
                q: "Konut fiyatlarına dair resmi veri nereden takip edilir?",
                a: "Türkiye Cumhuriyet Merkez Bankası'nın yayımladığı Konut Fiyat Endeksi ve TÜİK'in konut satış istatistikleri en çok başvurulan resmi kaynaklardır.",
            },
        ],
        guides: ["faiz-karari-piyasalari-nasil-etkiler", "youtube-ekonomist-yorumlari-nasil-okunur"],
        related: ["MEVDUAT", "TAHVIL", "USD/TRY"],
    },

    MEVDUAT: {
        kind: "sinif",
        name: "Mevduat ve para fonları",
        also: ["mevduat faizi", "para piyasası fonu"],
        summary:
            "Bu başlık bankalardaki mevduat ve para piyasası fonları gibi düşük riskli, faiz getiren araçlar hakkında konuşulan görüşleri toplar. " +
            "Tek bir canlı fiyatı olmadığı için fiyat gösterilmez ve isabet ölçümüne girmez.",
        drivers: [
            {
                t: "Politika faizi",
                d: "Mevduat ve para fonu getirileri TCMB'nin politika faizine yakından bağlıdır.",
            },
            {
                t: "Enflasyon",
                d: "Faizin enflasyonun altında ya da üstünde kalması reel getiriyi, yani paranın satın alma gücündeki değişimi belirler.",
            },
            {
                t: "Vergi ve düzenlemeler",
                d: "Stopaj oranları ve mevduatla ilgili düzenlemeler net getiriyi etkiler.",
            },
        ],
        faq: [
            {
                q: "Reel getiri ne demek?",
                a: "Nominal getiriden enflasyonun düşülmesiyle bulunan, paranın gerçek satın alma gücündeki değişimdir. Nominal getiri enflasyonun altındaysa reel getiri eksidir.",
            },
        ],
        guides: ["faiz-karari-piyasalari-nasil-etkiler"],
        related: ["TAHVIL", "KONUT", "USD/TRY", "ALTIN"],
    },

    NVDA: {
        kind: "hisse-abd",
        name: "Nvidia",
        also: ["NVDA", "Nvidia hisse"],
        summary:
            "Nvidia, grafik işlemcileri (GPU) ve yapay zeka hızlandırıcılarıyla öne çıkan bir ABD yarı iletken şirketidir. " +
            "Hisse, Nasdaq'ta işlem görür ve yapay zeka yatırımlarına dair tartışmanın en çok konuşulan sembollerinden biridir.",
        drivers: [
            {
                t: "Yapay zeka veri merkezi harcamaları",
                d: "Büyük bulut şirketlerinin yatırım planları, Nvidia'nın satış beklentisinin en önemli belirleyicisidir.",
            },
            {
                t: "Bilanço dönemleri",
                d: "Üç ayda bir açıklanan bilançolar ve şirketin gelecek dönem beklentileri hisse fiyatında sert hareketlere yol açabilir.",
            },
            {
                t: "İhracat kısıtları ve rekabet",
                d: "ABD'nin yarı iletken ihracat düzenlemeleri ve rakip üreticilerin ürünleri beklentileri etkileyebilir.",
            },
        ],
        faq: [
            {
                q: "Nvidia hangi borsada işlem görür?",
                a: "ABD'deki Nasdaq borsasında, NVDA koduyla işlem görür.",
            },
        ],
        guides: ["youtube-ekonomist-yorumlari-nasil-okunur", "faiz-karari-piyasalari-nasil-etkiler"],
        related: ["NASDAQ", "SP500", "ABD-HISSE"],
    },
};

/** Profili olmayan Borsa İstanbul hisseleri için ortak, kısa açıklama. */
const BIST_STOCK_DEFAULT: AssetProfile = {
    kind: "hisse-bist",
    summary:
        "Bu bir Borsa İstanbul hissesidir. Fiyatı lira cinsinden belirtilir ve BIST 100 gibi endekslerin bileşeni olabilir.",
    drivers: [
        { t: "Şirketin bilançosu ve sektörü", d: "Üç aylık finansal sonuçlar, temettü kararları ve sektöre özgü gelişmeler hisse fiyatını doğrudan etkiler." },
        { t: "Faiz ve kur", d: "TCMB faiz kararları ve dolar/TL kuru, şirketin maliyetini ve yatırımcının ilgisini etkiler." },
        { t: "Genel borsa seyri", d: "Hisse çoğu zaman BIST 100'ün genel yönünden etkilenir." },
    ],
    faq: [],
    guides: ["bist-100-nedir", "youtube-ekonomist-yorumlari-nasil-okunur"],
    related: ["XU100", "BANKA-HISSE", "USD/TRY"],
};


export function getAssetProfile(asset: string): AssetProfile | null {
    if (ASSET_PROFILES[asset]) return ASSET_PROFILES[asset];
    if (BIST_TICKERS.has(asset)) return BIST_STOCK_DEFAULT;
    return null;
}

/**
 * Elle yazılmış profili olan varlıklar. Bu sayfalar yeterince içerik taşıdığından
 * güncel analist sayısı düşük olsa bile dizine girer ve sitemap'te yer alır.
 */
export const PROFILED_ASSETS = Object.keys(ASSET_PROFILES);
