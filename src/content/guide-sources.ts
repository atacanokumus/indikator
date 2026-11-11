/**
 * REHBER KAYNAKÇASI — her yazının dayandığı birincil (resmî / kurumsal) kaynaklar.
 *
 * Neden var: Para konusu arama motorları için "YMYL" sayılır; iddiasını hiçbir
 * kaynağa bağlamayan bir açıklama yazısı, ne kadar doğru olursa olsun güven
 * vermez. Okuyucu da tanımı ve güncel rakamı resmî kurumdan teyit edebilmeli;
 * yazılar bilerek güncel rakam vermediği için bu bağlantılar yazının tamamlayıcısıdır.
 *
 * KURALLAR:
 *  - Yalnızca birincil kaynak: veriyi üreten ya da kuralı koyan kurum. Haber sitesi,
 *    aracı kurum blogu, başka bir "nedir" yazısı buraya girmez.
 *  - Adres kurumun ANA sayfası ya da yıllardır değişmeyen bölüm adresidir. Derin
 *    bağlantılar kurum sitesi yenilendiğinde kırılır; kırık kaynak, kaynak olmamasından kötüdür.
 *  - `not` alanı o kaynakta NEYİN bulunacağını söyler; kaynağın ne dediğini aktarmaz.
 */
export interface GuideSource {
    name: string;
    url: string;
    note: string;
}

const S = {
    tcmb: (note: string): GuideSource => ({ name: "Türkiye Cumhuriyet Merkez Bankası (TCMB)", url: "https://www.tcmb.gov.tr", note }),
    evds: (note: string): GuideSource => ({ name: "TCMB Elektronik Veri Dağıtım Sistemi (EVDS)", url: "https://evds2.tcmb.gov.tr", note }),
    tuik: (note: string): GuideSource => ({ name: "Türkiye İstatistik Kurumu (TÜİK)", url: "https://www.tuik.gov.tr", note }),
    bist: (note: string): GuideSource => ({ name: "Borsa İstanbul", url: "https://www.borsaistanbul.com", note }),
    spk: (note: string): GuideSource => ({ name: "Sermaye Piyasası Kurulu (SPK)", url: "https://www.spk.gov.tr", note }),
    kap: (note: string): GuideSource => ({ name: "Kamuyu Aydınlatma Platformu (KAP)", url: "https://www.kap.org.tr", note }),
    hmb: (note: string): GuideSource => ({ name: "T.C. Hazine ve Maliye Bakanlığı", url: "https://www.hmb.gov.tr", note }),
    tmsf: (note: string): GuideSource => ({ name: "Tasarruf Mevduatı Sigorta Fonu (TMSF)", url: "https://www.tmsf.org.tr", note }),
    bddk: (note: string): GuideSource => ({ name: "Bankacılık Düzenleme ve Denetleme Kurumu (BDDK)", url: "https://www.bddk.org.tr", note }),
    gib: (note: string): GuideSource => ({ name: "Gelir İdaresi Başkanlığı", url: "https://www.gib.gov.tr", note }),
    darphane: (note: string): GuideSource => ({ name: "Darphane ve Damga Matbaası Genel Müdürlüğü", url: "https://www.darphane.gov.tr", note }),
    fed: (note: string): GuideSource => ({ name: "ABD Merkez Bankası (Federal Reserve)", url: "https://www.federalreserve.gov", note }),
    treasury: (note: string): GuideSource => ({ name: "ABD Hazine Bakanlığı", url: "https://home.treasury.gov", note }),
    lbma: (note: string): GuideSource => ({ name: "London Bullion Market Association (LBMA)", url: "https://www.lbma.org.uk", note }),
    wgc: (note: string): GuideSource => ({ name: "Dünya Altın Konseyi (World Gold Council)", url: "https://www.gold.org", note }),
    eia: (note: string): GuideSource => ({ name: "ABD Enerji Enformasyon İdaresi (EIA)", url: "https://www.eia.gov", note }),
    opec: (note: string): GuideSource => ({ name: "Petrol İhraç Eden Ülkeler Örgütü (OPEC)", url: "https://www.opec.org", note }),
    ice: (note: string): GuideSource => ({ name: "Intercontinental Exchange (ICE)", url: "https://www.ice.com", note }),
    spglobal: (note: string): GuideSource => ({ name: "S&P Dow Jones Indices", url: "https://www.spglobal.com/spdji", note }),
    nasdaq: (note: string): GuideSource => ({ name: "Nasdaq", url: "https://www.nasdaq.com", note }),
    bis: (note: string): GuideSource => ({ name: "Uluslararası Ödemeler Bankası (BIS)", url: "https://www.bis.org", note }),
    imf: (note: string): GuideSource => ({ name: "Uluslararası Para Fonu (IMF)", url: "https://www.imf.org", note }),
    bitcoin: (note: string): GuideSource => ({ name: "Bitcoin: A Peer-to-Peer Electronic Cash System (S. Nakamoto, 2008)", url: "https://bitcoin.org/bitcoin.pdf", note }),
    ethereum: (note: string): GuideSource => ({ name: "Ethereum.org", url: "https://ethereum.org", note }),
    youtube: (note: string): GuideSource => ({ name: "YouTube Yardım Merkezi", url: "https://support.google.com/youtube", note }),
};

