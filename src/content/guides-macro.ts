/**
 * REHBER YAZILARI — makro ekonomi, faiz ve yatırımcının korunması.
 *
 * guides.ts'teki YAZIM KURALLARI burada da geçerli: tavsiye yok, güncel rakam yok,
 * örnek rakamlar "örnek" diye etiketlenir, tartışmalı ilişkiler "çoğu zaman" ile yazılır.
 * Vergi oranı, mevduat sigortası tutarı gibi dönemsel olarak değişen rakamlar
 * BİLEREK yazılmadı; yerine "güncel oranı resmî kaynaktan kontrol edin" denir.
 */
import type { Guide } from "@/content/guides";
import { assetSlug } from "@/lib/slug";

const A = (asset: string, label: string) => `[${label}](/varlik/${assetSlug(asset)})`;

export const MACRO_GUIDES: Guide[] = [
    /* ------------------------------------------------------------------ */
    {
        slug: "enflasyon-nedir-tufe-nasil-hesaplanir",
        title: "Enflasyon nedir? TÜFE nasıl hesaplanır, çekirdek enflasyon ne demek?",
        metaTitle: "Enflasyon Nedir? TÜFE Nasıl Hesaplanır, Çekirdek Enflasyon",
        description:
            "Enflasyon ve TÜFE nasıl ölçülür, sepet ve ağırlıklar ne demek? Aylık ve yıllık enflasyon farkı, çekirdek enflasyon, baz etkisi ve enflasyonun kur, faiz ve altınla ilişkisi.",
        category: "Makro",
        published: "2026-10-18",
        updated: "2026-10-18",
        intro:
            "Enflasyon, ekonomi yorumlarında en sık geçen ama en az açıklanan kavramlardan biridir. Her ay açıklanan TÜFE rakamı faiz " +
            "kararlarını, kuru ve maaş zamlarını etkiler. Bu yazıda enflasyonun nasıl ölçüldüğünü, aylık ve yıllık rakamın farkını ve " +
            "yorumcuların neden 'çekirdek enflasyona' baktığını anlatıyoruz.",
        sections: [
            {
                id: "nedir",
                h2: "Enflasyon nedir?",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Enflasyon, mal ve hizmet fiyatlarının genel düzeyinin sürekli artmasıdır. Tek bir ürünün pahalanması enflasyon " +
                            "değildir; fiyatların geneli yükseldiğinde paranın satın alma gücü azalır. Bunun tersi, fiyatların genel düzeyinin " +
                            "düşmesi ise **deflasyondur**; enflasyonun yavaşlaması (dezenflasyon) ile karıştırılmamalıdır.",
                    },
                    {
                        t: "ul",
                        items: [
                            "**Enflasyon:** fiyatlar artıyor.",
                            "**Dezenflasyon:** fiyatlar artmaya devam ediyor ama artış hızı yavaşlıyor.",
                            "**Deflasyon:** fiyatların genel düzeyi düşüyor.",
                        ],
                    },
                ],
            },
            {
                id: "tufe",
                h2: "TÜFE nasıl hesaplanır?",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Türkiye'de resmî enflasyon, Türkiye İstatistik Kurumu (TÜİK) tarafından **Tüketici Fiyat Endeksi (TÜFE)** ile " +
                            "ölçülür ve her ayın başında bir önceki ay için açıklanır. Hesap kabaca üç adımdan oluşur:",
                    },
                    {
                        t: "ol",
                        items: [
                            "**Sepet:** hanelerin tükettiği yüzlerce mal ve hizmetten oluşan temsilî bir liste belirlenir (gıda, kira, ulaşım, giyim, eğitim…).",
                            "**Ağırlıklar:** her kalemin hane bütçesindeki payı hesaplanır. Bütçede büyük yer tutan kalemin fiyat değişimi endeksi daha çok etkiler.",
                            "**Fiyat derleme:** ülke genelinde belirli noktalardan düzenli olarak fiyat toplanır ve ağırlıklarla birleştirilerek endeks değeri bulunur.",
                        ],
                    },
                    {
                        t: "p",
                        text:
                            "Ağırlıklar ortalama bir haneyi temsil eder. Bu yüzden kişisel enflasyonunuz resmî rakamdan farklı olabilir: " +
                            "kirada oturan, uzun yol giden ya da bütçesinin çoğunu gıdaya ayıran bir hane fiyat artışını farklı hisseder.",
                    },
                ],
            },
            {
                id: "aylik-yillik",
                h2: "Aylık ve yıllık enflasyon farkı, baz etkisi",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Aylık enflasyon, endeksin bir önceki aya göre değişimidir. Yıllık enflasyon ise geçen yılın aynı ayına göre " +
                            "değişimdir ve son 12 aylık artışların birikimini gösterir. Aylık oranlar bileşik büyür:",
                    },
                    {
                        t: "formula",
                        text: "Yıllık ≈ (1 + aylık₁) × (1 + aylık₂) × … × (1 + aylık₁₂) − 1",
                        caption: "Örnek: her ay %2 artış → 1,02¹² − 1 ≈ %26,8 (yalnızca örnek)",
                    },
                    {
                        t: "p",
                        text:
                            "**Baz etkisi**, yıllık rakamın bu yılki aydan çok geçen yılın aynı ayındaki artıştan etkilenmesidir. Geçen yıl o ay " +
                            "çok yüksek bir aylık artış varsa, bu ay hesaptan düşer ve yıllık enflasyon, fiyatlar hâlâ artıyor olsa bile hızla " +
                            "gerileyebilir. Yorumcuların 'baz etkisiyle düşüş' dediği budur.",
                    },
                ],
            },
            {
                id: "cekirdek",
                h2: "Çekirdek enflasyon ve ÜFE",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Bazı fiyatlar çok oynaktır ya da para politikasının etki alanı dışındadır: enerji, işlenmemiş gıda, alkol-tütün ve " +
                            "altın gibi. **Çekirdek enflasyon** göstergeleri bu kalemleri çıkararak fiyat artışının kalıcı eğilimini görmeye " +
                            "çalışır. Merkez bankaları faiz kararında çoğu zaman manşet rakamdan çok bu eğilime bakar.",
                    },
                    {
                        t: "p",
                        text:
                            "**ÜFE (Yurt İçi Üretici Fiyat Endeksi)** ise üreticilerin sattığı ürünlerin fiyatını ölçer. Üretici maliyetlerindeki " +
                            "artış zamanla tüketici fiyatlarına yansıyabildiği için ÜFE, TÜFE için bir öncü gösterge olarak izlenir.",
                    },
                ],
            },
            {
                id: "piyasalar",
                h2: "Enflasyon piyasaları nasıl etkiler?",
                blocks: [
                    {
                        t: "p",
                        text: "Aşağıdaki ilişkiler sık gözlenir ama her dönemde aynı şekilde işlemez:",
                    },
                    {
                        t: "ul",
                        items: [
                            `**Faiz:** beklenenden yüksek enflasyon, merkez bankasının faizi daha uzun süre yüksek tutacağı beklentisini güçlendirir. Ayrıntı için [faiz kararı rehberine](/rehber/faiz-karari-piyasalari-nasil-etkiler) bakın.`,
                            `**Kur:** yurt içi enflasyon ticaret ortaklarından yüksek kaldıkça paranın değer kaybetme eğilimi artar; bu, ${A("USD/TRY", "dolar/TL")} tartışmalarının merkezindedir.`,
                            `**Altın:** enflasyona karşı değer saklama aracı olarak anılır; ancak ${A("ALTIN", "altın")} fiyatını reel faiz ve dolar da güçlü biçimde etkiler.`,
                            `**Mevduat:** faiz enflasyonun altında kalırsa birikimin satın alma gücü azalır. Reel getiri hesabını [mevduat rehberinde](/rehber/mevduat-faizi-net-getiri-nasil-hesaplanir) anlattık.`,
                        ],
                    },
                ],
            },
        ],
        faq: [
            {
                q: "TÜFE ne zaman açıklanır?",
                a: "TÜİK, TÜFE'yi her ayın başında bir önceki ay için açıklar. Kesin tarih TÜİK'in yayın takviminde yer alır.",
            },
            {
                q: "Aylık enflasyon %2 ise yıllık enflasyon %24 mü olur?",
                a: "Hayır. Aylık oranlar bileşik büyür; her ay %2 artış yaklaşık %26,8 yıllık enflasyona karşılık gelir (örnek hesap).",
            },
            {
                q: "Çekirdek enflasyon nedir?",
                a: "Enerji, işlenmemiş gıda, alkol-tütün ve altın gibi oynak kalemler çıkarıldığında kalan fiyat artışıdır. Fiyatların kalıcı eğilimini görmek için kullanılır.",
            },
            {
                q: "Baz etkisi nedir?",
                a: "Yıllık enflasyonun, geçen yılın aynı ayındaki artıştan etkilenmesidir. Geçen yıl o ay yüksek bir artış varsa, bu yılki yıllık rakam fiyatlar artmaya devam etse bile düşebilir.",
            },
        ],
        assets: ["USD/TRY", "ALTIN", "MEVDUAT", "TAHVIL"],
        related: ["faiz-karari-piyasalari-nasil-etkiler", "mevduat-faizi-net-getiri-nasil-hesaplanir", "dolar-kuru-neye-gore-belirlenir"],
    },

    /* ------------------------------------------------------------------ */
    {
        slug: "mevduat-faizi-net-getiri-nasil-hesaplanir",
        title: "Mevduat faizi nasıl hesaplanır? Stopaj, net getiri ve reel getiri",
        metaTitle: "Mevduat Faizi Nasıl Hesaplanır? Stopaj ve Net Getiri",
        description:
            "Vadeli mevduatta brüt ve net faiz getirisi nasıl hesaplanır? Stopaj kesintisi, gün hesabı, vadeyi yenileyince bileşik getiri ve enflasyondan arındırılmış reel getiri formülü.",
        category: "Faiz ve birikim",
        published: "2026-10-18",
        updated: "2026-10-18",
        intro:
            "Bankanın ilan ettiği yıllık faiz oranı, vade sonunda hesabınıza geçecek tutarı doğrudan göstermez: arada vade süresi, " +
            "vergi kesintisi ve enflasyon vardır. Bu yazıda vadeli mevduat getirisinin adım adım nasıl hesaplandığını anlatıyoruz. " +
            "Örnekteki tüm oranlar uydurmadır; güncel oranlar bankaya ve döneme göre değişir.",
        sections: [
            {
                id: "brut",
                h2: "Brüt faiz getirisi",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Bankalar faizi **yıllık** oran olarak ilan eder; ama mevduat çoğu zaman 32 gün, 46 gün, 92 gün gibi kısa vadelere " +
                            "yatırılır. Bu yüzden yıllık oran, vade gününe oranlanır. Türk lirası mevduatta yıl genellikle 365 gün kabul edilir:",
                    },
                    {
                        t: "formula",
                        text: "Brüt getiri = Anapara × Yıllık faiz oranı × Vade (gün) ÷ 365",
                    },
                    {
                        t: "p",
                        text:
                            "Örnek (uydurma rakamlar): 100.000 TL, yıllık %40 faizle 32 gün vadeye yatırılsın. 100.000 × 0,40 × 32 ÷ 365 ≈ " +
                            "3.507 TL brüt getiri.",
                    },
                ],
            },
            {
                id: "stopaj",
                h2: "Stopaj kesintisi ve net getiri",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Mevduat faizi gelirinden kaynakta vergi kesilir; buna **stopaj** denir. Banka kesintiyi kendisi yapar ve hesabınıza " +
                            "net tutarı yatırır. Stopaj oranı vadeye ve para birimine göre farklılaşabilir ve dönem dönem yeniden belirlenir; " +
                            "bu yüzden güncel oranı bankanızdan ya da resmî duyurulardan kontrol etmek gerekir.",
                    },
                    {
                        t: "formula",
                        text: "Net getiri = Brüt getiri × (1 − Stopaj oranı)",
                    },
                    {
                        t: "p",
                        text:
                            "Örneğe devam edelim ve stopaj oranını (yine yalnızca örnek olarak) %15 alalım: 3.507 × 0,85 ≈ 2.981 TL net getiri. " +
                            "Vade sonunda hesapta 102.981 TL olur.",
                    },
                ],
            },
            {
                id: "bilesik",
                h2: "Vadeyi yenilemek: bileşik getiri",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Vade sonunda anapara ve net faiz birlikte yeniden yatırılırsa bir sonraki dönemde faize de faiz işler. Aynı oranın " +
                            "bütün yıl boyunca korunduğu varsayımıyla yıllık etkin getiri şöyle hesaplanır:",
                    },
                    {
                        t: "formula",
                        text: "Yıllık etkin getiri = (1 + Dönemlik net getiri oranı)^(365 ÷ Vade) − 1",
                    },
                    {
                        t: "p",
                        text:
                            "Örnekte dönemlik net getiri oranı 2.981 ÷ 100.000 ≈ %2,98'dir. 365 ÷ 32 ≈ 11,4 dönem için: 1,0298^11,4 − 1 ≈ " +
                            "%39,8. Bu hesap, oranların yıl boyunca değişmeyeceği varsayımına dayanır; gerçekte her yenilemede oran değişebilir.",
                    },
                ],
            },
            {
                id: "reel",
                h2: "Reel getiri: enflasyondan arındırmak",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Nominal getiri paranın miktarındaki artışı, reel getiri ise satın alma gücündeki değişimi gösterir. Enflasyon " +
                            "getiriden yüksekse, hesaptaki rakam artsa bile aynı parayla daha az şey alınır:",
                    },
                    {
                        t: "formula",
                        text: "Reel getiri = (1 + Nominal getiri) ÷ (1 + Enflasyon) − 1",
                    },
                    {
                        t: "p",
                        text:
                            "Örnek (uydurma rakamlar): yıllık net getiri %39,8, aynı dönemde enflasyon %35 ise reel getiri 1,398 ÷ 1,35 − 1 ≈ " +
                            "%3,6'dır. Basit çıkarma (%39,8 − %35 = %4,8) yüksek enflasyonda yanıltıcı sonuç verir. Enflasyonun nasıl " +
                            `ölçüldüğünü [enflasyon rehberinde](/rehber/enflasyon-nedir-tufe-nasil-hesaplanir) anlattık.`,
                    },
                ],
            },
            {
                id: "dikkat",
                h2: "Mevduatta dikkat edilen diğer noktalar",
                blocks: [
                    {
                        t: "ul",
                        items: [
                            "**Vade bozma:** vade dolmadan para çekilirse faiz çoğu zaman hiç ödenmez ya da çok düşük oranla hesaplanır.",
                            "**Hoş geldin faizi:** yeni müşteriye ya da yeni paraya verilen yüksek oran, yenilemede standart orana dönebilir.",
                            "**Mevduat sigortası:** Türkiye'de tasarruf mevduatı, Tasarruf Mevduatı Sigorta Fonu (TMSF) güvencesi altındadır; ancak güvence kişi ve banka başına belirli bir tutarla sınırlıdır ve bu tutar dönemsel olarak güncellenir.",
                            "**Döviz mevduatı:** getirisi hem faize hem kur değişimine bağlıdır; kur hareketi faiz getirisinden çok daha büyük olabilir.",
                        ],
                    },
                    {
                        t: "p",
                        text:
                            `Yorumcuların mevduat hakkındaki görüşlerini ${A("MEVDUAT", "mevduat sayfasında")}, faiz politikasına dair ` +
                            `beklentilerin tahvil piyasasına yansımasını ${A("TAHVIL", "tahvil sayfasında")} görebilirsiniz.`,
                    },
                ],
            },
        ],
        faq: [
            {
                q: "Mevduat faizi nasıl hesaplanır?",
                a: "Brüt getiri, anapara × yıllık faiz oranı × vade günü ÷ 365 formülüyle bulunur. Buradan stopaj kesintisi düşülerek net getiriye ulaşılır.",
            },
            {
                q: "Stopaj nedir?",
                a: "Faiz gelirinden bankanın kaynakta kestiği vergidir. Oranı vadeye ve para birimine göre değişebilir ve dönem dönem yeniden belirlenir.",
            },
            {
                q: "Reel getiri nasıl hesaplanır?",
                a: "(1 + nominal getiri) ÷ (1 + enflasyon) − 1 formülüyle. Yüksek enflasyon dönemlerinde nominal getiriden enflasyonu basitçe çıkarmak yanıltıcı sonuç verir.",
            },
            {
                q: "Vade dolmadan para çekilirse ne olur?",
                a: "Çoğu bankada vade bozulduğunda faiz ödenmez ya da çok düşük bir oranla hesaplanır. Koşullar bankadan bankaya değişir.",
            },
        ],
        assets: ["MEVDUAT", "TAHVIL", "USD/TRY"],
        related: ["enflasyon-nedir-tufe-nasil-hesaplanir", "faiz-karari-piyasalari-nasil-etkiler", "tahvil-nedir-faiz-fiyat-iliskisi"],
    },

    /* ------------------------------------------------------------------ */
    {
        slug: "tahvil-nedir-faiz-fiyat-iliskisi",
        title: "Tahvil nedir? Faiz yükselince tahvil fiyatı neden düşer?",
        metaTitle: "Tahvil Nedir? Faiz ile Tahvil Fiyatı Neden Ters Hareket Eder",
        description:
            "Tahvil ve bono nedir, kupon ve vade ne demek? Faiz ile tahvil fiyatı arasındaki ters ilişki örnek hesapla, getiri, durasyon ve enflasyona endeksli tahviller.",
        category: "Faiz ve birikim",
        published: "2026-10-18",
        updated: "2026-10-18",
        intro:
            "Yorumcular 'tahvil faizleri yükseldi' dediğinde aynı anda 'tahvil fiyatları düştü' demiş olurlar. İlk bakışta kafa " +
            "karıştıran bu ilişki, tahvilin nasıl çalıştığı anlaşılınca basitleşir. Bu yazıda tahvilin temel kavramlarını ve " +
            "faizle fiyat arasındaki ters ilişkiyi örnek bir hesapla anlatıyoruz.",
        sections: [
            {
                id: "nedir",
                h2: "Tahvil ve bono nedir?",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Tahvil, borç almak isteyen bir devletin ya da şirketin çıkardığı borç senedidir. Tahvili alan kişi borç vermiş olur; " +
                            "karşılığında belirli tarihlerde faiz ve vade sonunda anaparayı geri alır. Türkiye'de vadesi bir yıldan kısa olan " +
                            "devlet borçlanma senetlerine **hazine bonosu**, daha uzun olanlara **devlet tahvili** denir.",
                    },
                    {
                        t: "ul",
                        items: [
                            "**Nominal değer:** vade sonunda geri ödenecek anapara.",
                            "**Kupon:** dönemsel olarak ödenen faiz. Kuponsuz senetler iskontolu satılır; getiri, alış fiyatı ile nominal değer arasındaki farktır.",
                            "**Vade:** borcun geri ödeneceği tarih.",
                            "**Getiri (faiz):** tahvilin bugünkü fiyatından alınıp vadeye kadar tutulduğunda sağlayacağı yıllık getiri. Haberlerde 'tahvil faizi' denince bu kastedilir.",
                        ],
                    },
                ],
            },
            {
                id: "ters-iliski",
                h2: "Faiz ile fiyat neden ters hareket eder?",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Bir tahvilin kuponu çıkarıldığı gün sabitlenir. Piyasadaki faizler sonradan yükselirse, yeni çıkarılan tahviller " +
                            "daha yüksek kupon öder; eski tahvili kimse aynı fiyattan almak istemez. Eski tahvilin fiyatı, getirisi yeni " +
                            "faiz düzeyine eşitlenene kadar düşer. Faizler düştüğünde tersi olur.",
                    },
                    {
                        t: "p",
                        text: "Basit bir örnek (uydurma rakamlar, bir yıl vadeli tek kuponlu tahvil):",
                    },
                    {
                        t: "ol",
                        items: [
                            "Nominal 100 TL, kupon %10. Vade sonunda 100 + 10 = 110 TL ödenecek.",
                            "Piyasa faizi %10 iken fiyat: 110 ÷ 1,10 = 100 TL.",
                            "Piyasa faizi %12'ye çıkarsa fiyat: 110 ÷ 1,12 ≈ 98,21 TL.",
                            "Piyasa faizi %8'e inerse fiyat: 110 ÷ 1,08 ≈ 101,85 TL.",
                        ],
                    },
                    {
                        t: "formula",
                        text: "Fiyat = Gelecekteki ödemeler ÷ (1 + Piyasa faizi)^süre",
                        caption: "Her ödeme kendi tarihine göre iskonto edilip toplanır",
                    },
                ],
            },
            {
                id: "durasyon",
                h2: "Vade uzadıkça risk neden artar? Durasyon",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Yukarıdaki örnekte faizin 2 puan artması fiyatı yaklaşık %1,8 düşürdü. Aynı artış 10 yıl vadeli bir tahvilde çok daha " +
                            "büyük bir fiyat düşüşü yaratır, çünkü daha düşük kupon çok daha uzun süre katlanılacak bir dezavantajdır. Tahvilin " +
                            "faiz değişimine duyarlılığının ölçüsüne **durasyon** denir; vade uzadıkça ve kupon düştükçe durasyon artar.",
                    },
                    {
                        t: "p",
                        text:
                            "Bu yüzden faiz beklentisi değiştiğinde en sert hareketi uzun vadeli tahviller yapar. Vadeye kadar tutulan bir " +
                            "tahvilde ara dönemdeki fiyat düşüşü gerçekleşmiş bir kayıp değildir; ama tahvil vadeden önce satılırsa kayıp " +
                            "gerçekleşir.",
                    },
                ],
            },
            {
                id: "turler",
                h2: "Tahvil türleri",
                blocks: [
                    {
                        t: "ul",
                        items: [
                            "**Sabit kuponlu:** kupon baştan bellidir; faiz değişimine en duyarlı türdür.",
                            "**Değişken faizli:** kupon belirli bir referans faize göre dönemsel olarak güncellenir; fiyat faiz değişiminden daha az etkilenir.",
                            "**Enflasyona (TÜFE'ye) endeksli:** anapara enflasyona göre güncellenir; yatırımcıya reel getiri sunar.",
                            "**Eurobond:** devletin ya da şirketin yabancı para cinsinden, uluslararası piyasada çıkardığı tahvildir.",
                            "**Özel sektör tahvili:** şirketlerin çıkardığı tahvildir; şirketin geri ödeme riski nedeniyle genellikle devlet tahvilinden daha yüksek getiri sunar.",
                        ],
                    },
                ],
            },
            {
                id: "neden-onemli",
                h2: "Tahvil faizleri neden herkesi ilgilendirir?",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Devlet tahvili faizi, bir ülkede borç almanın taban maliyetidir. Kredi faizleri, şirketlerin borçlanma maliyeti ve " +
                            "hisse senetlerinin değerlemesi bu tabana göre şekillenir. Tahvil faizleri ayrıca piyasanın enflasyon ve merkez " +
                            `bankası beklentilerini gösterir. Türkiye tahvilleri hakkındaki görüşler için ${A("TAHVIL", "tahvil sayfasına")}, ` +
                            `küresel referans faiz için [ABD 10 yıllık tahvil rehberine](/rehber/abd-10-yillik-tahvil-faizi-neden-onemli) bakın.`,
                    },
                ],
            },
        ],
        faq: [
            {
                q: "Tahvil ile bono arasındaki fark nedir?",
                a: "Türkiye'de vadesi bir yıldan kısa olan devlet borçlanma senetlerine hazine bonosu, bir yıl ve daha uzun olanlara devlet tahvili denir.",
            },
            {
                q: "Faiz yükselince tahvil fiyatı neden düşer?",
                a: "Eski tahvilin kuponu sabittir. Piyasa faizi yükselince yeni tahviller daha çok kazandırır; eski tahvilin fiyatı, getirisi yeni faiz düzeyine eşitlenene kadar düşer.",
            },
            {
                q: "Durasyon nedir?",
                a: "Tahvil fiyatının faiz değişimine duyarlılığının ölçüsüdür. Vade uzadıkça ve kupon düştükçe durasyon, yani faiz riski artar.",
            },
            {
                q: "Tahvil vadeye kadar tutulursa zarar edilir mi?",
                a: "İhraççı borcunu öderse vade sonunda nominal değer ve kuponlar alınır; ara dönemdeki fiyat düşüşü gerçekleşmez. Ancak ihraççının ödeme yapamaması (kredi riski) ve enflasyon riski vadeye kadar tutmakla ortadan kalkmaz.",
            },
        ],
        assets: ["TAHVIL", "US10Y", "MEVDUAT"],
        related: ["abd-10-yillik-tahvil-faizi-neden-onemli", "faiz-karari-piyasalari-nasil-etkiler", "mevduat-faizi-net-getiri-nasil-hesaplanir"],
    },

    /* ------------------------------------------------------------------ */
    {
        slug: "abd-10-yillik-tahvil-faizi-neden-onemli",
        title: "ABD 10 yıllık tahvil faizi neden önemli? Verim eğrisi ve resesyon",
        metaTitle: "ABD 10 Yıllık Tahvil Faizi Neden Önemli? Verim Eğrisi",
        description:
            "ABD 10 yıllık tahvil faizi neden dünyanın referans faizi sayılır? Borsa, altın, dolar ve gelişen piyasalarla ilişkisi, verim eğrisinin tersine dönmesi ve resesyon sinyali.",
        category: "Makro",
        published: "2026-10-18",
        updated: "2026-10-18",
        intro:
            "Fed'in politika faizi kısa vadeli borçlanmanın maliyetini belirler; uzun vadeli maliyetin pusulası ise ABD 10 yıllık " +
            "tahvil faizidir. Yorumcuların bu rakamı neden bu kadar sık andığını, verim eğrisinin ne anlattığını ve 'resesyon " +
            "sinyali' denen şeyin sınırlarını bu yazıda anlatıyoruz.",
        sections: [
            {
                id: "referans",
                h2: "Neden 'dünyanın referans faizi'?",
                blocks: [
                    {
                        t: "p",
                        text:
                            "ABD Hazinesi'nin çıkardığı tahviller, dünyanın en büyük ve en likit borç piyasasını oluşturur ve küresel ölçekte " +
                            "en düşük riskli dolar varlığı kabul edilir. 10 yıllık vade, kısa vadeli para politikası beklentileri ile uzun " +
                            "vadeli büyüme ve enflasyon beklentilerinin buluştuğu nokta olduğu için referans olarak kullanılır.",
                    },
                    {
                        t: "p",
                        text:
                            "ABD'de konut kredisi faizleri, şirket tahvili faizleri ve pek çok ülkenin dolar cinsinden borçlanma maliyeti bu " +
                            `faize göre şekillenir. Canlı görüş sayımı için ${A("US10Y", "ABD 10 yıllık tahvil sayfasına")} bakabilirsiniz.`,
                    },
                ],
            },
            {
                id: "neyi-etkiler",
                h2: "10 yıllık faiz neyi etkiler?",
                blocks: [
                    {
                        t: "p",
                        text: "Aşağıdaki ilişkiler sık gözlenir; ama her dönemde aynı güçte ve aynı yönde işlemez:",
                    },
                    {
                        t: "ul",
                        items: [
                            `**Hisse senetleri:** gelecekteki kârların bugünkü değeri faizle iskonto edilir. Faiz yükseldiğinde, kârının büyük kısmı uzak gelecekte beklenen büyüme şirketleri daha çok etkilenir; bu yüzden ${A("NASDAQ", "Nasdaq")} çoğu zaman bu faize ${A("SP500", "S&P 500")}'den daha duyarlıdır.`,
                            `**Altın:** faiz getirmeyen bir varlık olduğu için, enflasyondan arındırılmış (reel) faizin yükselmesi ${A("ALTIN", "altını")} elde tutmanın fırsat maliyetini artırır.`,
                            `**Dolar:** ABD faizlerinin diğer ülkelere göre yükselmesi doları çekici kılabilir ve ${A("DXY", "dolar endeksini")} destekleyebilir.`,
                            "**Gelişen piyasalar:** ABD'de risksiz getiri yükseldiğinde, daha riskli piyasalara giden sermaye azalabilir; bu ülkelerin para birimleri ve tahvilleri baskı görebilir.",
                        ],
                    },
                ],
            },
            {
                id: "neden-degisir",
                h2: "10 yıllık faizi ne hareket ettirir?",
                blocks: [
                    {
                        t: "ul",
                        items: [
                            "**Fed beklentileri:** politika faizinin önümüzdeki yıllarda nerede olacağına dair beklenti.",
                            "**Enflasyon beklentisi:** yatırımcılar ileride yüksek enflasyon bekliyorsa daha yüksek getiri ister.",
                            "**Vade primi:** uzun süre borç vermenin belirsizliği için istenen ek getiri; bütçe açığı ve borç arzı bu primi etkileyebilir.",
                            "**Güvenli liman talebi:** kriz anlarında yatırımcılar ABD tahvillerine yönelir; talep fiyatı yükseltir, faizi düşürür.",
                        ],
                    },
                    {
                        t: "p",
                        text:
                            `Faiz ile tahvil fiyatı arasındaki ters ilişkiyi [tahvil rehberinde](/rehber/tahvil-nedir-faiz-fiyat-iliskisi) örnekle ` +
                            "anlattık: 'faiz yükseldi' ile 'tahvil fiyatı düştü' aynı olayın iki anlatımıdır.",
                    },
                ],
            },
            {
                id: "verim-egrisi",
                h2: "Verim eğrisi ve tersine dönmesi",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Verim eğrisi, aynı ihraççının farklı vadelerdeki tahvil faizlerinin çizgisidir. Normal koşullarda uzun vade daha " +
                            "yüksek faiz öder; eğri yukarı doğru eğimlidir. Kısa vadeli faiz uzun vadeliden yüksek olduğunda eğri **tersine " +
                            "döner** (inversiyon). En çok izlenen ölçülerden biri 10 yıllık ile 2 yıllık faiz arasındaki farktır.",
                    },
                    {
                        t: "p",
                        text:
                            "Tersine dönmüş eğri, piyasanın ileride faizlerin düşeceğini, yani ekonominin yavaşlayacağını beklediği şeklinde " +
                            "yorumlanır. Geçmişte ABD'de pek çok resesyondan önce eğri tersine dönmüştür; bu yüzden 'resesyon sinyali' olarak anılır.",
                    },
                    {
                        t: "note",
                        text:
                            "Sinyalin sınırları da var: tersine dönme ile resesyon arasındaki süre geçmişte aylar ile yıllar arasında değişti ve eğrinin tersine döndüğü her dönemi resesyon izlemedi. Tek başına zamanlama aracı olarak kullanılamaz.",
                    },
                ],
            },
        ],
        faq: [
            {
                q: "ABD 10 yıllık tahvil faizi neden önemli?",
                a: "Dünyanın en büyük ve en likit borç piyasasının referans faizidir. Konut kredisinden şirket borçlanmasına, hisse değerlemesinden gelişen ülke tahvillerine kadar pek çok fiyat bu faize göre şekillenir.",
            },
            {
                q: "Tahvil faizi yükselince borsa düşer mi?",
                a: "Çoğu zaman baskı yaratır, çünkü gelecekteki kârların bugünkü değeri azalır. Ancak faiz güçlü büyüme beklentisiyle yükseliyorsa borsa da yükselebilir; ilişki kural değildir.",
            },
            {
                q: "Verim eğrisinin tersine dönmesi ne demek?",
                a: "Kısa vadeli tahvil faizinin uzun vadeliden yüksek olmasıdır. Piyasanın ileride faiz indirimi ve ekonomik yavaşlama beklediği şeklinde yorumlanır.",
            },
            {
                q: "Verim eğrisi tersine dönünce resesyon kesin mi?",
                a: "Hayır. Geçmişte birçok resesyondan önce görülmüştür, ama her tersine dönmeyi resesyon izlememiştir ve aradaki süre çok değişkendir.",
            },
        ],
        assets: ["US10Y", "NASDAQ", "SP500", "ALTIN", "DXY"],
        related: ["tahvil-nedir-faiz-fiyat-iliskisi", "faiz-karari-piyasalari-nasil-etkiler", "dolar-endeksi-dxy-nedir"],
    },

    /* ------------------------------------------------------------------ */
    {
        slug: "cds-nedir-ulke-risk-primi",
        title: "CDS nedir? Ülke risk primi nasıl okunur?",
        metaTitle: "CDS Nedir? Türkiye CDS Primi ve Ülke Riski Nasıl Okunur",
        description:
            "CDS (kredi temerrüt takası) nedir, baz puan ne demek? Türkiye'nin CDS priminin borçlanma maliyeti, kur ve yabancı yatırımcı ilgisiyle ilişkisi.",
        category: "Makro",
        published: "2026-10-18",
        updated: "2026-10-18",
        intro:
            "Türkiye ekonomisi hakkındaki yorumlarda 'CDS primi düştü' ya da 'risk primi yükseldi' cümlesi sık geçer. CDS, piyasanın " +
            "bir ülkenin borcunu ödeyememe ihtimaline biçtiği fiyattır. Bu yazıda CDS'nin nasıl çalıştığını, baz puanın ne demek " +
            "olduğunu ve bu göstergenin neden kur ve faizle birlikte izlendiğini anlatıyoruz.",
        sections: [
            {
                id: "nedir",
                h2: "CDS nedir?",
                blocks: [
                    {
                        t: "p",
                        text:
                            "CDS (credit default swap, kredi temerrüt takası), bir borçlunun ödeme yapamaması riskine karşı alınan bir tür " +
                            "sigortadır. Koruma satın alan taraf düzenli olarak prim öder; borçlu temerrüde düşerse koruma satan taraf kaybı " +
                            "karşılar. Ülkeler için işlem gören CDS'ler, o ülkenin dolar cinsinden borçlarını temel alır.",
                    },
                    {
                        t: "p",
                        text:
                            "En çok izlenen vade **5 yıllıktır**. 'Türkiye'nin CDS'i' denince genellikle 5 yıllık CDS primi kastedilir.",
                    },
                ],
            },
            {
                id: "baz-puan",
                h2: "Baz puan ne demek?",
                blocks: [
                    {
                        t: "p",
                        text:
                            "CDS primi **baz puan** ile ifade edilir; 100 baz puan yüzde 1'e eşittir. Prim, korunan tutarın yıllık yüzdesi " +
                            "olarak ödenir:",
                    },
                    {
                        t: "formula",
                        text: "Yıllık prim = Korunan tutar × Baz puan ÷ 10.000",
                    },
                    {
                        t: "p",
                        text:
                            "Örnek (uydurma rakamlar): 300 baz puanlık bir CDS ile 10 milyon dolarlık borcu korumanın yıllık maliyeti 10.000.000 " +
                            "× 300 ÷ 10.000 = 300.000 dolardır. Prim ne kadar yüksekse, piyasa temerrüt riskini o kadar yüksek görüyor demektir.",
                    },
                ],
            },
            {
                id: "neden-onemli",
                h2: "CDS neden bu kadar izleniyor?",
                blocks: [
                    {
                        t: "ul",
                        items: [
                            "**Borçlanma maliyeti:** CDS primi, ülkenin ve o ülkedeki şirketlerin yurt dışından ne kadar maliyetle borçlanabileceğinin iyi bir göstergesidir. Prim düşerse dış borçlanma ucuzlar.",
                            "**Yabancı yatırımcı ilgisi:** pek çok uluslararası yatırımcı, bir ülkenin varlıklarına yönelmeden önce risk primine bakar. Düşen CDS çoğu zaman yabancı girişleriyle birlikte görülür.",
                            "**Kur ve faiz:** risk priminin yükselmesi çoğu zaman yerel paranın değer kaybı ve tahvil faizlerinin yükselmesiyle aynı döneme denk gelir; bu üçü aynı risk algısının farklı yüzleridir.",
                        ],
                    },
                    {
                        t: "p",
                        text:
                            `Bu yüzden ${A("XU100", "BIST 100")}, ${A("BANKA-HISSE", "banka hisseleri")} ve ${A("TAHVIL", "Türkiye tahvilleri")} ` +
                            "hakkındaki yorumlarda CDS sık bir gerekçe olarak geçer.",
                    },
                ],
            },
            {
                id: "neden-degisir",
                h2: "CDS primini ne değiştirir?",
                blocks: [
                    {
                        t: "ul",
                        items: [
                            "Ülkeye özgü etkenler: döviz rezervleri, cari denge, bütçe açığı, enflasyon ve para politikasının güvenilirliği.",
                            "Kredi derecelendirme kuruluşlarının not ve görünüm kararları.",
                            "Siyasi ve jeopolitik gelişmeler.",
                            "Küresel risk iştahı: dünya genelinde riskten kaçış olduğunda gelişen ülkelerin CDS'leri birlikte yükselebilir.",
                        ],
                    },
                    {
                        t: "note",
                        text:
                            "CDS bir piyasa fiyatıdır, kesin bir olasılık hesabı değildir. Likiditenin azaldığı dönemlerde ya da büyük kurumların korunma ihtiyacıyla, temel göstergeler değişmeden de hareket edebilir.",
                    },
                ],
            },
        ],
        faq: [
            {
                q: "CDS primi nedir?",
                a: "Bir ülkenin ya da şirketin borcunu ödeyememe riskine karşı alınan korumanın yıllık maliyetidir. Baz puanla ifade edilir; 100 baz puan yüzde 1'dir.",
            },
            {
                q: "CDS'nin düşmesi ne anlama gelir?",
                a: "Piyasanın temerrüt riskini daha düşük gördüğü anlamına gelir. Bu genellikle dış borçlanma maliyetinin azalması ve yabancı yatırımcı ilgisinin artmasıyla birlikte görülür.",
            },
            {
                q: "Türkiye'nin CDS'i denince hangi vade kastedilir?",
                a: "Genellikle 5 yıllık CDS primi kastedilir; en çok işlem gören ve en sık alıntılanan vade budur.",
            },
        ],
        assets: ["TAHVIL", "XU100", "BANKA-HISSE", "USD/TRY"],
        related: ["cari-acik-nedir-kuru-nasil-etkiler", "dolar-kuru-neye-gore-belirlenir", "tahvil-nedir-faiz-fiyat-iliskisi"],
    },

    /* ------------------------------------------------------------------ */
    {
        slug: "cari-acik-nedir-kuru-nasil-etkiler",
        title: "Cari açık nedir? Ödemeler dengesi ve kurla ilişkisi",
        metaTitle: "Cari Açık Nedir? Ödemeler Dengesi ve Dolar Kuruna Etkisi",
        description:
            "Cari işlemler dengesi nasıl oluşur, cari açık nasıl finanse edilir? Enerji ve altın ithalatının, turizm gelirinin ve sermaye girişlerinin kur üzerindeki etkisi.",
        category: "Makro",
        published: "2026-10-18",
        updated: "2026-10-18",
        intro:
            "Türkiye ekonomisi hakkındaki tartışmaların çoğu bir noktada cari açığa gelir: ülkenin dışarıya ödediği döviz, dışarıdan " +
            "kazandığından fazla mı? Bu yazıda cari dengenin hangi kalemlerden oluştuğunu, açığın nasıl finanse edildiğini ve bunun " +
            "kur tartışmalarındaki yerini anlatıyoruz.",
        sections: [
            {
                id: "nedir",
                h2: "Cari işlemler dengesi nedir?",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Bir ülkenin dünyanın geri kalanıyla yaptığı tüm ekonomik işlemler **ödemeler dengesi** tablosunda izlenir. Bu " +
                            "tablonun ilk bölümü olan cari işlemler hesabı dört ana kalemden oluşur:",
                    },
                    {
                        t: "ul",
                        items: [
                            "**Mal ticareti:** ihracat ile ithalat arasındaki fark (dış ticaret dengesi).",
                            "**Hizmetler:** turizm, taşımacılık, inşaat ve yazılım gibi hizmet gelir ve giderleri.",
                            "**Birincil gelir:** yurt dışına ödenen ya da yurt dışından alınan faiz, kâr payı ve ücretler.",
                            "**İkincil gelir:** işçi dövizleri gibi karşılıksız transferler.",
                        ],
                    },
                    {
                        t: "p",
                        text:
                            "Bu kalemlerin toplamı negatifse ülke **cari açık**, pozitifse **cari fazla** verir. Türkiye'de ödemeler dengesi " +
                            "istatistikleri Türkiye Cumhuriyet Merkez Bankası (TCMB) tarafından aylık olarak yayımlanır.",
                    },
                ],
            },
            {
                id: "turkiye",
                h2: "Türkiye'de cari dengeyi belirleyen kalemler",
                blocks: [
                    {
                        t: "ul",
                        items: [
                            `**Enerji ithalatı:** Türkiye petrol ve doğal gazın büyük bölümünü ithal eder. Bu yüzden ${A("BZ=F", "Brent petrol")} ve ${A("NG=F", "doğal gaz")} fiyatlarındaki artış cari dengeyi doğrudan bozar.`,
                            `**Altın ticareti:** yurt içinde altın talebi arttığında altın ithalatı yükselir ve cari açığa eklenir. Bu yüzden analistler sıklıkla 'enerji ve altın hariç cari denge'ye de bakar.`,
                            "**Turizm:** hizmet gelirlerinin en büyük kalemlerinden biridir; yaz aylarında cari dengeyi belirgin biçimde iyileştirir.",
                            "**Ara malı ithalatı:** ihracatta kullanılan hammadde ve ara malların önemli kısmı ithal edildiği için ihracat artışı ithalatı da artırabilir.",
                        ],
                    },
                ],
            },
            {
                id: "finansman",
                h2: "Cari açık nasıl finanse edilir?",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Cari açık veren bir ülke, aradaki dövizi bir yerden bulmak zorundadır. Bu, ödemeler dengesinin finans hesabında görülür:",
                    },
                    {
                        t: "ul",
                        items: [
                            "**Doğrudan yatırım:** yabancıların şirket kurması ya da satın alması. Uzun vadeli olduğu için en sağlıklı finansman kaynağı sayılır.",
                            "**Portföy yatırımı:** yabancıların hisse ve tahvil alımları. Hızlı gelir, hızlı da çıkabilir; bu yüzden 'sıcak para' diye anılır.",
                            "**Borçlanma:** bankaların, şirketlerin ve devletin yurt dışından kredi ya da tahvil yoluyla borçlanması.",
                            "**Rezervler:** bu kaynaklar yetmediğinde merkez bankasının döviz rezervleri kullanılır.",
                        ],
                    },
                    {
                        t: "p",
                        text:
                            "Tabloda ayrıca 'net hata ve noksan' diye bir kalem bulunur; kaynağı tam tespit edilemeyen döviz giriş ve çıkışlarını " +
                            "gösterir ve Türkiye'de zaman zaman büyük tutarlara ulaşır.",
                    },
                ],
            },
            {
                id: "kur",
                h2: "Cari açık kuru nasıl etkiler?",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Cari açık, ülkenin sürekli döviz ihtiyacı olduğu anlamına gelir. Finansman kolay bulunduğunda açık kuru fazla " +
                            "etkilemeyebilir; ancak küresel koşullar sıkılaştığında ya da ülke risk primi yükseldiğinde finansman zorlaşır ve " +
                            `baskı ${A("USD/TRY", "kura")} yansır. Kurun değer kaybı da zamanla ithalatı pahalılaştırıp ihracatı destekleyerek ` +
                            "açığı daraltabilir; bu dengelenme mekanizması ise çoğu zaman enflasyon pahasına çalışır.",
                    },
                    {
                        t: "p",
                        text:
                            `Kuru belirleyen diğer etkenleri [dolar kuru rehberinde](/rehber/dolar-kuru-neye-gore-belirlenir), ülke riskinin ` +
                            `ölçüsünü [CDS rehberinde](/rehber/cds-nedir-ulke-risk-primi) anlattık.`,
                    },
                ],
            },
        ],
        faq: [
            {
                q: "Cari açık nedir?",
                a: "Bir ülkenin mal, hizmet, gelir ve transfer kalemlerinde dünyaya ödediği dövizin, dünyadan elde ettiği dövizden fazla olmasıdır.",
            },
            {
                q: "Cari açık neden kuru etkiler?",
                a: "Cari açık sürekli döviz ihtiyacı yaratır. Bu ihtiyaç yatırım ve borçlanma girişleriyle karşılanamadığında döviz talebi kuru yukarı iter.",
            },
            {
                q: "Enerji ve altın hariç cari denge neden ayrıca izlenir?",
                a: "Türkiye'nin cari dengesi enerji fiyatlarından ve dönemsel altın talebinden güçlü biçimde etkilenir. Bu kalemler çıkarıldığında ekonominin geri kalanının dış dengesi daha net görülür.",
            },
            {
                q: "Cari açık verileri nereden takip edilir?",
                a: "Türkiye'nin ödemeler dengesi istatistikleri TCMB tarafından aylık olarak yayımlanır.",
            },
        ],
        assets: ["USD/TRY", "BZ=F", "NG=F", "ALTIN"],
        related: ["dolar-kuru-neye-gore-belirlenir", "cds-nedir-ulke-risk-primi", "petrol-fiyatlari-neden-degisir-brent-wti"],
    },

    /* ------------------------------------------------------------------ */
    {
        slug: "yatirim-dolandiriciligi-nasil-anlasilir",
        title: "Yatırım dolandırıcılığı nasıl anlaşılır? Sahte sinyal grupları ve sahte platformlar",
        metaTitle: "Yatırım Dolandırıcılığı Nasıl Anlaşılır? 10 Uyarı İşareti",
        description:
            "Garanti kazanç vaadi, sahte ünlü reklamları, WhatsApp ve Telegram 'VIP sinyal' grupları, yetkisiz forex siteleri ve para çekme engeli: yatırım dolandırıcılığının uyarı işaretleri.",
        category: "Yöntem",
        published: "2026-10-18",
        updated: "2026-10-18",
        intro:
            "Ekonomi yorumlarının bu kadar ilgi gördüğü bir ortamda, tanınmış isimlerin yüzünü ve sesini kullanan dolandırıcılık da " +
            "yaygınlaştı. Bu yazıda yatırım dolandırıcılığının en sık görülen biçimlerini, uyarı işaretlerini ve bir kuruluşun yetkili " +
            "olup olmadığını nasıl kontrol edebileceğinizi anlatıyoruz.",
        sections: [
            {
                id: "uyari-isaretleri",
                h2: "On uyarı işareti",
                blocks: [
                    {
                        t: "ol",
                        items: [
                            "**Garanti ya da sabit yüksek getiri vaadi.** Gerçek piyasalarda getiri garanti edilmez; 'aylık sabit %10' gibi vaatler en belirgin işarettir.",
                            "**Acele ettirme.** 'Kontenjan doluyor', 'fırsat bugün bitiyor' gibi baskılar düşünme süresini ortadan kaldırmak içindir.",
                            "**Tanınmış birinin reklamı.** Ünlü bir ekonomist, iş insanı ya da sunucunun bir platformu tavsiye ettiği reklam ve videolar çoğu zaman sahtedir; yapay zeka ile ses ve görüntü taklidi artık kolaydır.",
                            "**Mesajlaşma grubuna davet.** WhatsApp ya da Telegram'da 'VIP sinyal grubu', 'hocamızın özel grubu' gibi davetler.",
                            "**Kişisel 'hesap yöneticisi'.** Sizi sürekli arayan, daha fazla para yatırmaya yönlendiren bir 'danışman'.",
                            "**Uzaktan erişim uygulaması istemek.** 'Kurulumda yardım edeyim' diyerek telefonunuza ya da bilgisayarınıza uzaktan bağlanma isteği.",
                            "**Kişisel hesaba para gönderme.** Yatırımın şirket hesabı yerine bir şahıs hesabına ya da kripto cüzdanına istenmesi.",
                            "**Para çekememek.** Kazanç ekranda görünür ama çekmek istediğinizde 'vergi', 'komisyon' ya da 'doğrulama ücreti' istenir.",
                            "**Yetki belgesi göstermemek.** Kuruluşun Türkiye'de faaliyet izni olduğunu gösteren bir kayıt yoktur ya da yurt dışında kayıtlı olduğu söylenir.",
                            "**Sır tutma isteği.** 'Bankanıza yatırım olduğunu söylemeyin' gibi yönlendirmeler.",
                        ],
                    },
                ],
            },
            {
                id: "yontemler",
                h2: "En sık görülen dolandırıcılık biçimleri",
                blocks: [
                    {
                        t: "ul",
                        items: [
                            "**Sahte yatırım platformu:** gerçek bir borsaya benzeyen web sitesi ya da uygulama. Ekrandaki 'kazanç' sanaldır; yatırılan para dolandırıcının hesabına gider.",
                            "**Pompala ve boşalt:** bir grup, düşük hacimli bir hisseyi ya da kripto parayı topluca öne çıkarır; fiyat yükselince elindekileri satar, geç kalanlar kayıpla kalır.",
                            "**Sinyal satışı:** ücret karşılığında 'kesin al-sat sinyali' satan gruplar. Yetkisiz yatırım danışmanlığı niteliği taşıyabilir.",
                            "**Saadet zinciri:** yeni katılanların parası eski katılanlara 'getiri' olarak ödenir; yeni katılım durduğunda sistem çöker.",
                            "**Sahte destek hesabı:** gerçek bir borsanın ya da bankanın müşteri hizmetleri gibi davranan sosyal medya hesapları.",
                        ],
                    },
                ],
            },
            {
                id: "kontrol",
                h2: "Bir kuruluşun yetkili olup olmadığı nasıl kontrol edilir?",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Türkiye'de sermaye piyasası faaliyetinde bulunacak kuruluşların Sermaye Piyasası Kurulu'ndan (SPK) izin alması gerekir. " +
                            "SPK, izinli kuruluşların listesini kendi internet sitesinde yayımlar; ayrıca izinsiz faaliyet gösterdiği tespit edilen " +
                            "siteler hakkında erişim engeli kararları alır ve bunları da duyurur.",
                    },
                    {
                        t: "ol",
                        items: [
                            "Kuruluşun tam unvanını SPK'nın yetkili kuruluşlar listesinde arayın; benzer isimlerle karıştırmayın.",
                            "İnternet adresinin, listede yer alan kuruluşun resmî adresiyle birebir aynı olduğunu kontrol edin.",
                            "Kripto varlık hizmet sağlayıcıları için de SPK'nın yayımladığı listelere bakın.",
                            "Şüpheli bir durumla karşılaştığınızda bankanızı arayın ve şikâyetinizi resmî kanallardan iletin.",
                        ],
                    },
                    {
                        t: "note",
                        text:
                            "Yurt dışında yerleşik ve Türkiye'de izni olmayan kuruluşlar aracılığıyla Türkiye'deki kişilere kaldıraçlı alım satım (forex) hizmeti sunulması mevzuata aykırıdır. 'Yurt dışı lisanslıyız' ifadesi bir güvence değildir.",
                    },
                ],
            },
            {
                id: "yorumcular",
                h2: "YouTube yorumcularının adını kullanan sahte hesaplar",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Takip edilen ekonomi yorumcularının adı ve fotoğrafıyla açılmış sahte hesaplar, yorum bölümlerinde ya da doğrudan " +
                            "mesajla 'özel grup' daveti yapabilir. Gerçek kanal sahipleri genellikle bu tür davetlerin kendilerinden gelmediğini " +
                            "videolarında ve kanal açıklamalarında duyurur. Bir davetin gerçek olup olmadığını, yorumcunun doğrulanmış kanalı " +
                            "üzerinden kontrol edin.",
                    },
                    {
                        t: "p",
                        text:
                            "Analist Ne Diyor hiçbir yorumcu adına grup kurmaz, mesaj göndermez, ücret talep etmez ve kimseye yatırım önermez. " +
                            `Sitemizin ya da takip ettiğimiz yorumcuların adını kullanan şüpheli bir hesap görürseniz [bize bildirin](/iletisim). ` +
                            `Yorumları nasıl okumak gerektiğini [ekonomist yorumları rehberinde](/rehber/youtube-ekonomist-yorumlari-nasil-okunur) anlattık.`,
                    },
                ],
            },
            {
                id: "dolandirildiysaniz",
                h2: "Dolandırıldığınızı düşünüyorsanız",
                blocks: [
                    {
                        t: "ol",
                        items: [
                            "Para göndermeyi hemen durdurun; 'kaybı geri almak' için istenen ek ödemeler de dolandırıcılığın parçasıdır.",
                            "Bankanızı arayın; işlem çok yeniyse durdurma ya da itiraz imkânı olabilir.",
                            "Mesajları, dekontları, web adreslerini ve kullanıcı adlarını saklayın.",
                            "Savcılığa ya da kolluk kuvvetlerine şikâyette bulunun; izinsiz faaliyeti SPK'ya bildirin.",
                            "'Paranızı geri alırız' diyen kişi ve şirketlere karşı dikkatli olun; ikinci dolandırıcılık dalgası sık görülür.",
                        ],
                    },
                ],
            },
        ],
        faq: [
            {
                q: "Garanti kazanç vaat eden yatırım gerçek olabilir mi?",
                a: "Piyasaya bağlı yatırımlarda getiri garanti edilmez. Yüksek ve sabit getiri vaadi, yatırım dolandırıcılığının en yaygın işaretidir.",
            },
            {
                q: "Bir aracı kurumun yetkili olup olmadığını nasıl öğrenirim?",
                a: "SPK, izinli kuruluşların listesini internet sitesinde yayımlar. Kuruluşun tam unvanını ve internet adresini bu listeyle karşılaştırın.",
            },
            {
                q: "Ünlü ekonomistlerin reklamlarda önerdiği platformlar güvenilir mi?",
                a: "Bu tür reklamların önemli bir kısmı sahtedir ve kişinin izni olmadan, çoğu zaman yapay zeka ile üretilmiş görüntü ve sesle hazırlanır. Kişinin doğrulanmış kanalından kontrol edin.",
            },
            {
                q: "Para çekerken vergi ya da komisyon istenmesi normal mi?",
                a: "Önceden ödeme yapmadan kazancınızı çekemiyorsanız bu, sahte platformların tipik davranışıdır. Ek ödeme yapmayın ve bankanızla iletişime geçin.",
            },
        ],
        assets: ["KRIPTO", "BTC", "XU100"],
        related: ["youtube-ekonomist-yorumlari-nasil-okunur", "konsensus-nedir", "ethereum-nedir-bitcoin-farki"],
    },
];
