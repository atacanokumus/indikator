/**
 * REHBER YAZILARI — sitenin "ekonomi yayını" tarafı.
 *
 * Neden var: Site yalnızca sayı gösterirse arama motorunun okuyacağı metin
 * kalmıyor ve "altın nasıl hesaplanır", "BIST 100 nedir", "halving ne demek"
 * gibi, sitenin konusuna dokunan yüksek hacimli soruların hiçbirinde
 * yer alamıyoruz. Bu yazılar o soruları cevaplıyor ve her biri ilgili canlı
 * varlık sayfasına bağlanıyor: okuyucu önce "nedir"i öğreniyor, sonra "şimdi
 * kim ne diyor"a geçiyor.
 *
 * YAZIM KURALLARI (değiştirmeden önce okuyun):
 *  - Tavsiye yok: "alın", "satın", "şu seviyeden girin" gibi cümleler kurulmaz.
 *    Bkz. README "Hukuki tasarım kararları".
 *  - Güncel fiyat, oran ya da tarih verilmez; eskiyen cümle yalan söyler.
 *    Örnek rakamlar varsa "örnek" diye açıkça etiketlenir.
 *  - Olgu iddiaları genel kabul görmüş bilgilerle sınırlıdır. Tartışmalı ilişkiler
 *    ("faiz düşünce altın çıkar") "çoğu zaman", "genellikle" ile yazılır ve
 *    her dönemde geçerli olmadığı söylenir.
 *  - Satır içi biçim: [metin](/adres) bağlantı, **kalın**. Başka biçim yok.
 */
import { MACRO_GUIDES } from "@/content/guides-macro";
import { MARKET_GUIDES } from "@/content/guides-markets";
import { assetSlug } from "@/lib/slug";

export type Block =
    | { t: "p"; text: string }
    | { t: "ul"; items: string[] }
    | { t: "ol"; items: string[] }
    | { t: "formula"; text: string; caption?: string }
    | { t: "note"; text: string };

export interface GuideSection {
    id: string;
    h2: string;
    blocks: Block[];
}

export interface Guide {
    slug: string;
    /** Sayfanın H1'i. */
    title: string;
    /** <title> için kısa hali (≈60 karakter). */
    metaTitle: string;
    description: string;
    category: string;
    published: string;
    updated: string;
    intro: string;
    sections: GuideSection[];
    faq: { q: string; a: string }[];
    /** Canlı varlık sayfaları (varlık kodu). */
    assets: string[];
    /** Başka rehberler (slug). */
    related: string[];
}

/** Varlık sayfasına bağlantı: adres kurallarından bağımsız kalsın diye koddan üretilir. */
const A = (asset: string, label: string) => `[${label}](/varlik/${assetSlug(asset)})`;

