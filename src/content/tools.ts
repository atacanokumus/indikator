/**
 * HESAPLAMA ARAÇLARI — rehber yazılarındaki formüllerin çalışan hali.
 *
 * Neden var: AdSense siteyi "düşük değerli içerik" diye reddetti. Sayım sayfaları
 * başkalarının videolarından türetilen özetlerdir; rehber yazıları ise her finans
 * sitesinde bulunabilecek açıklamalardır. Araçlar, ziyaretçinin kendi rakamıyla
 * bir iş yapıp sonuç aldığı, siteye özgü ve yeniden gelinen sayfalardır.
 *
 * KURALLAR (rehberle aynı çizgi, bkz. src/content/guides.ts):
 *  - Araç SONUÇ hesaplar, karar önermez: "şu daha kârlı" gibi cümle kurulmaz.
 *  - Güncel fiyat, faiz ya da vergi oranı ÖN TANIMLI GELMEZ; değeri ziyaretçi girer.
 *    "Örnek değerler" düğmesindeki rakamlar uydurmadır ve ekranda öyle etiketlenir.
 *  - Hesap tarayıcıda yapılır; girilen rakam sunucuya gönderilmez, saklanmaz.
 */
import type { Block } from "@/content/guides";
import { assetSlug } from "@/lib/slug";

export type ToolKind = "gram-altin" | "mevduat" | "reel-getiri";

export interface Tool {
    slug: string;
    kind: ToolKind;
    /** Sayfanın H1'i. */
    title: string;
    /** <title> (≈60 karakter). */
    metaTitle: string;
    description: string;
    /** Liste kartındaki tek cümle. */
    summary: string;
    intro: string;
    published: string;
    updated: string;
    sections: { id: string; h2: string; blocks: Block[] }[];
    faq: { q: string; a: string }[];
    /** İlgili rehber yazıları (slug). */
    guides: string[];
    /** İlgili varlık sayfaları (varlık kodu). */
    assets: string[];
}

const A = (asset: string, label: string) => `[${label}](/varlik/${assetSlug(asset)})`;
const G = (slug: string, label: string) => `[${label}](/rehber/${slug})`;

