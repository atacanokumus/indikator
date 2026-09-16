import type { Recommendation, Tally } from "./types";

/**
 * DİL TERCİHİ — HUKUKİ
 * Site bir emir kipi kullanmaz. "AL" değil "ALIM yönünde"; "SAT" değil
 * "SATIŞ yönlü". Etiketler, analistin konuşmasının YÖNÜNÜ tarif eder;
 * okuyucuya verilmiş bir talimat değildir.
 */
export const DIRECTION: Record<Recommendation, string> = {
    AL: "ALIM",
    SAT: "SATIŞ",
    TUT: "BEKLE",
    "GÖZLEMLE": "GÖZLEMLE",
};

/** Sayım cümlesinin sonuna gelen ek: "4'ü ALIM yönünde konuşuyor" */
export const DIRECTION_SUFFIX: Record<Recommendation, string> = {
    AL: "yönünde",
    SAT: "yönlü",
    TUT: "diyor",
    "GÖZLEMLE": "diyor",
};

/** Tek analistlik kartlarda kullanılan kısa ifade */
export const DIRECTION_PHRASE: Record<Recommendation, string> = {
    AL: "alım yönünde konuştu",
    SAT: "satış yönlü konuştu",
    TUT: "beklemeyi tercih etti",
    "GÖZLEMLE": "net yön vermedi, izliyor",
};

/** Sayımı okunur bir cümleye çevirir. Sıralama: en çok konuşulan yön başta. */
export function tallyParts(tally: Tally): { rec: Recommendation; count: number }[] {
    return (["AL", "SAT", "TUT", "GÖZLEMLE"] as Recommendation[])
        .map((rec) => ({ rec, count: tally[rec] ?? 0 }))
        .filter((x) => x.count > 0)
        .sort((a, b) => b.count - a.count);
}

export function signalClass(rec: Recommendation) {
    return `sig sig-${rec}`;
}

/** Yön kelimesinin rengini veren sınıf (büyük puntolu gösterim için) */
export function directionClass(rec: Recommendation) {
    return `dir dir-${rec}`;
}

/** Öne çıkarılacak varlıklar — ziyaretçilerin en çok aradıkları. */
export const SPOTLIGHT_ASSETS = ["ALTIN", "USD/TRY", "BTC", "XU100"];

export const ASSET_LABEL: Record<string, string> = {
    "USD/TRY": "Dolar",
    "EUR/TRY": "Euro",
    "GBP/TRY": "Sterlin",
    "EUR/USD": "Euro / Dolar",
    "USD/JPY": "Dolar / Yen",
    TRY: "Türk Lirası",
    DXY: "Dolar Endeksi",

    ALTIN: "Altın",
    "GÜMÜŞ": "Gümüş",
    "PL=F": "Platin",
    "PA=F": "Paladyum",
    "HG=F": "Bakır",

    "CL=F": "Petrol",
    "BZ=F": "Brent Petrol",
    "NG=F": "Doğalgaz",
    URA: "Uranyum",
    "ZW=F": "Buğday",
    "ZS=F": "Soya",
    "ZC=F": "Mısır",
    "SB=F": "Şeker",
    "CC=F": "Kakao",
    "ZR=F": "Pirinç",
    "KC=F": "Kahve",

    BTC: "Bitcoin",
    ETH: "Ethereum",
    SOL: "Solana",
    XRP: "XRP",
    AVAX: "Avalanche",
    DOGE: "Dogecoin",
    KRIPTO: "Kripto paralar",

    XU100: "BIST 100",
    NASDAQ: "Nasdaq",
    SP500: "S&P 500",
    DJI: "Dow Jones",
    US10Y: "ABD 10 Yıllık Tahvili",
    VIX: "VIX (korku endeksi)",
    MSTR: "MicroStrategy",
    NIKKEI: "Nikkei",

    NVDA: "Nvidia",
    TSLA: "Tesla",
    AAPL: "Apple",
    AMZN: "Amazon",
    GOOGL: "Alphabet",
    MSFT: "Microsoft",
    META: "Meta",
    PFE: "Pfizer",
    NVO: "Novo Nordisk",
    OXY: "Occidental Petroleum",
    LMT: "Lockheed Martin",
    MOH: "Molina Healthcare",
    NKE: "Nike",
    BABA: "Alibaba",
    SPACEX: "SpaceX",
    PSQ: "Nasdaq Short ETF",

    THYAO: "Türk Hava Yolları",
    ASELS: "Aselsan",
    GARAN: "Garanti BBVA",
    AKBNK: "Akbank",
    EREGL: "Ereğli Demir Çelik",
    SISE: "Şişecam",
    KCHOL: "Koç Holding",
    SAHOL: "Sabancı Holding",
    TUPRS: "Tüpraş",
    BIMAS: "BİM",
    PGSUS: "Pegasus",
    FROTO: "Ford Otosan",
    TOASO: "Tofaş",
    ARCLK: "Arçelik",
    TCELL: "Turkcell",
    YKBNK: "Yapı Kredi",
    ISCTR: "İş Bankası",
    HALKB: "Halkbank",
    VAKBN: "VakıfBank",
    PETKM: "Petkim",
    KRDMD: "Kardemir",
    TKFEN: "Tekfen",
    ENKAI: "Enka İnşaat",
    ULKER: "Ülker",
    TURSG: "Türkiye Sigorta",

    "BANKA-HISSE": "Banka hisseleri",
    "ABD-HISSE": "ABD hisseleri",
    "AVRUPA-HISSE": "Avrupa hisseleri",
    KONUT: "Konut / gayrimenkul",
    MEVDUAT: "Mevduat ve para fonları",
    TAHVIL: "Tahvil",
    EUROBOND: "Eurobond",
};