const BASE_GUIDES: Guide[] = [
    /* ------------------------------------------------------------------ */
    {
        slug: "gram-altin-nasil-hesaplanir",
        title: "Gram altın nasıl hesaplanır? Ons, dolar kuru ve ayar farkı",
        metaTitle: "Gram Altın Nasıl Hesaplanır? Ons ve Dolar Kuru Formülü",
        description:
            "Gram altın fiyatı; ons altın, dolar/TL kuru ve 31,1035 gram katsayısıyla hesaplanır. Formülü, örnek hesabı ve kuyumcu fiyatından neden farklı çıktığını anlattık.",
        category: "Altın ve madenler",
        published: "2026-10-08",
        updated: "2026-10-08",
        intro:
            "Gram altın ekranda tek bir rakam gibi görünür; oysa arkasında iki ayrı piyasa çalışır: dolarla fiyatlanan uluslararası " +
            "ons altın ve Türkiye'deki dolar/TL kuru. Bu yazıda formülü, örnek bir hesabı ve kuyumcudaki fiyatın neden hesapladığınız " +
            "rakamdan farklı çıktığını adım adım anlatıyoruz.",
        sections: [
            {
                id: "formul",
                h2: "Gram altının temel formülü",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Altın dünyada **ons** (troy ons) birimiyle ve **dolar** cinsinden fiyatlanır. Türkiye'de ise gündelik hayatta gram ve " +
                            "lira kullanıldığı için iki dönüşüm gerekir: ons'u grama, doları liraya çevirmek.",
                    },
                    {
                        t: "formula",
                        text: "Gram altın (TL) = Ons altın (USD) × Dolar/TL kuru ÷ 31,1035",
                        caption: "1 troy ons = 31,1035 gram",
                    },
                    {
                        t: "p",
                        text:
                            "Buradaki ons, mutfak tartısında ya da market ürünlerinde gördüğünüz 28,35 gramlık ons değildir; değerli madenlerde " +
                            "kullanılan **troy ons**'tur ve 31,1035 gramdır. Formülden çıkan değer, saf (24 ayar, has) altının teorik gram fiyatıdır.",
                    },
                ],
            },
            {
                id: "ornek",
                h2: "Örnek hesap",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Aşağıdaki rakamlar yalnızca hesabı göstermek için uydurulmuş örneklerdir, güncel fiyatlar değildir. " +
                            "Ons altın 3.000 dolar, dolar kuru 40 lira olsun:",
                    },
                    {
                        t: "ol",
                        items: [
                            "3.000 × 40 = 120.000 (bir onsun lira karşılığı)",
                            "120.000 ÷ 31,1035 ≈ 3.858",
                            "Sonuç: gram altın yaklaşık 3.858 TL",
                        ],
                    },
                    {
                        t: "p",
                        text:
                            `Canlı değerler için ${A("ALTIN", "altın sayfasına")} bakabilirsiniz; oradaki fiyat bu formülle hesaplanır ve ` +
                            "altına dair son video yorumlarının sayımıyla birlikte gösterilir.",
                    },
                ],
            },
            {
                id: "ons-mu-kur-mu",
                h2: "Gram altın neden yükseldi: ons mu, kur mu?",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Formül iki çarpandan oluştuğu için gram altındaki hareket iki kaynaktan gelebilir. Bir hareketin hangisinden " +
                            "kaynaklandığını anlamak, yorumları doğru okumanın ilk adımıdır:",
                    },
                    {
                        t: "ul",
                        items: [
                            "**Ons sabit, kur yükseliyor:** gram altın lira cinsinden artar; altının dünya çapındaki değeri değişmemiştir, lira değer kaybetmiştir.",
                            "**Kur sabit, ons düşüyor:** gram altın düşer; hareketin nedeni küresel piyasadadır.",
                            "**İkisi zıt yönde:** etkiler birbirini kısmen götürebilir; gram altın yatay görünür ama arkada iki büyük hareket vardır.",
                        ],
                    },
                    {
                        t: "p",
                        text:
                            "Bir yorumcu 'altın yükselecek' dediğinde ons'u mu, gram altını mı kastettiğini belirtmiyorsa mesaj eksiktir. " +
                            `Bu ayrım ${A("USD/TRY", "dolar kuru")} ile altın arasındaki bağlantıyı da açıklar.`,
                    },
                ],
            },
            {
                id: "kuyumcu",
                h2: "Kuyumcudaki fiyat neden farklı?",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Hesapladığınız değer saf altının ham piyasa fiyatıdır. Kuyumcudan ya da bankadan altın alırken veya satarken karşılaştığınız " +
                            "fiyat şu kalemler yüzünden farklılaşır:",
                    },
                    {
                        t: "ul",
                        items: [
                            "**Alış-satış farkı (makas):** satış fiyatı alış fiyatından yüksektir.",
                            "**İşçilik:** bilezik, kolye gibi işlenmiş ürünlerde işçilik bedeli eklenir; külçe ve ziynet ürünlerinde farklıdır.",
                            "**Ayar:** ürünün saflık derecesi fiyatı doğrudan değiştirir.",
                        ],
                    },
                ],
            },
            {
                id: "ayar",
                h2: "Ayar ve milyem nedir?",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Ayar, altının saflık derecesidir; 24 ayar tam saflığı, yani hemen hemen saf altını ifade eder. Milyem ise aynı " +
                            "ölçünün binde biriyle ifadesidir. Türkiye'de en sık karşılaşılan ayarlar şunlardır:",
                    },
                    {
                        t: "ul",
                        items: [
                            "**24 ayar:** 995 milyem ve üzeri (has altın, külçe)",
                            "**22 ayar:** 916 milyem (yaklaşık %91,6 altın; bilezik, ziynet)",
                            "**18 ayar:** 750 milyem (%75 altın)",
                            "**14 ayar:** 585 milyem (%58,5 altın)",
                        ],
                    },
                    {
                        t: "p",
                        text:
                            "Bu yüzden 22 ayar bir bilezikte gerçek altın miktarı, tartıdaki gramdan azdır. Çeyrek, yarım ve tam altın gibi " +
                            "ziynet ürünleri için [sözlüğümüze](/sozluk) bakabilirsiniz.",
                    },
                ],
            },
        ],
        faq: [
            {
                q: "1 ons altın kaç gramdır?",
                a: "Değerli madenlerde kullanılan troy ons 31,1035 gramdır. Günlük hayatta kullanılan 28,35 gramlık ons ile karıştırılmamalıdır.",
            },
            {
                q: "Gram altın dolar yükselince neden yükselir?",
                a: "Çünkü altın dolarla fiyatlanır. Ons fiyatı değişmese bile dolar/TL kuru yükselirse aynı miktar altının lira karşılığı artar.",
            },
            {
                q: "Gram altın ile has altın aynı şey mi?",
                a: "Piyasa fiyatı olarak konuşulan gram altın genellikle saf (24 ayar, has) altının fiyatıdır. Kuyumcuda satılan bilezik gibi ürünler daha düşük ayarlıdır ve işçilik içerir.",
            },
        ],
        assets: ["ALTIN", "USD/TRY", "GÜMÜŞ"],
        related: ["altin-fiyatini-ne-etkiler", "ceyrek-yarim-tam-altin-farki", "dolar-kuru-neye-gore-belirlenir"],
    },

    /* ------------------------------------------------------------------ */
    {
        slug: "altin-fiyatini-ne-etkiler",
        title: "Altın fiyatını ne etkiler? Faiz, dolar, enflasyon ve jeopolitik",
        metaTitle: "Altın Fiyatını Ne Etkiler? Faiz, Dolar ve Enflasyon",
        description:
            "Altın fiyatını belirleyen başlıca etkenler: ABD faiz beklentileri, dolar endeksi, enflasyon, jeopolitik risk ve merkez bankası alımları. Hangi etken neden önemli, ilişki ne zaman bozulur?",
        category: "Altın ve madenler",
        published: "2026-10-08",
        updated: "2026-10-08",
        intro:
            "Altın hakkında yapılan yorumların neredeyse tamamı birkaç ortak etkene dayanır. Bu yazı, o etkenleri ve her birinin " +
            "mantığını sade biçimde anlatıyor; amaç altının yönünü tahmin etmek değil, bir yorumcunun hangi gerekçeye yaslandığını " +
            "ayırt edebilmenizi sağlamak.",
        sections: [
            {
                id: "temel",
                h2: "Altını farklı kılan şey: getiri sağlamaz",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Hisse temettü, tahvil faiz, mevduat faiz ödeyebilir; altın ise tek başına nakit akışı üretmez. Altını elinde tutmanın " +
                            "'maliyeti', aynı parayla faiz getiren bir araca yatırılsaydı kazanılacak getiridir. Altın fiyatını anlatan hikâyelerin " +
                            "çoğu bu fikrin etrafında döner.",
                    },
                ],
            },
            {
                id: "faiz",
                h2: "1. Faiz beklentileri ve reel faiz",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Faizler düştüğünde ya da düşeceği beklendiğinde faizsiz bir varlığı tutmanın göreli maliyeti azalır; bu yüzden altın " +
                            "çoğu zaman ABD faiz beklentileriyle birlikte tartışılır. Daha ince bir ölçü **reel faizdir**: nominal faizden " +
                            "enflasyon beklentisi çıkarıldığında kalan getiri.",
                    },
                    {
                        t: "note",
                        text:
                            "Bu ilişki bir doğa yasası değildir; bazı dönemlerde faizler yükselirken altın da yükselmiştir. Bir yorumcu 'faiz " +
                            "düşüyor, altın çıkar' derken ilişkiyi mutlak sayıyorsa dikkatli olun.",
                    },
                ],
            },
            {
                id: "dolar",
                h2: "2. Dolar endeksi",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Altın dolar cinsinden fiyatlandığı için doların diğer para birimleri karşısındaki gücü (dolar endeksi, DXY) ons " +
                            "fiyatını etkiler. Dolar güçlendiğinde başka para birimiyle altın alan yatırımcı için altın pahalılaşır; bu da " +
                            "çoğu zaman talebi ve fiyatı baskılar. Ayrıntı için " +
                            `${A("DXY", "dolar endeksi sayfasına")} bakabilirsiniz.`,
                    },
                ],
            },
            {
                id: "enflasyon",
                h2: "3. Enflasyon ve enflasyon beklentisi",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Altın uzun vadede paranın satın alma gücünü korumak isteyenlerin başvurduğu bir araç olarak görülür. Kısa vadede ise " +
                            "enflasyon verisinin fiyata etkisi faiz beklentileri üzerinden gelir: yüksek enflasyon faizlerin yüksek kalacağı " +
                            "beklentisini güçlendirirse altın bundan olumsuz da etkilenebilir.",
                    },
                ],
            },
            {
                id: "jeopolitik",
                h2: "4. Jeopolitik riskler ve güvenli liman talebi",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Savaş, kriz ve finansal belirsizlik dönemlerinde yatırımcıların bir kısmı altına yönelir. Bu talep çoğu zaman " +
                            "ani gelir ve haberin yarattığı heyecan geçtiğinde kısmen geri verilir.",
                    },
                ],
            },
            {
                id: "merkez-bankasi",
                h2: "5. Merkez bankalarının alımları ve fiziki talep",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Merkez bankaları rezervlerinin bir kısmını altın olarak tutar. Son yıllarda merkez bankalarının net alıcı olduğu " +
                            "dönemler yaşandı ve bu, fiyatı destekleyen yapısal bir etken olarak yorumlandı. Ayrıca Hindistan ve Çin gibi " +
                            "ülkelerde ziynet talebi ile altın ETF'lerine giren-çıkan para da fiyat üzerinde etkilidir.",
                    },
                ],
            },
            {
                id: "turkiye",
                h2: "Türkiye için bir katman daha: dolar/TL kuru",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Yukarıdakiler ons fiyatını açıklar. Türkiye'de takip edilen gram altın ise ons fiyatıyla " +
                            `${A("USD/TRY", "dolar/TL kurunun")} çarpımından oluşur. Bu yüzden gram altın, ons değişmese bile kur yüzünden hareket edebilir. ` +
                            "Hesabın ayrıntısı için [gram altın nasıl hesaplanır](/rehber/gram-altin-nasil-hesaplanir) yazısına bakın.",
                    },
                ],
            },
            {
                id: "tek-etken-yok",
                h2: "Tek bir etken yoktur",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Bu etkenlerin birçoğu aynı anda ve zıt yönlerde çalışır. Bu yüzden iki yorumcunun aynı veriye bakıp farklı sonuca " +
                            "varması olağandır. Hangi etkene ağırlık verdiklerini sorgulamak, sonucu sorgulamaktan daha öğreticidir. " +
                            `Şu anda ${A("ALTIN", "altın için kaç yorumcunun hangi yönde konuştuğunu")} sayfamızdan görebilirsiniz.`,
                    },
                ],
            },
        ],
        faq: [
            {
                q: "Altın fiyatı neden yükselir?",
                a: "Genellikle faiz beklentilerinin gevşemesi, doların zayıflaması, jeopolitik belirsizlik veya merkez bankası alımları gibi etkenlerle ilişkilendirilir. Türkiye'de gram altın ayrıca dolar/TL kuru yükseldiğinde de artar.",
            },
            {
                q: "Altın ile dolar neden çoğu zaman ters yönde hareket eder?",
                a: "Altın dolarla fiyatlandığı için dolar güçlendiğinde diğer para birimleriyle altın alanlar için pahalılaşır. Ancak ilişki her dönemde geçerli değildir; iki varlık aynı anda yükselebilir.",
            },
            {
                q: "Altın enflasyondan korur mu?",
                a: "Uzun vadede satın alma gücünü korumasıyla ilişkilendirilir, ama kısa ve orta vadede bu garanti değildir; fiyat enflasyon verisinden çok faiz beklentilerine tepki verebilir.",
            },
        ],
        assets: ["ALTIN", "GÜMÜŞ", "DXY", "USD/TRY"],
        related: ["gram-altin-nasil-hesaplanir", "altin-gumus-orani-nedir", "abd-10-yillik-tahvil-faizi-neden-onemli", "faiz-karari-piyasalari-nasil-etkiler"],
    },

    /* ------------------------------------------------------------------ */
    {
        slug: "dolar-kuru-neye-gore-belirlenir",
        title: "Dolar kuru neye göre belirlenir? Kuru etkileyen temel etkenler",
        metaTitle: "Dolar Kuru Neye Göre Belirlenir? Kuru Etkileyen Etkenler",
        description:
            "Dolar/TL kurunu belirleyen etkenler: Merkez Bankası faizi, enflasyon farkı, cari denge, rezervler, küresel dolar ve risk iştahı. Kur kim tarafından belirlenir, neden tahmin edilmesi zor?",
        category: "Döviz",
        published: "2026-10-08",
        updated: "2026-10-08",
        intro:
            "Dolar kuru Türkiye'de neredeyse herkesin takip ettiği tek rakamdır: ithalattan kiraya, tasarruftan borca pek çok kararı " +
            "etkiler. Bu yazı kurun nasıl oluştuğunu ve yorumcuların hangi gerekçelerle konuştuğunu anlatıyor.",
        sections: [
            {
                id: "kur-nedir",
                h2: "Kur nedir, kim belirler?",
                blocks: [
                    {
                        t: "p",
                        text:
                            "**USD/TRY**, bir ABD dolarının kaç Türk lirası ettiğini gösteren **parite**dir. Türkiye'de resmi olarak dalgalı kur " +
                            "rejimi uygulanır: fiyat, piyasadaki döviz arz ve talebiyle oluşur. Merkez Bankası politika faizi, rezervler ve " +
                            "düzenlemeler aracılığıyla bu süreci etkileyebilir ama kuru tek başına belirlemez.",
                    },
                ],
            },
            {
                id: "faiz",
                h2: "1. Faiz farkı ve Merkez Bankası politikası",
                blocks: [
                    {
                        t: "p",
                        text:
                            "TCMB'nin politika faizi, liraya yatırım yapmanın getirisini belirler. Lira faizi enflasyona ve küresel faizlere göre " +
                            "cazip olduğunda lira talebi artabilir. Faiz kararlarının geniş etkisi için " +
                            "[faiz kararı piyasaları nasıl etkiler](/rehber/faiz-karari-piyasalari-nasil-etkiler) yazısına bakın.",
                    },
                ],
            },
            {
                id: "enflasyon",
                h2: "2. Enflasyon farkı",
                blocks: [
                    {
                        t: "p",
                        text:
                            "İki ülke arasındaki enflasyon farkı uzun vadede para birimlerinin değerini etkileyen en temel çerçevelerden biridir " +
                            "('satın alma gücü paritesi'). Türkiye'de enflasyon ABD'dekinden uzun süre yüksek seyrettiğinde, lira doların " +
                            "karşısında satın alma gücü kaybeder.",
                    },
                ],
            },
            {
                id: "cari",
                h2: "3. Cari denge ve dış finansman",
                blocks: [
                    {
                        t: "p",
                        text:
                            "İhracat, turizm geliri ve yabancı sermaye girişleri döviz arz eder; enerji başta olmak üzere ithalat ve dış borç " +
                            "ödemeleri döviz talep eder. Bu dengenin açığa kayması kuru yukarı çeken baskı yaratır. " +
                            `Petrol fiyatlarının neden önemli olduğunu ${A("BZ=F", "Brent petrol sayfasında")} da görebilirsiniz.`,
                    },
                ],
            },
            {
                id: "rezerv",
                h2: "4. Rezervler ve Merkez Bankası'nın duruşu",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Merkez Bankası'nın döviz rezervi, gerektiğinde piyasaya döviz satarak kuru dengeleme kapasitesinin göstergesidir. " +
                            "Rezerv artışı güven verici, hızlı azalış ise endişe verici olarak yorumlanır.",
                    },
                ],
            },
            {
                id: "kuresel",
                h2: "5. Küresel dolar ve ABD faizleri",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Dolar yalnızca Türkiye'ye karşı değil, tüm para birimlerine karşı güçlenip zayıflar. ABD faizleri yükselip dolar " +
                            `endeksi güçlendiğinde gelişmekte olan ülke paraları genellikle baskı altında kalır. ${A("DXY", "Dolar endeksi")} bu genel gücü ölçer.`,
                    },
                ],
            },
            {
                id: "risk",
                h2: "6. Risk iştahı ve beklentiler",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Yatırımcıların küresel risk iştahı, ülke riskinin göstergeleri ve siyasi gelişmeler kısa vadede kuru en sert " +
                            "oynatan kalemlerdir. Piyasa geleceğe bakar: bir gelişmenin kuru etkilemesi için gerçekleşmesi gerekmez, " +
                            "beklenmesi yeterlidir.",
                    },
                ],
            },
            {
                id: "etkiler",
                h2: "Kur yükselince ne olur?",
                blocks: [
                    {
                        t: "ul",
                        items: [
                            "**İthalat maliyeti artar:** dövizle alınan hammadde, enerji ve ara malı pahalanır; fiyatlara yansıyabilir.",
                            "**Döviz borcu olanların yükü artar:** gelirini liradan, borcunu dövizden olan şirket ve kişiler etkilenir.",
                            "**İhracatçının rekabet gücü artabilir:** ancak ithal girdi kullanıyorsa maliyeti de yükselir.",
                            "**Altın ve döviz cinsi varlıkların lira değeri artar.**",
                        ],
                    },
                ],
            },
            {
                id: "tahmin",
                h2: "Kur tahmini neden bu kadar zordur?",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Çünkü kuru etkileyen etkenlerin çoğu birbirine bağlıdır ve beklentiler fiyata zaten yansımıştır. Aynı verilere bakan " +
                            "yorumcuların farklı sonuçlara varması bu yüzden olağandır. Bu belirsizlik karşısında " +
                            `Analist Ne Diyor tek bir görüşü öne çıkarmak yerine ${A("USD/TRY", "dolar için kaç yorumcunun hangi yönde konuştuğunu")} sayar.`,
                    },
                ],
            },
        ],
        faq: [
            {
                q: "USD/TRY ne demek?",
                a: "1 ABD dolarının kaç Türk lirası ettiğini gösteren para birimi çiftidir. Örneğin 40 ise bir dolar 40 liradır (örnek rakamdır).",
            },
            {
                q: "Parite ve kur aynı şey mi?",
                a: "Günlük dilde aynı anlamda kullanılır. Teknik olarak parite iki para biriminin birbirine oranıdır; kur, bir para biriminin başka bir para cinsinden fiyatıdır.",
            },
            {
                q: "Çapraz kur nedir?",
                a: "Doğrudan işlem görmeyen ya da başka iki kurdan türetilen kurdur. Örneğin euro/TL kuru, dolar/TL ile EUR/USD paritesinin çarpımıyla tutarlıdır.",
            },
        ],
        assets: ["USD/TRY", "EUR/TRY", "DXY", "ALTIN"],
        related: ["cari-acik-nedir-kuru-nasil-etkiler", "dolar-endeksi-dxy-nedir", "faiz-karari-piyasalari-nasil-etkiler", "enflasyon-nedir-tufe-nasil-hesaplanir"],
    },

    /* ------------------------------------------------------------------ */
    {
        slug: "bist-100-nedir",
        title: "BIST 100 nedir? Nasıl hesaplanır, hangi hisseler endekse girer?",
        metaTitle: "BIST 100 Nedir? Nasıl Hesaplanır, Hangi Hisseler Girer?",
        description:
            "BIST 100 (XU100), Borsa İstanbul'daki en büyük ve en likit 100 hissenin performansını gösterir. Endeksin nasıl hesaplandığını, BIST 30 ve sektör endekslerinden farkını anlattık.",
        category: "Borsa",
        published: "2026-10-08",
        updated: "2026-10-08",
        intro:
            "Haberlerde 'borsa yükseldi' denildiğinde çoğunlukla BIST 100 endeksi kastedilir. Endeksin ne olduğunu, nasıl hesaplandığını " +
            "ve neden yalnızca lira cinsinden bakmanın yanıltıcı olabileceğini bu yazıda toparladık.",
        sections: [
            {
                id: "nedir",
                h2: "BIST 100 neyi gösterir?",
                blocks: [
                    {
                        t: "p",
                        text:
                            "BIST 100 (kodu **XU100**), Borsa İstanbul'da işlem gören şirketler arasından piyasa değeri ve işlem hacmi gibi " +
                            "ölçütlerle seçilen 100 şirketin hisse performansını tek bir sayıda toplar. Endeks lira cinsinden hesaplanır; " +
                            "puan, bir fiyat değil, başlangıç tarihine göre bir ölçektir.",
                    },
                    {
                        t: "p",
                        text:
                            "Endeksin kendisi alınıp satılan bir varlık değildir; ona dayalı fonlar ve vadeli işlem sözleşmeleri bulunur. " +
                            `Güncel görüş sayımı için ${A("XU100", "BIST 100 sayfasına")} bakabilirsiniz.`,
                    },
                ],
            },
            {
                id: "hesap",
                h2: "Nasıl hesaplanır?",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Endeks, şirketlerin hisse fiyatlarının **piyasa değeri ağırlıklı** hesaplanmasıyla bulunur: büyük şirketin " +
                            "hissesindeki yüzde 1'lik hareket, küçük şirketinkine göre endekse daha çok yansır. Hesapta fiilen halka açık " +
                            "olan paylar esas alınır; ayrıntılı kurallar Borsa İstanbul'un endeks yönergelerinde yazılıdır.",
                    },
                    {
                        t: "p",
                        text:
                            "Endeks bileşenleri periyodik olarak gözden geçirilir; kriterleri sağlamayan şirket çıkar, sağlayan girer. " +
                            "Bu yüzden 'BIST 100'de hangi hisseler var' sorusunun cevabı zamanla değişir.",
                    },
                ],
            },
            {
                id: "diger-endeksler",
                h2: "BIST 30, BIST Banka ve diğer endeksler",
                blocks: [
                    {
                        t: "ul",
                        items: [
                            "**BIST 30 (XU030):** en büyük ve en likit 30 şirket.",
                            "**BIST Banka (XBANK):** bankacılık sektörü hisseleri. Bankalar BIST 100 içinde yüksek ağırlığa sahip olduğundan sektör genel endeksi belirgin biçimde etkiler.",
                            "**Sektör endeksleri:** sınai, teknoloji, holding gibi gruplar için ayrı endeksler vardır.",
                        ],
                    },
                    {
                        t: "p",
                        text: `Bankacılık hakkındaki görüşleri ${A("BANKA-HISSE", "banka hisseleri sayfasında")} ayrıca topluyoruz.`,
                    },
                ],
            },
            {
                id: "reel",
                h2: "Lira cinsinden bakmak neden yanıltıcı olabilir?",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Enflasyonun ve kur artışının yüksek olduğu bir ortamda endeksin lira cinsinden yükselmesi, satın alma gücünün " +
                            "arttığı anlamına gelmeyebilir. Bu yüzden analistler endeksi çoğu zaman şu üç şekilde birlikte okur:",
                    },
                    {
                        t: "ul",
                        items: [
                            "**Nominal (lira):** haberlerdeki rakam.",
                            "**Dolar cinsinden:** endeks değerini dolar kuruna bölerek, yabancı yatırımcının gözünden bakmak.",
                            "**Enflasyondan arındırılmış (reel):** paranın satın alma gücü açısından değişim.",
                        ],
                    },
                    {
                        t: "p",
                        text:
                            "Bir yorumcunun 'borsa rekor kırdı' demesi bu üç bakıştan hangisine dayanıyor, bilmeden doğru okunamaz.",
                    },
                ],
            },
            {
                id: "etkenler",
                h2: "Endeksi ne etkiler?",
                blocks: [
                    {
                        t: "ul",
                        items: [
                            "TCMB faiz kararları ve [dolar/TL kuru](/rehber/dolar-kuru-neye-gore-belirlenir)",
                            "Şirket bilançoları ve temettü kararları",
                            "Yabancı yatırımcı girişi ve küresel risk iştahı",
                            "Sektör ağırlıkları: bankalar, holdingler, sanayi ve havacılık",
                        ],
                    },
                    {
                        t: "p",
                        text:
                            "Faiz kararlarının hisse piyasasına etkisini [faiz kararı piyasaları nasıl etkiler](/rehber/faiz-karari-piyasalari-nasil-etkiler) " +
                            "yazısında anlattık.",
                    },
                ],
            },
        ],
        faq: [
            {
                q: "XU100 ne demek?",
                a: "BIST 100 endeksinin Borsa İstanbul'daki kodudur. XU030 BIST 30, XBANK ise BIST Banka endeksini ifade eder.",
            },
            {
                q: "BIST 100 kaç hisseden oluşur?",
                a: "Adı gibi 100 şirketin hissesinden oluşur. Şirketler periyodik gözden geçirmelerle değişebilir.",
            },
            {
                q: "BIST 100 ile BIST 30 arasındaki fark nedir?",
                a: "BIST 30 en büyük ve en likit 30 şirketi, BIST 100 ise 100 şirketi kapsar; dolayısıyla BIST 100 daha geniş bir tabloyu temsil eder.",
            },
        ],
        assets: ["XU100", "BANKA-HISSE", "USD/TRY"],
        related: ["fk-orani-nedir-hisse-degerleme", "sp-500-nasdaq-dow-jones-farki", "cds-nedir-ulke-risk-primi", "faiz-karari-piyasalari-nasil-etkiler"],
    },

    /* ------------------------------------------------------------------ */
    {
        slug: "bitcoin-nedir-halving-nedir",
        title: "Bitcoin nedir, halving (yarılanma) ne demek?",
        metaTitle: "Bitcoin Nedir? Halving (Yarılanma) Ne Demek?",
        description:
            "Bitcoin nedir, 21 milyon sınırı neden önemli, halving (yarılanma) nasıl işler? Bitcoin'in temel mantığını, fiyatını etkileyen unsurları ve riskleri sade bir dille anlattık.",
        category: "Kripto",
        published: "2026-10-08",
        updated: "2026-10-08",
        intro:
            "Bitcoin hakkındaki yorumlarda en çok duyulan kelimelerden biri 'halving'dir. Bu yazı Bitcoin'in nasıl çalıştığını, " +
            "yarılanmanın ne anlama geldiğini ve fiyat yorumlarında hangi unsurların öne çıktığını açıklıyor.",
        sections: [
            {
                id: "nedir",
                h2: "Bitcoin nedir?",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Bitcoin, 2008'de Satoshi Nakamoto takma adıyla yayımlanan bir belgeyle tanıtılan ve ağı 2009'da çalışmaya başlayan " +
                            "dijital paradır. Merkezi bir kurumu yoktur; işlemler, binlerce bilgisayardan oluşan bir ağ tarafından doğrulanır " +
                            "ve **blokzincir** adı verilen ortak bir deftere kaydedilir.",
                    },
                ],
            },
            {
                id: "arz",
                h2: "Arz sınırı: 21 milyon",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Bitcoin'in kuralları gereği hiçbir zaman 21 milyondan fazla bitcoin olmayacak. Yeni bitcoinler, işlemleri doğrulayan " +
                            "**madencilere** ödül olarak verilir. Sınırlı arz, Bitcoin'in 'dijital altın' olarak anılmasının en önemli dayanağıdır.",
                    },
                ],
            },
            {
                id: "halving",
                h2: "Halving (yarılanma) nedir?",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Madencilere verilen blok ödülü, yaklaşık her **210.000 blokta** (kabaca dört yılda bir) yarıya iner. Bu programlı olaya " +
                            "halving denir. Ödül şöyle düşmüştür:",
                    },
                    {
                        t: "ul",
                        items: [
                            "2009: blok başına 50 BTC",
                            "2012: 25 BTC",
                            "2016: 12,5 BTC",
                            "2020: 6,25 BTC",
                            "Nisan 2024: 3,125 BTC",
                        ],
                    },
                    {
                        t: "p",
                        text:
                            "Bir sonraki yarılanma kabaca 2028 civarında bekleniyor. Her yarılanma yeni bitcoin üretiminin hızını yarıya indirir; " +
                            "yani arzın büyüme hızı düşer.",
                    },
                ],
            },
            {
                id: "tartisma",
                h2: "Halving fiyatı etkiler mi?",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Yorumcuların bir kısmı, arz artışının yarıya inmesinin talep sabitken fiyatı destekleyeceğini savunur ve geçmiş " +
                            "döngülere dikkat çeker. Diğer kısmı ise yarılanmanın önceden bilindiği için fiyatlara çoktan yansıdığını söyler.",
                    },
                    {
                        t: "note",
                        text:
                            "Geçmiş döngülerin sayısı çok azdır (bugüne dek dört yarılanma yaşandı) ve her seferinde piyasa koşulları farklıydı. " +
                            "Bu yüzden 'geçmişte şöyle olmuştu' cümlesi bir kanıt değil, bir gözlemdir.",
                    },
                ],
            },
            {
                id: "fiyat",
                h2: "Bitcoin fiyatını başka ne etkiler?",
                blocks: [
                    {
                        t: "ul",
                        items: [
                            "**Spot Bitcoin ETF'leri:** ABD'de Ocak 2024'te onaylanan fonlar, geleneksel yatırımcılara erişim sağladı; akışları talep göstergesi olarak izlenir.",
                            "**Küresel likidite ve faizler:** risk iştahı yüksek dönemlerde Bitcoin çoğu zaman güçlenir, faizlerin yükseldiği dönemlerde zorlanabilir.",
                            "**Düzenlemeler ve borsa olayları:** ülkelerin kararları ve işlem platformlarına dair haberler kısa vadede sert hareket yaratır.",
                        ],
                    },
                    {
                        t: "p",
                        text:
                            `Güncel fiyat ve analist sayımı için ${A("BTC", "Bitcoin sayfasına")} bakabilirsiniz. ` +
                            `Ethereum için ${A("ETH", "Ethereum sayfası")} ayrıdır.`,
                    },
                ],
            },
            {
                id: "risk",
                h2: "Bilinmesi gereken riskler",
                blocks: [
                    {
                        t: "ul",
                        items: [
                            "**Yüksek oynaklık:** fiyat kısa sürede çok sert yükselip düşebilir.",
                            "**Saklama riski:** özel anahtarınızı kaybederseniz ya da platform sorun yaşarsa varlığa erişim kaybolabilir.",
                            "**Düzenleme belirsizliği:** kurallar ülkeden ülkeye değişir. Türkiye'de kripto varlık hizmet sağlayıcıları Sermaye Piyasası Kurulu düzenlemesine tabidir.",
                        ],
                    },
                ],
            },
        ],
        faq: [
            {
                q: "Kaç bitcoin var, kaç tane daha çıkacak?",
                a: "Toplam arz 21 milyonla sınırlıdır. Bunun büyük çoğunluğu zaten üretilmiştir; kalan kısım halving'ler nedeniyle giderek yavaşlayan hızla, yaklaşık 2140'a kadar dolaşıma girecektir.",
            },
            {
                q: "Bir sonraki halving ne zaman?",
                a: "Yaklaşık her 210.000 blokta bir gerçekleşir. Son olay Nisan 2024'te yaşandı; bir sonrakinin kabaca 2028 civarında olması beklenir.",
            },
            {
                q: "Bitcoin 7/24 işlem görür mü?",
                a: "Evet. Kripto piyasaları kapanmaz; hafta sonu ve resmi tatillerde de işlem yapılır.",
            },
        ],
        assets: ["BTC", "ETH", "KRIPTO"],
        related: ["ethereum-nedir-bitcoin-farki", "yatirim-dolandiriciligi-nasil-anlasilir", "youtube-ekonomist-yorumlari-nasil-okunur"],
    },

    /* ------------------------------------------------------------------ */
    {
        slug: "faiz-karari-piyasalari-nasil-etkiler",
        title: "Faiz kararı piyasaları nasıl etkiler? Dolar, altın, borsa ve tahvil",
        metaTitle: "Faiz Kararı Dolar, Altın ve Borsayı Nasıl Etkiler?",
        description:
            "Politika faizi değişince dolar, altın, borsa, tahvil ve konut nasıl etkilenir? Faiz ile varlık fiyatları arasındaki ilişkiyi, ilişkinin ne zaman bozulduğunu ve beklentinin rolünü anlattık.",
        category: "Makro",
        published: "2026-10-08",
        updated: "2026-10-08",
        intro:
            "Piyasa yorumlarının büyük kısmı bir faiz kararından önce ya da sonra yapılır. Bu yazı faizin hangi varlıklara hangi " +
            "kanaldan dokunduğunu, ilişkilerin hangi durumlarda tersine döndüğünü ve neden 'beklenti' kelimesinin kararın kendisinden " +
            "önemli olabildiğini anlatıyor.",
        sections: [
            {
                id: "politika-faizi",
                h2: "Politika faizi nedir?",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Merkez bankasının bankalara borç verirken ya da bankalardan para toplarken uyguladığı referans faizdir. " +
                            "Türkiye'de bu faiz **TCMB**'nin Para Politikası Kurulu (PPK) toplantılarında belirlenir; ABD'de karar **Fed**'e, " +
                            "euro bölgesinde **ECB**'ye aittir. Üçü de yılda sekiz civarında toplanır ve takvimlerini önceden duyurur.",
                    },
                ],
            },
            {
                id: "neden",
                h2: "Faiz neden varlık fiyatlarını etkiler?",
                blocks: [
                    {
                        t: "ul",
                        items: [
                            "**Alternatif getiri:** faiz yükseldikçe mevduat ve tahvil cazip hale gelir; diğer varlıkların 'çıta'sı yükselir.",
                            "**İskonto oranı:** bir şirketin gelecekteki kazançlarının bugünkü değeri, faiz yükseldikçe düşer.",
                            "**Para birimi talebi:** yüksek faiz, o para birimini elinde tutmanın getirisini artırır.",
                            "**Borçlanma maliyeti:** kredi faizleri tüketimi, yatırımı ve konut satışlarını etkiler.",
                        ],
                    },
                ],
            },
            {
                id: "varliklar",
                h2: "Varlık varlık genel eğilimler",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Aşağıdakiler 'ne olur' değil, piyasada yaygın olarak kullanılan **çerçevelerdir**. Her dönemde geçerli değillerdir:",
                    },
                    {
                        t: "ul",
                        items: [
                            `**${A("USD/TRY", "Dolar/TL")}:** yurt içi faiz, enflasyonun üzerinde ve güven verici olduğunda liraya talebi destekleyebilir; güven zayıfsa faiz artışı kuru tek başına durdurmayabilir.`,
                            `**${A("ALTIN", "Altın")}:** faiz getirmediği için faizlerin düşmesi ya da düşeceği beklentisi çoğu zaman altın lehine tartışılır.`,
                            `**${A("XU100", "Borsa")}:** faiz artışı genellikle hisse değerlemelerini baskılar; ancak bankalar gibi bazı sektörler faiz ortamına farklı tepki verebilir.`,
                            `**${A("TAHVIL", "Tahvil")}:** fiyat ve faiz ters yönde hareket eder; faiz yükselirken eski tahvillerin fiyatı düşer.`,
                            `**${A("KONUT", "Konut")}:** konut kredisi faizleri satışları ve fiyatları etkiler.`,
                            `**${A("MEVDUAT", "Mevduat")}:** getirisi politika faizine yakından bağlıdır.`,
                        ],
                    },
                ],
            },
            {
                id: "beklenti",
                h2: "Piyasa kararı değil, beklentiyi fiyatlar",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Piyasa faiz kararından haftalar önce bir beklenti oluşturur ve fiyatlar bunu yansıtır. Karar beklentiyle aynı çıkarsa " +
                            "çoğu zaman sınırlı bir tepki görülür; şaşırtıcı bir karar ya da kararla birlikte verilen mesajlar sert hareket yaratabilir. " +
                            "Bu yüzden 'faiz düştü ama dolar da düştü' ya da tersi gibi görünürde çelişkili tablolar sık yaşanır.",
                    },
                ],
            },
            {
                id: "okuma",
                h2: "Faiz yorumlarını okurken dikkat edilecekler",
                blocks: [
                    {
                        t: "ol",
                        items: [
                            "Yorumcu kararın **kendisini** mi yoksa kararın **beklentiye göre** farkını mı konuşuyor?",
                            "Hangi vadeyi kastediyor: karardan sonraki birkaç gün mü, birkaç ay mı?",
                            "İlişkiyi kesin mi sunuyor ('faiz düşerse altın çıkar') yoksa koşullu mu?",
                            "Aynı yorumcu geçmişte benzer bir durumda ne demişti? [İsabet karnesinde](/karne) kimlerin görüşünün sonradan ne kadar tuttuğunu ölçüyoruz.",
                        ],
                    },
                    {
                        t: "p",
                        text:
                            "Yorumların nasıl değerlendirileceğine dair ayrıntılı bir kontrol listesini " +
                            "[YouTube'daki ekonomist yorumları nasıl okunur](/rehber/youtube-ekonomist-yorumlari-nasil-okunur) yazısında bulabilirsiniz.",
                    },
                ],
            },
        ],
        faq: [
            {
                q: "Faiz düşünce dolar yükselir mi?",
                a: "Tek yönlü bir kural yoktur. Faiz indirimi liranın getirisini azaltarak kur üzerinde baskı yaratabilir; ancak indirimin enflasyon, rezervler ve beklentilerle birlikte nasıl okunduğu belirleyicidir.",
            },
            {
                q: "Faiz artışı borsayı düşürür mü?",
                a: "Genellikle hisse değerlemelerini baskılayan bir etken olarak görülür, ama bankalar gibi bazı sektörler farklı tepki verebilir ve karar beklenen yöndeyse etki sınırlı kalabilir.",
            },
            {
                q: "Fed kararı Türkiye'yi neden ilgilendirir?",
                a: "ABD faizleri küresel dolar likiditesini ve gelişmekte olan ülkelere yönelik yatırımcı iştahını etkiler; bu da dolar/TL kurundan Borsa İstanbul'a kadar geniş bir alanda hissedilir.",
            },
        ],
        assets: ["USD/TRY", "ALTIN", "XU100", "TAHVIL", "US10Y"],
        related: ["enflasyon-nedir-tufe-nasil-hesaplanir", "tahvil-nedir-faiz-fiyat-iliskisi", "mevduat-faizi-net-getiri-nasil-hesaplanir", "dolar-kuru-neye-gore-belirlenir"],
    },

    /* ------------------------------------------------------------------ */
    {
        slug: "youtube-ekonomist-yorumlari-nasil-okunur",
        title: "YouTube'daki ekonomist ve analist yorumları nasıl okunur?",
        metaTitle: "YouTube Ekonomist Yorumları Nasıl Okunur? 7 Maddelik Liste",
        description:
            "YouTube'daki ekonomist ve piyasa yorumcularının görüşlerini değerlendirirken sorulacak yedi soru: vade, koşul, çıkar çatışması, geçmiş isabet ve sayım. Yorum tavsiye midir?",
        category: "Yöntem",
        published: "2026-10-08",
        updated: "2026-10-08",
        intro:
            "Her gün onlarca kanalda altın, dolar ve borsa hakkında kendinden emin yorumlar yayımlanıyor. Çoğu zaman bu yorumlar " +
            "birbiriyle çelişiyor ve izleyici, fikrine en yakın olanı seçmeye meyilli oluyor. Aşağıdaki yedi soru, bir yorumu " +
            "'ikna edici' bulmadan önce sormaya değer olanlar.",
        sections: [
            {
                id: "yon-mu-kosul-mu",
                h2: "1. Yön mü söylüyor, koşul mu?",
                blocks: [
                    {
                        t: "p",
                        text:
                            "'Şu seviyenin üstünde kalırsa yükseliş devam edebilir' bir tahmin değil, koşullu bir önermedir. Yorumcunun iki " +
                            "senaryoyu da anlattığı videoyu tek yönlü bir görüş olarak okumak, söylenenin yanlış anlaşılmasına yol açar. " +
                            "Yapay zekayla özetleme yaparken en sık hata da buradadır; bu yüzden her özetin yanında kaynak videoya bağlantı veriyoruz.",
                    },
                ],
            },
            {
                id: "vade",
                h2: "2. Hangi vade için konuşuyor?",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Aynı kişi 'kısa vadede düşüş, uzun vadede yükseliş' diyebilir. Bu bir çelişki değildir; ama vadeyi sormadan " +
                            "okursanız öyle görünür. Metodolojimizde görüşler kısa (7 gün), orta (30 gün) ve uzun (180 gün) olarak ayrılır.",
                    },
                ],
            },
            {
                id: "sayim",
                h2: "3. Kaç kişi aynı şeyi söylüyor?",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Tek bir sesin ne kadar güvenle konuştuğu, doğru olma ihtimalini artırmaz. Aynı soruya birçok yorumcunun nasıl " +
                            "yanıt verdiğine bakmak, bir görüşün ne kadar yaygın olduğunu gösterir. Ancak yaygın olmak doğru olmak değildir: " +
                            "[konsensüs nedir](/rehber/konsensus-nedir) yazısında bunun sınırlarını anlatıyoruz.",
                    },
                ],
            },
            {
                id: "gecmis",
                h2: "4. Geçmişte söyledikleri tuttu mu?",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Bir yorumcunun eski görüşlerinin sonradan ne kadar tuttuğuna bakmak, dikkate değer bir ölçüdür. Fakat az sayıda " +
                            "görüş üzerinden çıkan oran yanıltıcıdır. [İsabet karnesinde](/karne) bu nedenle en az 20 ölçülmüş görüşü olmayan " +
                            "kanal için oran hesaplamıyoruz, fiyatı yatay kalan görüşleri de kimsenin lehine ya da aleyhine saymıyoruz.",
                    },
                ],
            },
            {
                id: "cikar",
                h2: "5. Yorumcunun çıkarı var mı?",
                blocks: [
                    {
                        t: "ul",
                        items: [
                            "Bahsettiği varlıkta pozisyonu olduğunu söylüyor mu?",
                            "Videoda bir aracı kurum, borsa ya da platform için yönlendirme bağlantısı var mı?",
                            "Ücretli bir grup, kurs ya da sinyal hizmeti satıyor mu?",
                        ],
                    },
                    {
                        t: "p",
                        text: "Bunlar yorumu geçersiz kılmaz; ama yorumun hangi çerçevede okunması gerektiğini değiştirir.",
                    },
                ],
            },
            {
                id: "kesinlik",
                h2: "6. Kesinlik ve garanti dili var mı?",
                blocks: [
                    {
                        t: "p",
                        text:
                            "'Kesin yükselecek', 'kaçırmayın', 'garanti' gibi ifadeler piyasada karşılığı olmayan vaatlerdir. Ayrıca " +
                            "Türkiye'de yatırım danışmanlığı, yalnızca yetkili kuruluşlarca ve kişinin durumuna göre verilebilen bir " +
                            "hizmettir; herkese açık bir videodaki yorum genel nitelikte olup bu kapsama girmez.",
                    },
                ],
            },
            {
                id: "kaynak",
                h2: "7. Rakamı kaynağından teyit edin",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Bir yorumda geçen enflasyon, faiz ya da büyüme rakamlarını TÜİK, TCMB ve ilgili borsanın kendi yayınlarından " +
                            "kontrol etmek bir dakikanızı alır ve en sık yapılan hataları yakalar.",
                    },
                ],
            },
            {
                id: "biz",
                h2: "Analist Ne Diyor bu işi nasıl yapıyor?",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Takip ettiğimiz kanalların videolarını yapay zeka ile okuyup konuşmacının bir varlık için **net** bir yön belirttiği " +
                            "yerleri işaretliyoruz; sonra kaç yorumcunun hangi yönde konuştuğunu sayıyoruz. Kendi görüşümüzü katmıyoruz, " +
                            "yorumcuları ağırlıklandırmıyoruz ve tavsiye vermiyoruz. Her sinyalin yanında kaynak video bağlantısı ve " +
                            "'bu özet yanlış' bildirimi bulunur. Tüm süreç [metodoloji](/metodoloji) sayfasında yazılı.",
                    },
                    {
                        t: "p",
                        text: `Örnek olarak ${A("ALTIN", "altın")}, ${A("USD/TRY", "dolar")} ve ${A("BTC", "Bitcoin")} için güncel sayımı görebilirsiniz.`,
                    },
                ],
            },
        ],
        faq: [
            {
                q: "Hangi ekonomist en çok doğru söylüyor?",
                a: "Bunu tek bir kişiye indirgemek yanıltıcıdır. İsabet karnemiz, yeterli örneklemi olan kanallar için geçmiş görüşlerin vadesi dolduğunda fiyatın o yönde hareket edip etmediğini ölçer; ancak geçmiş sonuç gelecekte aynı sonucu garanti etmez.",
            },
            {
                q: "Yapay zekanın çıkardığı görüş her zaman doğru mudur?",
                a: "Hayır. Yapay zeka bir cümleyi yanlış yorumlayabilir, koşullu ifadeyi kesin yön sanabilir. Bu yüzden her özetin yanında kaynak videoya bağlantı verilir ve hatalı özetler tek tıkla bildirilebilir.",
            },
            {
                q: "Bu yorumlar yatırım tavsiyesi mi?",
                a: "Hayır. Videolardaki yorumlar ve Analist Ne Diyor'un sayımı genel niteliktedir, kişiye özel değildir ve yatırım danışmanlığı kapsamında değildir.",
            },
        ],
        assets: ["ALTIN", "USD/TRY", "XU100", "BTC"],
        related: ["konsensus-nedir", "yatirim-dolandiriciligi-nasil-anlasilir", "faiz-karari-piyasalari-nasil-etkiler"],
    },

    /* ------------------------------------------------------------------ */
    {
        slug: "konsensus-nedir",
        title: "Konsensüs nedir? Analist görüşlerinin sayımı nasıl okunur?",
        metaTitle: "Konsensüs Nedir? Analist Görüşleri Sayımı Nasıl Okunur?",
        description:
            "Konsensüs, analistlerin ortak beklentisidir. Finansta nasıl kullanılır, 'sürpriz' ne demek, bir görüş sayımı (7 analistin 4'ü) neyi söyler, neyi söylemez? Açıkladık.",
        category: "Yöntem",
        published: "2026-10-08",
        updated: "2026-10-08",
        intro:
            "Finans haberlerinde 'konsensüs beklentisi' sık geçer. Analist Ne Diyor'da ise 'konsensüs' sayfası, analistlerin hangi yönde " +
            "konuştuğunun sayımını gösterir. İkisi benzer görünür ama aynı şey değildir; bu yazıda farkı ve sayımın nasıl okunacağını anlatıyoruz.",
        sections: [
            {
                id: "kavram",
                h2: "Konsensüs: bir grubun ortak beklentisi",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Finansta konsensüs, bir konuda söz sahibi analistlerin tahminlerinin ortalaması ya da medyanıdır. Örneğin bir enflasyon " +
                            "verisi açıklanmadan önce haber ajansları ve veri sağlayıcılar analist beklentilerini toplar ve tek bir sayı olarak sunar.",
                    },
                    {
                        t: "p",
                        text:
                            "Piyasa için önemli olan çoğu zaman rakamın kendisi değil, **beklentiden sapmasıdır**. Açıklanan veri konsensüsle aynıysa " +
                            "fiyatlar genellikle az hareket eder; sapma ('sürpriz') büyükse tepki de büyür.",
                    },
                ],
            },
            {
                id: "bizde",
                h2: "Analist Ne Diyor'daki sayım nasıl farklı?",
                blocks: [
                    {
                        t: "ul",
                        items: [
                            "Rakam tahmini değil, **yön** sayarız: alım, satış, bekle, gözlemle.",
                            "Her yorumcu bir varlık için **bir kez** sayılır; en güncel görüşü geçerlidir.",
                            "Son **30 gün**e bakılır; daha eski görüşler geçmiş olarak gösterilir.",
                            "Yorumcular ağırlıklandırılmaz, ortalama ya da puan hesaplanmaz.",
                            "Kendi görüşümüz sayıma katılmaz.",
                        ],
                    },
                    {
                        t: "p",
                        text: "Ayrıntılar [metodoloji](/metodoloji) sayfasında; canlı tablo ise [konsensüs sayfasında](/konsensus).",
                    },
                ],
            },
            {
                id: "okuma",
                h2: "'7 analistin 4'ü alım yönünde' ne söyler?",
                blocks: [
                    {
                        t: "p",
                        text: "Yalnızca şunu söyler: takip edilen yedi yorumcudan dördü, son 30 günde o varlık için alım yönünde konuşmuş. Şunu söylemez:",
                    },
                    {
                        t: "ul",
                        items: [
                            "Fiyatın yükseleceğini.",
                            "Çoğunluğun haklı olduğunu.",
                            "Sizin için bir şey yapmanız gerektiğini.",
                            "Piyasanın tamamının ne düşündüğünü; örneklem YouTube'da konuşan ve bizim takip ettiğimiz kanallarla sınırlıdır.",
                        ],
                    },
                ],
            },
            {
                id: "kalabalik",
                h2: "Uzlaşma ve ayrışma",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Yorumcuların neredeyse tamamı aynı yönde konuştuğunda buna bazı çevrelerde 'kalabalık işlem' denir ve fikir ayrılığı " +
                            "az olduğundan sürprizin de daha yüksek olabileceği tartışılır. Görüşler bölündüğünde ise piyasada belirsizlik olduğu " +
                            "anlaşılır. İki durumun da tek başına bir yön işareti taşımadığını unutmamak gerekir.",
                    },
                    {
                        t: "p",
                        text:
                            "'Bekle' ve 'gözlemle' etiketlerinin çoğunlukta olması da 'görüş yok' demek değildir; çoğu zaman belirsizliğin veya " +
                            "karar öncesi temkinin işaretidir.",
                    },
                ],
            },
            {
                id: "zaman",
                h2: "Zamanla değişim: bülten ve geçmiş",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Sayımın tek bir anı değil, değişimi de bilgi taşır. [Haftalık bültenimiz](/bulten) hangi varlıkta baskın yönün " +
                            "değiştiğini ve kimlerin fikir değiştirdiğini özetler; varlık sayfalarında ise 12 aylık konsensüs geçmişi bulunur.",
                    },
                ],
            },
        ],
        faq: [
            {
                q: "Konsensüs doğru çıkar mı?",
                a: "Her zaman değil. Konsensüs yalnızca analistlerin ortak beklentisidir; gerçekleşme farklı olabilir. Fiyatlar genellikle beklenenden sapmaya tepki verir.",
            },
            {
                q: "Konsensüs ile tahmin arasındaki fark nedir?",
                a: "Tahmin bir kişinin ya da kurumun görüşüdür. Konsensüs ise birçok tahminin ortak özetidir.",
            },
            {
                q: "Analist Ne Diyor konsensüsü ağırlıklandırıyor mu?",
                a: "Hayır. Her yorumcu bir kez sayılır; kimsenin görüşü diğerinden fazla ağırlık taşımaz ve ortalama ya da puan hesaplanmaz.",
            },
        ],
        assets: ["ALTIN", "USD/TRY", "XU100"],
        related: ["youtube-ekonomist-yorumlari-nasil-okunur", "faiz-karari-piyasalari-nasil-etkiler"],
    },

    /* ------------------------------------------------------------------ */
    {
        slug: "petrol-fiyatlari-neden-degisir-brent-wti",
        title: "Petrol fiyatları neden değişir? Brent ve WTI farkı",
        metaTitle: "Petrol Fiyatları Neden Değişir? Brent ve WTI Farkı",
        description:
            "Brent ve WTI petrol arasındaki fark nedir, fiyatı OPEC+, talep, stoklar ve dolar nasıl etkiler? Petrol fiyatının Türkiye'de akaryakıta ve cari dengeye yansımasını anlattık.",
        category: "Emtia",
        published: "2026-10-08",
        updated: "2026-10-08",
        intro:
            "Petrol fiyatı haberlerde 'Brent 80 dolar' ya da 'WTI düştü' gibi kısaltmalarla geçer. Bu yazı iki referansın ne olduğunu, " +
            "fiyatı hangi etkenlerin belirlediğini ve Türkiye'de pompa fiyatına nasıl yansıdığını sade biçimde açıklıyor.",
        sections: [
            {
                id: "brent-wti",
                h2: "Brent ve WTI nedir?",
                blocks: [
                    {
                        t: "ul",
                        items: [
                            "**WTI (West Texas Intermediate):** ABD'de üretilen ham petrolün referans fiyatı.",
                            "**Brent:** Kuzey Denizi petrolüne dayanan, dünya genelinde ham petrol ticaretinin büyük kısmında referans alınan fiyat.",
                        ],
                    },
                    {
                        t: "p",
                        text:
                            "İkisi genellikle birlikte hareket eder ama aralarındaki fark zamanla değişir. Türkiye ve Avrupa'nın alımlarında " +
                            `daha çok Brent referans alınır. Her ikisi için de sayfalarımız var: ${A("BZ=F", "Brent")} ve ${A("CL=F", "WTI petrol")}.`,
                    },
                ],
            },
            {
                id: "arz",
                h2: "Arz tarafı",
                blocks: [
                    {
                        t: "ul",
                        items: [
                            "**OPEC+:** OPEC üyeleri ve Rusya gibi müttefik üreticiler üretim kotalarını belirleyerek arzı yönlendirir.",
                            "**ABD kaya petrolü:** fiyat yükseldiğinde ABD üretimi artabilir; bu da fiyatı sınırlayan bir mekanizmadır.",
                            "**Yaptırımlar ve kesintiler:** üretici bölgelerdeki çatışmalar, yaptırımlar ve teknik aksamalar arzı ani düşürebilir.",
                        ],
                    },
                ],
            },
            {
                id: "talep",
                h2: "Talep tarafı",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Petrol talebi küresel büyümeyle birlikte hareket eder. Çin'in sanayi ve ulaştırma faaliyeti, ABD'de yaz sürüş mevsimi " +
                            "ve Avrupa'nın enerji ihtiyacı en çok izlenen kalemlerdir. Ekonomik yavaşlama haberleri çoğu zaman petrole de yansır.",
                    },
                ],
            },
            {
                id: "stok",
                h2: "Stoklar, dolar ve vadeli piyasa",
                blocks: [
                    {
                        t: "ul",
                        items: [
                            "**Stoklar:** ABD'de her hafta açıklanan ham petrol stok verileri kısa vadeli fiyat hareketlerinde yakından izlenir.",
                            "**Dolar:** petrol dolarla fiyatlandığı için güçlü dolar çoğu zaman fiyat üzerinde baskı yaratır.",
                            "**Vadeli kontratlar:** haberlerdeki fiyat genellikle vadeli işlem kontratının fiyatıdır; kontrat vadesi değişince fiyatta sıçrama görülebilir.",
                        ],
                    },
                ],
            },
            {
                id: "turkiye",
                h2: "Türkiye için neden önemli?",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Türkiye enerjisinin büyük kısmını ithal eder. Petrol fiyatı yükseldiğinde ithalat faturası büyür, cari denge " +
                            `üzerindeki baskı artar ve bu da ${A("USD/TRY", "dolar kuru")} ile akaryakıt fiyatlarına yansıyabilir.`,
                    },
                    {
                        t: "p",
                        text:
                            "Pompa fiyatı yalnızca ham petrole bağlı değildir: rafineri marjı, dolar kuru, vergiler (ÖTV ve KDV) ve dağıtım " +
                            "maliyeti fiyatı birlikte oluşturur. Bu yüzden ham petrol düşerken akaryakıt fiyatı aynı oranda düşmeyebilir.",
                    },
                ],
            },
        ],
        faq: [
            {
                q: "1 varil petrol kaç litredir?",
                a: "Bir varil yaklaşık 159 litredir (158,987 litre).",
            },
            {
                q: "Brent ve WTI neden farklı fiyatlanır?",
                a: "Farklı bölgelerde üretilen ve farklı nakliye ve rafineri koşullarına sahip petrolleri temsil ederler; ayrıca arz-talep koşulları bölgeler arasında ayrışabilir.",
            },
            {
                q: "Petrol fiyatı akaryakıt fiyatına nasıl yansır?",
                a: "Ham petrol maliyeti, rafineri marjı, dolar kuru, ÖTV ve KDV ile dağıtım maliyeti birlikte pompa fiyatını belirler; bu yüzden ham petrol hareketi pompaya birebir yansımaz.",
            },
        ],
        assets: ["BZ=F", "CL=F", "NG=F", "USD/TRY"],
        related: ["cari-acik-nedir-kuru-nasil-etkiler", "dolar-kuru-neye-gore-belirlenir", "youtube-ekonomist-yorumlari-nasil-okunur"],
    },
];

/** Tüm rehber yazıları. Yeni yazılar boyut nedeniyle ayrı dosyalarda (guides-markets.ts, guides-macro.ts). */
export const GUIDES: Guide[] = [...BASE_GUIDES, ...MARKET_GUIDES, ...MACRO_GUIDES];

export function getGuide(slug: string): Guide | undefined {
    return GUIDES.find((g) => g.slug === slug);
}

/** Yaklaşık okuma süresi (dakika). Dakikada ~200 kelime. */
export function readingMinutes(g: Guide): number {
    const words = guideText(g).split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
}

export function guideWordCount(g: Guide): number {
    return guideText(g).split(/\s+/).filter(Boolean).length;
}

function guideText(g: Guide): string {
    const parts: string[] = [g.intro];
    for (const s of g.sections) {
        parts.push(s.h2);
        for (const b of s.blocks) {
            if (b.t === "ul" || b.t === "ol") parts.push(...b.items);
            else parts.push(b.text);
        }
    }
    for (const f of g.faq) parts.push(f.q, f.a);
    return parts.join(" ").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*/g, "");
}