export const TOOLS: Tool[] = [
    /* ------------------------------------------------------------------ */
    {
        slug: "gram-altin-hesaplama",
        kind: "gram-altin",
        title: "Gram altın hesaplama: ons ve dolar kurundan gram fiyatı",
        metaTitle: "Gram Altın Hesaplama: Ons ve Kurdan Gram Fiyatı",
        description:
            "Ons altın ve dolar/TL kurunu girin; has altının teorik gram fiyatını, 22, 18 ve 14 ayar karşılığını ve çeyrek, yarım, tam altının has değerini hesaplayın.",
        summary: "Ons fiyatı ve dolar kurundan gram altının teorik değerini, ayar ve ziynet karşılıklarıyla hesaplar.",
        intro:
            "Gram altın, dolarla fiyatlanan ons altın ile dolar/TL kurunun çarpımından türeyen bir rakamdır. Aşağıya iki değeri " +
            "yazdığınızda has altının teorik gram fiyatını, seçtiğiniz ayarın karşılığını ve çeyrek, yarım, tam altının içindeki " +
            "altının değerini görürsünüz.",
        published: "2026-11-11",
        updated: "2026-11-11",
        sections: [
            {
                id: "nasil-hesaplanir",
                h2: "Hesap nasıl yapılıyor?",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Altın dünyada **troy ons** birimiyle ve dolar cinsinden işlem görür. Bir troy ons 31,1035 gramdır. " +
                            "Lira cinsinden gram fiyatı bulmak için ons fiyatı kurla çarpılır ve bu katsayıya bölünür:",
                    },
                    {
                        t: "formula",
                        text: "Gram altın (TL) = Ons altın (USD) × Dolar/TL ÷ 31,1035",
                        caption: "Sonuç 24 ayar (has) altının teorik gram fiyatıdır.",
                    },
                    {
                        t: "p",
                        text:
                            "Ayarı düşük altında alaşımın yalnızca bir kısmı altındır. Araç, has fiyatı ayarın milyemiyle çarpar: " +
                            "22 ayar için 0,916, 18 ayar için 0,750, 14 ayar için 0,585.",
                    },
                    {
                        t: "p",
                        text:
                            `Formülün ayrıntısı ve adım adım örnek için ${G("gram-altin-nasil-hesaplanir", "gram altın nasıl hesaplanır")} ` +
                            `yazısına, ziynet altınların ağırlıkları için ${G("ceyrek-yarim-tam-altin-farki", "çeyrek, yarım ve tam altın farkı")} yazısına bakabilirsiniz.`,
                    },
                ],
            },
            {
                id: "neden-farkli",
                h2: "Kuyumcudaki fiyat neden farklı çıkar?",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Bu araç **teorik** değeri verir; vitrindeki fiyat hemen her zaman farklıdır. Farkın başlıca kaynakları şunlardır:",
                    },
                    {
                        t: "ul",
                        items: [
                            "**Alış-satış makası:** satıcının alış ve satış fiyatı arasındaki fark. Piyasa dalgalıyken açılır.",
                            "**İşçilik ve basım payı:** bilezik, takı ve ziynet altında ürünün yapım maliyeti fiyata eklenir.",
                            "**Yurt içi prim ya da iskonto:** arz ve talebe göre içerideki altın, formülün verdiği değerin üstünde ya da altında işlem görebilir.",
                            "**Zamanlama:** ons ve kur saniyeler içinde değişir; girdiğiniz değer ile işlem anındaki değer aynı olmayabilir.",
                        ],
                    },
                    {
                        t: "note",
                        text:
                            "Araç bir fiyat teklifi değildir. Alım ya da satım yapmadan önce işlem yapacağınız kurumun o anki alış ve satış fiyatını ayrı ayrı sorun.",
                    },
                ],
            },
            {
                id: "hareketi-okumak",
                h2: "Sonucu yorumlarken: ons mu değişti, kur mu?",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Aracı iki kez çalıştırıp yalnızca tek bir girdiyi değiştirmek, gram altındaki bir hareketin kaynağını ayırmanın en kolay yoludur. " +
                            "Kuru sabit bırakıp onsu değiştirirseniz küresel fiyatın etkisini, onsu sabit bırakıp kuru değiştirirseniz liranın etkisini görürsünüz.",
                    },
                    {
                        t: "p",
                        text:
                            `Yorumcuların bu iki bileşen için ne dediğini ${A("ALTIN", "altın")} ve ${A("USD/TRY", "dolar")} sayfalarındaki görüş sayımında ayrı ayrı izleyebilirsiniz.`,
                    },
                ],
            },
        ],
        faq: [
            {
                q: "Ons altın ve dolar kurunu nereden bulurum?",
                a: "Ons altın uluslararası piyasada dolar cinsinden, dolar/TL ise bankalararası piyasada fiyatlanır. İkisini de bankanızın ya da bir veri sağlayıcının ekranından alabilirsiniz. Sitedeki altın ve dolar sayfalarında son alınan fiyat, alındığı saatle birlikte gösterilir.",
            },
            {
                q: "Hesaplanan değer ile kuyumcu fiyatı arasındaki fark normal mi?",
                a: "Evet. Hesap, alış-satış makası, işçilik, basım payı ve yurt içi arz-talep farkı içermeyen teorik değeri verir. Fiziki altında bu kalemler fiyata eklenir.",
            },
            {
                q: "Çeyrek altının değeri neden gram altın × 1,75 değil?",
                a: "Çeyrek altın yaklaşık 1,75 gramdır ancak 22 ayardır; içindeki has altın yaklaşık 1,60 gramdır. Araç bu yüzden çeyreğin has altın karşılığını gösterir. Piyasadaki çeyrek fiyatına ayrıca basım payı ve makas eklenir.",
            },
            {
                q: "Girdiğim rakamlar kaydediliyor mu?",
                a: "Hayır. Hesap tarayıcınızda yapılır; girdiğiniz değerler sunucuya gönderilmez ve saklanmaz.",
            },
        ],
        guides: ["gram-altin-nasil-hesaplanir", "ceyrek-yarim-tam-altin-farki", "altin-fiyatini-ne-etkiler"],
        assets: ["ALTIN", "USD/TRY"],
    },

    /* ------------------------------------------------------------------ */
    {
        slug: "mevduat-faizi-hesaplama",
        kind: "mevduat",
        title: "Mevduat faizi hesaplama: brüt getiri, stopaj ve net getiri",
        metaTitle: "Mevduat Faizi Hesaplama: Stopaj ve Net Getiri",
        description:
            "Anapara, yıllık faiz oranı, vade ve stopaj oranını girin; vadeli mevduatın brüt getirisini, stopaj kesintisini, net getirisini ve yıllık bileşik karşılığını hesaplayın.",
        summary: "Vadeli mevduatın brüt ve net getirisini, stopaj kesintisini ve yıllık bileşik karşılığını hesaplar.",
        intro:
            "Bankanın ilan ettiği oran yıllık ve brüttür; elinize geçen tutar vadeye ve stopaja göre değişir. Aşağıya anaparayı, " +
            "yıllık faiz oranını, vade gününü ve stopaj oranını yazdığınızda vade sonunda hesabınıza geçecek net tutarı görürsünüz.",
        published: "2026-11-11",
        updated: "2026-11-11",
        sections: [
            {
                id: "nasil-hesaplanir",
                h2: "Hesap nasıl yapılıyor?",
                blocks: [
                    {
                        t: "p",
                        text: "Türkiye'de vadeli mevduat faizi basit faizle ve 365 gün üzerinden hesaplanır:",
                    },
                    {
                        t: "formula",
                        text: "Brüt getiri = Anapara × Yıllık faiz × Vade (gün) ÷ 365",
                        caption: "Net getiri = Brüt getiri × (1 − stopaj oranı)",
                    },
                    {
                        t: "p",
                        text:
                            "Stopaj, faiz gelirinden kaynakta kesilen vergidir; banka kesintiyi kendisi yapar ve hesabınıza net tutarı yatırır. " +
                            "Oran vadeye ve mevduatın türüne göre değişir ve zaman içinde yeniden belirlenir. Bu yüzden araçta oran ön tanımlı gelmez; " +
                            "güncel oranı bankanızdan ya da Resmî Gazete'de yayımlanan karardan kontrol edip kendiniz girersiniz.",
                    },
                    {
                        t: "p",
                        text: `Ayrıntı için ${G("mevduat-faizi-net-getiri-nasil-hesaplanir", "mevduat faizi ve net getiri")} yazısına bakabilirsiniz.`,
                    },
                ],
            },
            {
                id: "bilesik",
                h2: "Yıllık bileşik karşılık ne demek?",
                blocks: [
                    {
                        t: "p",
                        text:
                            "32 günlük bir vadenin getirisi ile 181 günlük bir vadenin getirisi doğrudan karşılaştırılamaz. Karşılaştırmak için " +
                            "kısa vadenin, aynı koşullarla yıl boyunca yenilendiği varsayılır; her dönemin net getirisi anaparaya eklenir:",
                    },
                    {
                        t: "formula",
                        text: "Yıllık bileşik net oran = (1 + Net getiri ÷ Anapara) ^ (365 ÷ Vade) − 1",
                    },
                    {
                        t: "note",
                        text:
                            "Bu bir varsayımdır, taahhüt değildir: faiz oranı ve stopaj her yenilemede değişebilir. Rakam yalnızca farklı vadeleri aynı ölçüye çevirmek için kullanılır.",
                    },
                ],
            },
            {
                id: "nelere-dikkat",
                h2: "Sonucu okurken nelere bakılır?",
                blocks: [
                    {
                        t: "ul",
                        items: [
                            "**Net getiri enflasyonun altında kalabilir.** Lira cinsinden kazanç, satın alma gücünün arttığı anlamına gelmez; bunu [reel getiri hesaplama](/araclar/reel-getiri-hesaplama) aracıyla görebilirsiniz.",
                            "**Vadeden önce çekim** çoğu sözleşmede faizin tamamının ya da büyük bölümünün kaybına yol açar.",
                            "**İlan edilen oran herkese aynı uygulanmayabilir;** tutar, vade ve müşteri ilişkisine göre farklı oranlar verilebilir.",
                            "**Mevduat sigortasının bir üst sınırı vardır;** güncel tutar TMSF tarafından ilan edilir.",
                        ],
                    },
                    {
                        t: "p",
                        text: `Yorumcuların faiz ve mevduat hakkındaki görüş sayımı için ${A("MEVDUAT", "mevduat sayfasına")} bakabilirsiniz.`,
                    },
                ],
            },
        ],
        faq: [
            {
                q: "Stopaj oranı kaç?",
                a: "Oran vadeye ve mevduat türüne göre farklıdır ve Cumhurbaşkanı kararıyla zaman zaman değiştirilir. Eskimiş bir rakam yanlış sonuç vereceği için araçta ön tanımlı oran yoktur; güncel oranı bankanızdan öğrenip girin.",
            },
            {
                q: "Faiz neden 365 güne bölünüyor?",
                a: "Türk lirası mevduatta yıllık oran 365 gün esasına göre günlük orana çevrilir. Yabancı para mevduatta bazı bankalar 360 gün esasını kullanabilir; sözleşmenizi kontrol edin.",
            },
            {
                q: "Hesaplanan net tutar bankanın verdiği tutarla birebir aynı mı olur?",
                a: "Çok yakın olur ancak kuruş düzeyinde fark çıkabilir. Bankalar yuvarlamayı ve vade sonu gününü (hafta sonu, resmî tatil) kendi kurallarına göre uygular.",
            },
            {
                q: "Girdiğim rakamlar kaydediliyor mu?",
                a: "Hayır. Hesap tarayıcınızda yapılır; girdiğiniz değerler sunucuya gönderilmez ve saklanmaz.",
            },
        ],
        guides: ["mevduat-faizi-net-getiri-nasil-hesaplanir", "faiz-karari-piyasalari-nasil-etkiler", "enflasyon-nedir-tufe-nasil-hesaplanir"],
        assets: ["MEVDUAT"],
    },

    /* ------------------------------------------------------------------ */
    {
        slug: "reel-getiri-hesaplama",
        kind: "reel-getiri",
        title: "Reel getiri hesaplama: enflasyondan arındırılmış kazanç",
        metaTitle: "Reel Getiri Hesaplama: Enflasyondan Arındırılmış Getiri",
        description:
            "Bir yatırımın nominal getirisini ve aynı dönemin enflasyonunu girin; enflasyondan arındırılmış reel getiriyi ve paranızın satın alma gücündeki değişimi hesaplayın.",
        summary: "Nominal getiriyi enflasyondan arındırır; satın alma gücünün arttığını mı azaldığını mı gösterir.",
        intro:
            "Bir yatırımın yüzde 40 kazandırması tek başına bir şey söylemez; aynı dönemde fiyatlar yüzde 50 arttıysa satın alma gücü " +
            "azalmıştır. Aşağıya nominal getiriyi ve aynı dönemin enflasyonunu yazdığınızda enflasyondan arındırılmış, yani reel getiriyi görürsünüz.",
        published: "2026-11-11",
        updated: "2026-11-11",
        sections: [
            {
                id: "nasil-hesaplanir",
                h2: "Hesap nasıl yapılıyor?",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Reel getiri, nominal getiriden enflasyonu **çıkararak** değil, **bölerek** bulunur. Fisher denklemi olarak bilinen ilişki şöyledir:",
                    },
                    {
                        t: "formula",
                        text: "Reel getiri = (1 + Nominal getiri) ÷ (1 + Enflasyon) − 1",
                        caption: "Oranlar ondalık yazılır: %40 = 0,40",
                    },
                    {
                        t: "p",
                        text:
                            "Yalnızca örnek olarak: nominal getiri %40, enflasyon %50 ise reel getiri 1,40 ÷ 1,50 − 1 ≈ −%6,7 olur. " +
                            "Basit çıkarma (40 − 50 = −10) bu durumda kaybı olduğundan büyük gösterir; oranlar yükseldikçe iki yöntem arasındaki fark açılır.",
                    },
                ],
            },
            {
                id: "ayni-donem",
                h2: "En sık yapılan hata: dönemleri karıştırmak",
                blocks: [
                    {
                        t: "p",
                        text: "Hesabın anlamlı olması için iki oranın **aynı dönemi** kapsaması gerekir:",
                    },
                    {
                        t: "ul",
                        items: [
                            "Üç aylık bir getiriyi yıllık enflasyonla karşılaştırmak yanlış sonuç verir; ya getiriyi yıllığa çevirin ya da üç aylık enflasyonu kullanın.",
                            "Getiri **net** olmalıdır: vergi, komisyon ve alış-satış makası düşüldükten sonra kalan oran.",
                            "Enflasyon olarak hangi göstergeyi kullandığınız sonucu değiştirir. Resmî TÜFE, sizin harcama sepetinizin enflasyonuyla aynı olmayabilir.",
                        ],
                    },
                    {
                        t: "p",
                        text:
                            `Enflasyonun nasıl ölçüldüğünü ${G("enflasyon-nedir-tufe-nasil-hesaplanir", "enflasyon ve TÜFE")} yazısında, ` +
                            `faiz ile enflasyon arasındaki ilişkiyi ${G("faiz-karari-piyasalari-nasil-etkiler", "faiz kararı piyasaları nasıl etkiler")} yazısında anlattık.`,
                    },
                ],
            },
            {
                id: "ne-soyler",
                h2: "Sonuç ne söyler, ne söylemez?",
                blocks: [
                    {
                        t: "p",
                        text:
                            "Pozitif reel getiri, dönem sonunda aynı parayla dönem başına göre daha fazla mal ve hizmet alınabildiğini gösterir; negatif reel getiri tersini. " +
                            "Araç geçmiş bir dönemi ölçer. Gelecekte hangi varlığın enflasyonun üzerinde getiri sağlayacağı hakkında bir şey söylemez.",
                    },
                    {
                        t: "note",
                        text:
                            "Ekonomi yorumlarında 'reel faiz' denildiğinde çoğu zaman beklenen enflasyona göre hesaplanan oran kastedilir; geçmiş enflasyonla hesaplanan oran farklı çıkabilir.",
                    },
                ],
            },
        ],
        faq: [
            {
                q: "Reel getiri neden nominal getiri eksi enflasyon değil?",
                a: "Çıkarma yalnızca düşük oranlarda yaklaşık doğru sonuç verir. Getiri ve enflasyon aynı anaparayı çarpan olarak etkilediği için doğru hesap bölmedir: (1 + nominal) ÷ (1 + enflasyon) − 1.",
            },
            {
                q: "Hangi enflasyon oranını kullanmalıyım?",
                a: "Getirinizi ölçtüğünüz dönemle aynı dönemi kapsayan oranı. Türkiye'de resmî gösterge TÜİK'in açıkladığı TÜFE'dir; kendi harcama sepetinize göre farklı bir oran da girebilirsiniz.",
            },
            {
                q: "Dolar ya da altın getirisini de bu araçla ölçebilir miyim?",
                a: "Evet. Lira cinsinden nominal getiriyi (dönem sonu değer ÷ dönem başı değer − 1) ve aynı dönemin enflasyonunu girmeniz yeterlidir.",
            },
            {
                q: "Girdiğim rakamlar kaydediliyor mu?",
                a: "Hayır. Hesap tarayıcınızda yapılır; girdiğiniz değerler sunucuya gönderilmez ve saklanmaz.",
            },
        ],
        guides: ["enflasyon-nedir-tufe-nasil-hesaplanir", "mevduat-faizi-net-getiri-nasil-hesaplanir", "tahvil-nedir-faiz-fiyat-iliskisi"],
        assets: [],
    },
];

export function getTool(slug: string): Tool | undefined {
    return TOOLS.find((t) => t.slug === slug);
}

/** Bir rehber yazısının altında gösterilecek araçlar. */
export function toolsForGuide(guideSlug: string): Tool[] {
    return TOOLS.filter((t) => t.guides.includes(guideSlug));
}