export function assetLabel(asset: string) {
    return ASSET_LABEL[asset] ?? asset;
}

export function formatPrice(price?: number | null, currency?: string | null) {
    if (price == null || !Number.isFinite(price)) return null;
    // Yahoo bazı vadeli işlemleri sent cinsinden döndürür (USX = 1/100 USD)
    if (currency === "USX") { price = price / 100; currency = "USD"; }
    if (currency === "GBX") { price = price / 100; currency = "GBP"; }
    const digits = price >= 1000 ? 0 : price >= 10 ? 2 : 4;
    const symbol = currency === "TRY" ? "₺" : currency === "USD" ? "$" : currency === "EUR" ? "€" : "";
    const value = price.toLocaleString("tr-TR", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    });
    return symbol ? `${symbol}${value}` : `${value} ${currency ?? ""}`.trim();
}

export function relativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    if (!Number.isFinite(diff) || diff < 0) return "az önce";
    const min = Math.floor(diff / 60000);
    if (min < 1) return "az önce";
    if (min < 60) return `${min} dakika önce`;
    const hour = Math.floor(min / 60);
    if (hour < 24) return `${hour} saat önce`;
    const day = Math.floor(hour / 24);
    if (day === 1) return "dün";
    if (day < 30) return `${day} gün önce`;
    const month = Math.floor(day / 30);
    return `${month} ay önce`;
}

export function formatDateTr(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    // DIKKAT: timeZone acikca verilmeli. Verilmezse sunucu UTC'ye, tarayici
    // Europe/Istanbul'a gore bicimlendirir; gece yarisina yakin tarihlerde iki
    // taraf farkli gun yazar ve React hidrasyonu "#418" ile patlar. Ustelik
    // Turkiye'deki okuyucu icin dogru olan da Istanbul saati.
    return d.toLocaleDateString("tr-TR", {
        day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Istanbul",
    });
}


/**
 * Turkce sayi eki: 4'u, 11'i, 13'u, 20'si, 40'i...
 *
 * Ek son RAKAMA degil, sayinin OKUNUSUNUN son kelimesine gore degisir.
 * Onceki surum yalnizca son rakama bakiyordu; 13 icin "13'i" (dogrusu 13'u),
 * 20 icin "20'i" (dogrusu 20'si) uretiyordu. Sayim cumleleri sitenin en cok
 * okunan metni oldugu icin bu hata her yerde gorunuyordu.
 */
const EK_BIRLER: Record<number, string> = {
    1: "'i", 2: "'si", 3: "'\u00fc", 4: "'\u00fc", 5: "'i",
    6: "'s\u0131", 7: "'si", 8: "'i", 9: "'u",
};
const EK_ONLAR: Record<number, string> = {
    10: "'u", 20: "'si", 30: "'u", 40: "'\u0131", 50: "'si",
    60: "'\u0131", 70: "'i", 80: "'i", 90: "'\u0131",
};

export function sayiEki(n: number): string {
    if (!Number.isFinite(n) || n <= 0) return "'\u0131";
    const birler = n % 10;
    if (birler !== 0) return EK_BIRLER[birler];
    const onlar = n % 100;
    if (onlar !== 0) return EK_ONLAR[onlar];
    if (n % 1000 !== 0) return "'\u00fc";
    return "'i";
}

/** Bulunma hali: 47'sinde, 34'unde, 50'sinde... */
export function sayiEkiDe(n: number): string {
    const ek = sayiEki(n);
    const son = ek[ek.length - 1];
    return `${ek}n${"ei\u00f6\u00fc".includes(son) ? "de" : "da"}`;
}
