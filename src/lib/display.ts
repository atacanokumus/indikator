import type { Recommendation } from "./types";

export const SIGNAL_LABEL: Record<Recommendation, string> = {
    AL: "AL",
    SAT: "SAT",
    TUT: "BEKLE",
    "GÖZLEMLE": "GÖZLEMLE",
};

export const SIGNAL_SENTENCE: Record<Recommendation, string> = {
    AL: "Analistlerin çoğunluğu alım yönünde",
    SAT: "Analistlerin çoğunluğu satış yönünde",
    TUT: "Analistler kararsız, beklemede",
    "GÖZLEMLE": "Net görüş yok, izleniyor",
};

export function signalClass(rec: Recommendation) {
    return `sig sig-${rec}`;
}

/** Öne çıkarılacak varlıklar — ziyaretçilerin en çok aradıkları. */
export const SPOTLIGHT_ASSETS = ["ALTIN", "USD/TRY", "BTC", "XU100"];

export const ASSET_LABEL: Record<string, string> = {
    "USD/TRY": "Dolar",
    "EUR/TRY": "Euro",
    "GBP/TRY": "Sterlin",
    "EUR/USD": "Euro / Dolar",
    XU100: "BIST 100",
    ALTIN: "Altın",
    "GÜMÜŞ": "Gümüş",
    BTC: "Bitcoin",
    ETH: "Ethereum",
    "CL=F": "Petrol",
    "BZ=F": "Brent Petrol",
    "NG=F": "Doğalgaz",
    "HG=F": "Bakır",
    "PL=F": "Platin",
    "PA=F": "Paladyum",
};

export function assetLabel(asset: string) {
    return ASSET_LABEL[asset] ?? asset;
}

export function formatPrice(price?: number | null, currency?: string | null) {
    if (price == null || !Number.isFinite(price)) return null;
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
    return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}
