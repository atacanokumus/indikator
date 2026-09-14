/**
 * Varlık adı normalleştirme.
 *
 * Yapay zeka varlık adlarını serbest metin olarak döndürüyor: veritabanında
 * "Dolar/TL", "USD/TRY", "Dolar (USD)", "Döviz Kurları (USD/TL)" gibi 420
 * farklı yazım tespit edildi. Bunlar tek varlığa indirgenmezse konsensüs
 * bölünür ve aynı varlık ana sayfada birden çok kez görünür.
 *
 * Yöntem: önce Türkçe duyarlı sadeleştirme (küçük harf + aksan giderme +
 * noktalama temizliği), sonra tam eşleşme, sonra sırayla anahtar kelime.
 * Sıra önemlidir — en spesifik kural en üstte olmalı.
 */

/** "Ons Altın (XAU/USD)" -> "ons altin xau/usd" */
function fold(raw: string): string {
    const tr: Record<string, string> = { "ç": "c", "ğ": "g", "ı": "i", "ö": "o", "ş": "s", "ü": "u", "â": "a", "î": "i", "û": "u" };
    return raw
        .toLocaleLowerCase("tr")
        .replace(/[çğıöşüâîû]/g, (m) => tr[m] ?? m)
        .replace(/[^a-z0-9/&+.\- ]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

/** Fiyatı olmayan ama kullanıcı için anlamlı varlık sınıfları. */
export const CLASS_ASSETS = new Set([
    "KRIPTO", "BANKA-HISSE", "ABD-HISSE", "AVRUPA-HISSE", "KONUT",
    "MEVDUAT", "TAHVIL", "EUROBOND", "TRY",
]);

/** Hiçbir şey ifade etmeyen, listede gürültü yaratan ifadeler. */
const NOISE = [
    // Türkçe
    "kuresel piyasalar", "riskli varliklar", "yabanci piyasalar", "borsalar",
    "hisse senetleri genel", "turkiye ekonomi politikasi", "halka arzlar",
    "piyasalar", "genel piyasa", "tum piyasalar", "ekonomi", "enflasyon",
    "faiz", "faiz orani", "merkez bankasi", "politika faizi",
    // İngilizce — yabancı kanallar bunları varlık sanıp döndürebiliyor
    "the market", "markets", "stock market", "the economy", "economy",
    "inflation", "recession", "interest rates", "rates", "the fed", "fed",
    "federal reserve", "cpi", "jobs report", "unemployment", "gdp",
    "monetary policy", "fiscal policy", "risk assets", "global markets",
    "equities", "stocks", "the dollar system", "liquidity",
];

/**
 * Sırayla denenen anahtar kelimeler. İlk eşleşen kazanır.
 * En spesifik ifadeler en üstte olmalı: "brent" -> BZ=F, "petrol" -> CL=F.
 */
const RULES: [RegExp, string][] = [
    // --- gürültü (en başta elenir) ---
    [/^(kuresel piyasalar|riskli varliklar|yabanci piyasalar|borsalar|piyasalar)$/, "__NOISE__"],
    [/^(the )?(market|markets|economy|stock market|equities|stocks)$/, "__NOISE__"],
    [/^(inflation|recession|interest rates?|the fed|federal reserve|cpi|gdp|liquidity)$/, "__NOISE__"],
    [/\brasyo(su)?\b|\boran(i)?\b(?!.*tahvil)/, "__NOISE__"],

    // --- kıymetli madenler ---
    [/\balti?n\b|\bxau\b|\bgold\b|darphane|bullion/, "ALTIN"],
    [/\bgumus\b|\bxag\b|\bsilver\b/, "GÜMÜŞ"],
    [/\bplatin\b|\bxpt\b/, "PL=F"],
    [/\bpaladyum\b|\bxpd\b/, "PA=F"],

    // --- enerji ve emtia (brent, petrolden ÖNCE) ---
    [/\bbrent\b/, "BZ=F"],
    [/\bpetrol\b|\bcrude\b|\boil\b|\bwti\b|\buso\b/, "CL=F"],
    [/\bdogal ?gaz\b|\bnatural ?gas\b|\bhenry hub\b/, "NG=F"],
    [/\bbakir\b|\bcopper\b/, "HG=F"],
    [/\buranyum\b|\buranium\b/, "URA"],
    [/\bbugday\b|\bwheat\b/, "ZW=F"],
    [/\bsoya\b/, "ZS=F"],
    [/\bmisir\b|\bcorn\b/, "ZC=F"],
    [/\bseker\b|\bsugar\b/, "SB=F"],
    [/\bkakao\b|\bcocoa\b/, "CC=F"],
    [/\bpirinc\b|\brice\b/, "ZR=F"],
    [/\bkahve\b|\bcoffee\b/, "KC=F"],

    // --- kripto ---
    [/\bbitcoin\b|\bbtc\b/, "BTC"],
    [/\bmicrostrategy\b|\bmstr\b/, "MSTR"],
    [/\bethereum\b|\beth\b/, "ETH"],
    [/\bsolana\b|\bsol\b/, "SOL"],
    [/\bripple\b|\bxrp\b/, "XRP"],
    [/\bavalanche\b|\bavax\b/, "AVAX"],
    [/\bdogecoin\b|\bdoge\b/, "DOGE"],
    [/\bkripto\b|\baltcoin\b|\bcrypto\b|digital assets/, "KRIPTO"],

    // --- döviz (çiftler önce, tek para birimi sonra) ---
    [/eur ?[/\-] ?usd|euro ?[/\-] ?dolar|eur ?usd parite|parite/, "EUR/USD"],
    [/usd ?[/\-] ?jpy|dolar ?[/\-] ?yen|japon yeni|\bjpy\b/, "USD/JPY"],
    [/eur ?[/\-] ?tl|eur ?[/\-] ?try|euro ?[/\-] ?tl|\beuro\b|\beur\b/, "EUR/TRY"],
    [/gbp ?[/\-] ?tl|gbp ?[/\-] ?try|sterlin|\bgbp\b/, "GBP/TRY"],
    [/dolar endeksi|\bdxy\b|dollar index|us dollar index/, "DXY"],
    [/\bdolar\b|\busd\b|\bdoviz\b|amerikan dolari|abd dolari/, "USD/TRY"],
    [/turk lirasi|\btry\b(?! ?[/\-])|\btl\b(?! ?[/\-])/, "TRY"],

    // --- endeksler ---
    [/borsa istanbul|\bbist\b|\bxu ?100\b|^borsa$|turkiye hisse|turk hisse/, "XU100"],
    [/nasdaq|\bixic\b|\bqqq\b/, "NASDAQ"],
    [/s&p ?500|\bspx\b|\bgspc\b|\bspy\b|s and p 500/, "SP500"],
    [/dow jones|\bdjia\b|\bdia\b/, "DJI"],
    [/nikkei|japon hisse/, "NIKKEI"],
    [/\bdax\b|avrupa hisse|alman hisse/, "AVRUPA-HISSE"],

    // --- ABD hisseleri ---
    [/nvidia|\bnvda\b/, "NVDA"],
    [/\btesla\b|\btsla\b/, "TSLA"],
    [/\bapple\b|\baapl\b/, "AAPL"],
    [/\bamazon\b|\bamzn\b/, "AMZN"],
    [/\bgoogle\b|alphabet|\bgoogl\b/, "GOOGL"],
    [/microsoft|\bmsft\b/, "MSFT"],
    [/\bmeta\b|facebook/, "META"],
    [/\bpfizer\b|\bpfe\b/, "PFE"],
    [/novo nordisk|\bnvo\b/, "NVO"],
    [/occidental|\boxy\b/, "OXY"],
    [/lockheed|\blmt\b/, "LMT"],
    [/molina|\bmoh\b/, "MOH"],
    [/\bnike\b|\bnke\b/, "NKE"],
    [/alibaba|\bbaba\b/, "BABA"],
    [/\bspacex\b/, "SPACEX"],
    [/\bpsq\b/, "PSQ"],
    [/abd hisse|amerikan hisse|abd borsa|amerikan borsa|teknoloji.*hisse|yapay zeka.*hisse|us stocks|magnificent 7|mag 7|big tech|\bai stocks\b/, "ABD-HISSE"],

    // --- BIST hisseleri ---
    [/\bthyao\b|turk hava yollari|\bthy\b/, "THYAO"],
    [/\basels\b|aselsan/, "ASELS"],
    [/\bgaran\b|garanti bankasi/, "GARAN"],
    [/\bakbnk\b|\bakbank\b/, "AKBNK"],
    [/\beregl\b|eregli/, "EREGL"],
    [/\bsasa\b/, "SASA"],
    [/\bhekts\b|hektas/, "HEKTS"],
    [/\bsise\b|sisecam/, "SISE"],
    [/\bkchol\b|koc holding/, "KCHOL"],
    [/\bsahol\b|sabanci holding/, "SAHOL"],
    [/\btuprs\b|tupras/, "TUPRS"],
    [/\bbimas\b|\bbim\b/, "BIMAS"],
    [/\bpgsus\b|pegasus/, "PGSUS"],
    [/\bfroto\b|ford otosan/, "FROTO"],
    [/\btoaso\b|tofas/, "TOASO"],
    [/\barclk\b|arcelik/, "ARCLK"],
    [/\btcell\b|turkcell/, "TCELL"],
    [/\bykbnk\b|yapi kredi/, "YKBNK"],
    [/\bisctr\b|is bankasi/, "ISCTR"],
    [/\bhalkb\b|halk bankasi/, "HALKB"],
    [/\bvakbn\b|vakifbank/, "VAKBN"],
    [/\bpetkm\b|petkim/, "PETKM"],
    [/\bkrdmd\b|kardemir/, "KRDMD"],
    [/\bodas\b/, "ODAS"],
    [/\btkfen\b|tekfen/, "TKFEN"],
    [/\benkai\b|\benka\b/, "ENKAI"],
    [/\bulker\b/, "ULKER"],
    [/\btursg\b|turkiye sigorta/, "TURSG"],
    [/banka(cilik)? (hisse|endeks|sektor)|bist banka|bank stocks|\bkre\b/, "BANKA-HISSE"],

    // --- sabit getirili ve diğer ---
    [/eurobond/, "EUROBOND"],
    [/10 ?(yil|year).*(tahvil|treasury|bond|yield)|us ?10y|\btnx\b|treasury yield/, "US10Y"],
    [/\bvix\b|volatility index|korku endeksi/, "VIX"],
    [/tahvil|bono|\bbonds?\b|treasur(y|ies)|fixed income/, "TAHVIL"],
    [/mevduat|para (piyasasi )?fon|likit fon|money market|savings/, "MEVDUAT"],
    [/konut|gayrimenkul|emlak|real estate|housing|\breits?\b/, "KONUT"],
];

/** Dört-beş harfli BIST kodu mu? (FED, FAİZ gibi kelimeleri elemek için) */
const BIST_CODE = /^[A-Z]{4,5}$/;

export function normalizeAsset(raw: string): string {
    if (!raw) return "";
    const folded = fold(raw);
    if (!folded) return "";
    if (NOISE.includes(folded)) return "";

    for (const [pattern, canonical] of RULES) {
        if (pattern.test(folded)) {
            return canonical === "__NOISE__" ? "" : canonical;
        }
    }

    // Kural yoksa: büyük harfe çevir. 4-5 harfliyse BIST kodu kabul edilir.
    const upper = raw.toLocaleUpperCase("tr").replace(/\s+/g, " ").trim();
    if (BIST_CODE.test(upper)) return upper;
    return upper;
}

/** Fiyatı olamayacak, sınıf/kategori niteliğindeki varlıklar. */
export function isClassAsset(canonical: string): boolean {
    return CLASS_ASSETS.has(canonical);
}