export const GUIDE_SOURCES: Record<string, GuideSource[]> = {
    "gram-altin-nasil-hesaplanir": [
        S.lbma("Ons altının uluslararası referans fiyatı ve troy ons standardı."),
        S.evds("Dolar/TL gösterge kuru ve geçmiş kur serileri."),
        S.bist("Kıymetli Madenler Piyasası: yurt içinde altın işlemlerinin yapıldığı piyasa ve standartları."),
    ],
    "altin-fiyatini-ne-etkiler": [
        S.wgc("Altın arz ve talebi, merkez bankası alımları üzerine üç aylık raporlar."),
        S.fed("ABD para politikası kararları ve faiz açıklamaları."),
        S.lbma("Ons altın referans fiyatı."),
        S.tcmb("TCMB rezervleri ve altın varlıklarına ilişkin veriler."),
    ],
    "ceyrek-yarim-tam-altin-farki": [
        S.darphane("Ziynet ve Cumhuriyet altınlarının resmî ağırlık, ayar ve basım bilgileri."),
        S.bist("Kıymetli Madenler Piyasası standartları."),
    ],
    "altin-gumus-orani-nedir": [
        S.lbma("Altın ve gümüş referans fiyatları."),
        S.wgc("Altın talebinin bileşenlerine ilişkin veriler."),
    ],
    "dolar-kuru-neye-gore-belirlenir": [
        S.tcmb("Kur rejimi, gösterge niteliğindeki kurlar ve para politikası metinleri."),
        S.evds("Kur, rezerv ve ödemeler dengesi serileri."),
        S.bis("Küresel döviz piyasası işlem hacmi araştırması (Triennial Survey)."),
    ],
    "dolar-endeksi-dxy-nedir": [
        S.ice("Dolar endeksinin (U.S. Dollar Index) sepeti, ağırlıkları ve hesaplama yöntemi."),
        S.fed("Fed'in ticaret ağırlıklı dolar endeksleri."),
    ],
    "cari-acik-nedir-kuru-nasil-etkiler": [
        S.tcmb("Aylık ödemeler dengesi istatistikleri ve yöntem açıklamaları."),
        S.tuik("Dış ticaret istatistikleri."),
        S.imf("Ödemeler dengesi el kitabı (BPM6): uluslararası tanım ve sınıflandırma."),
    ],
    "cds-nedir-ulke-risk-primi": [
        S.bis("Kredi türevleri piyasasına ilişkin istatistikler."),
        S.hmb("Kamu borç yönetimi raporları ve borçlanma verileri."),
        S.imf("Ülke raporları ve küresel finansal istikrar değerlendirmeleri."),
    ],
    "bist-100-nedir": [
        S.bist("Pay endeksleri temel kuralları, endeks kapsamı ve dönemsel değişiklik duyuruları."),
        S.kap("Şirketlerin finansal tabloları ve özel durum açıklamaları."),
        S.spk("Sermaye piyasası mevzuatı."),
    ],
    "fk-orani-nedir-hisse-degerleme": [
        S.kap("Şirketlerin dönemsel finansal tabloları (kâr, özkaynak, borç kalemleri)."),
        S.bist("Şirket ve endeks verileri."),
        S.spk("Finansal raporlama ve kamuyu aydınlatma düzenlemeleri."),
    ],
    "sp-500-nasdaq-dow-jones-farki": [
        S.spglobal("S&P 500 ve Dow Jones endekslerinin yöntem belgeleri."),
        S.nasdaq("Nasdaq Composite ve Nasdaq-100 endeks yöntemleri."),
    ],
    "bitcoin-nedir-halving-nedir": [
        S.bitcoin("Bitcoin'in özgün teknik makalesi: arz kuralı ve blok ödülü."),
        S.spk("Türkiye'de kripto varlık hizmet sağlayıcılarına ilişkin düzenlemeler."),
    ],
    "ethereum-nedir-bitcoin-farki": [
        S.ethereum("Ethereum'un resmî belgeleri: akıllı sözleşmeler, hisse ispatı (proof of stake), ücret mekanizması."),
        S.bitcoin("Karşılaştırma için Bitcoin'in özgün teknik makalesi."),
        S.spk("Türkiye'de kripto varlık hizmet sağlayıcılarına ilişkin düzenlemeler."),
    ],
    "faiz-karari-piyasalari-nasil-etkiler": [
        S.tcmb("Para Politikası Kurulu toplantı takvimi, kararları ve toplantı özetleri."),
        S.fed("FOMC toplantı takvimi, karar metinleri ve projeksiyonlar."),
    ],
    "enflasyon-nedir-tufe-nasil-hesaplanir": [
        S.tuik("Aylık Tüketici Fiyat Endeksi bülteni, sepet ağırlıkları ve yöntem açıklamaları."),
        S.tcmb("Enflasyon Raporu ve aylık fiyat gelişmeleri değerlendirmeleri."),
    ],
    "mevduat-faizi-net-getiri-nasil-hesaplanir": [
        S.gib("Mevduat faizinden yapılan gelir vergisi kesintisine (stopaj) ilişkin güncel düzenlemeler."),
        S.tmsf("Mevduat sigortasının kapsamı ve güncel üst sınırı."),
        S.evds("Bankalarca mevduata uygulanan ağırlıklı ortalama faiz oranları."),
        S.bddk("Bankacılık mevzuatı ve tüketici bilgilendirmeleri."),
    ],
    "tahvil-nedir-faiz-fiyat-iliskisi": [
        S.hmb("Devlet iç borçlanma senetleri, ihale takvimi ve sonuçları."),
        S.bist("Borçlanma Araçları Piyasası."),
        S.tcmb("Piyasa faizleri ve verim serileri."),
    ],
    "abd-10-yillik-tahvil-faizi-neden-onemli": [
        S.treasury("Günlük Hazine verim eğrisi oranları."),
        S.fed("Para politikası kararları ve bilanço verileri."),
    ],
    "petrol-fiyatlari-neden-degisir-brent-wti": [
        S.eia("Haftalık petrol stokları, üretim verileri ve Brent/WTI açıklamaları."),
        S.opec("Aylık petrol piyasası raporu ve üretim kararları."),
        S.ice("Brent vadeli işlem sözleşmesinin özellikleri."),
    ],
    "yatirim-dolandiriciligi-nasil-anlasilir": [
        S.spk("Yetkili kuruluşlar listesi, izinsiz faaliyet duyuruları ve şikâyet başvurusu."),
        S.bddk("Faaliyet izni bulunan banka ve finansal kuruluşların listesi."),
        S.tmsf("Mevduat sigortasının kapsamı."),
    ],
    "youtube-ekonomist-yorumlari-nasil-okunur": [
        S.spk("Yatırım danışmanlığı yetkisi bulunan kuruluşlar ve yatırım tavsiyesine ilişkin kurallar."),
        S.youtube("Ücretli tanıtım ve sponsorluk içeren videoların beyan kuralları."),
    ],
    "konsensus-nedir": [
        S.spk("Yatırım tavsiyesi ve genel yatırım tavsiyesi tanımlarını içeren düzenlemeler."),
    ],
};

export function sourcesForGuide(slug: string): GuideSource[] {
    return GUIDE_SOURCES[slug] ?? [];
}
