export const ASSET_MAP: Record<string, string> = {
    // Gold
    "ALTIN": "ALTIN",
    "ONS ALTIN": "ALTIN",
    "GRAM ALTIN": "ALTIN",
    "XAUUSD": "ALTIN",
    "ALTIN/USD": "ALTIN",
    "GLD": "ALTIN",
    "HESAP ALTIN": "ALTIN",
    "HAS ALTIN": "ALTIN",
    "ÇEYREK": "ALTIN",

    // Silver
    "GÜMÜŞ": "GÜMÜŞ",
    "GUMUS": "GÜMÜŞ",
    "XAGUSD": "GÜMÜŞ",
    "ONS GÜMÜŞ": "GÜMÜŞ",
    "GRAM GÜMÜŞ": "GÜMÜŞ",
    "SILVER": "GÜMÜŞ",

    // Platinum / Palladium / Petrol
    "PLATİN": "PL=F",
    "PALADYUM": "PA=F",
    "PETROL": "CL=F",
    "BRENT": "BZ=F",
    "DOĞALGAZ": "NG=F",
    "BAKIR": "HG=F",

    // Bitcoin / Crypto
    "BTC": "BTC",
    "BITCOIN": "BTC",
    "BTCUSD": "BTC",
    "BTC/USD": "BTC",
    "BTC/USDT": "BTC",
    "ETH": "ETH",
    "ETHEREUM": "ETH",
    "SOL": "SOL",
    "SOLANA": "SOL",
    "XRP": "XRP",
    "DOGE": "DOGE",
    "AVAX": "AVAX",

    // Currency
    "DOLAR": "USD/TRY",
    "USD/TRY": "USD/TRY",
    "USDT": "USD/TRY",
    "USD": "USD/TRY",
    "EURO": "EUR/TRY",
    "EUR": "EUR/TRY",
    "EUR/TRY": "EUR/TRY",
    "EUR/USD": "EUR/USD",
    "EURUSD": "EUR/USD",
    "GBP/TRY": "GBP/TRY",
    "STERLIN": "GBP/TRY",

    // Stocks / BIST
    "BIST100": "XU100",
    "BORSAMIZ": "XU100",
    "BIST": "XU100",
    "BORSA": "XU100",
    "XU100": "XU100",
    "THYAO": "THYAO",
    "ASELS": "ASELS",
    "ASELSAN": "ASELS",
    "GARAN": "GARAN",
    "AKBNK": "AKBNK",
    "EREGL": "EREGL",
    "EREĞLİ": "EREGL",
    "SASA": "SASA",
    "HEKTS": "HEKTS",
    "HEKTAŞ": "HEKTS",
    "SISE": "SISE",
    "ŞİŞECAM": "SISE",
    "KCHOL": "KCHOL",
    "KOÇ HOLDİNG": "KCHOL",
    "SAHOL": "SAHOL",
    "SABANCI HOLDİNG": "SAHOL",
    "TUPRS": "TUPRS",
    "TÜPRAŞ": "TUPRS",
    "BIMAS": "BIMAS",
    "BİMAS": "BIMAS",
    "PEGASUS": "PGSUS",
    "PGSUS": "PGSUS",
    "FROTO": "FROTO",
    "FORD OTOSAN": "FROTO",
    "TOASO": "TOASO",
    "TOFAŞ": "TOASO",
    "ARCLK": "ARCLK",
    "ARÇELİK": "ARCLK",
    "TCELL": "TCELL",
    "TURKCELL": "TCELL",
    "YKBNK": "YKBNK",
    "YAPI KREDİ": "YKBNK",
    "ISCTR": "ISCTR",
    "İŞ BANKASI": "ISCTR",
    "HALKB": "HALKB",
    "HALK BANKASI": "HALKB",
    "VAKBN": "VAKBN",
    "VAKIFBANK": "VAKBN",
    "PETKM": "PETKM",
    "PETKİM": "PETKM",
    "KRDMD": "KRDMD",
    "KARDEMİR": "KRDMD",
    "ODAS": "ODAS",
    "ODAŞ": "ODAS",
    "TKFEN": "TKFEN",
    "TEKFEN": "TKFEN",
    "ENKAI": "ENKAI",
    "ENKA": "ENKAI",
};

export function normalizeAsset(name: string): string {
    if (!name) return "BİLİNMEYEN";
    let upper = name.toUpperCase().trim();

    // Clean up common suffix/prefix words
    upper = upper.replace(/ ANALİZİ/g, '').replace(/ ANALİZ/g, '').replace(/ YORUMU/g, '').replace(/ YORUM/g, '').trim();

    // Check Map first for direct matches
    if (ASSET_MAP[upper]) return ASSET_MAP[upper];

    // Partial Match for Gold & Silver
    if (upper.includes("ALTIN") || upper.includes("XAU") || upper.includes("GOLD")) return "ALTIN";
    if (upper.includes("GÜMÜŞ") || upper.includes("GUMUS") || upper.includes("XAG") || upper.includes("SILVER")) return "GÜMÜŞ";
    if (upper.includes("BİST") || upper.includes("BIST")) return "XU100";

    // Crypto Name to Symbol conversions
    if (upper.includes("BITCOIN")) return "BTC";
    if (upper.includes("ETHEREUM")) return "ETH";
    if (upper.includes("SOLANA")) return "SOL";

    // Clean up currency pairs only if they are at the end (X/TRY or XTRY)
    let cleaned = upper;
    if (upper.endsWith("/USDT")) cleaned = upper.slice(0, -5);
    else if (upper.endsWith("/USD")) cleaned = upper.slice(0, -4);
    else if (upper.endsWith("/TRY")) cleaned = upper.slice(0, -4);
    else if (upper.endsWith("USDT")) cleaned = upper.slice(0, -4);
    else if (upper.endsWith("USD")) cleaned = upper.slice(0, -3);
    else if (upper.endsWith("TRY")) cleaned = upper.slice(0, -3);

    if (cleaned !== upper && cleaned.length > 0 && cleaned !== "EUR" && cleaned !== "USD") {
        if (ASSET_MAP[cleaned]) return ASSET_MAP[cleaned];
        return cleaned;
    }

    return upper;
}
