/**
 * VARLIK ADRESLERİ (URL)
 *
 * Adres, aranan kelimeyi taşımalı: "/varlik/usd-try" yerine "/varlik/dolar",
 * "/varlik/xu100" yerine "/varlik/bist-100". Arama motoru adresteki kelimeyi
 * konu işareti olarak okur, kullanıcı da sonuç listesinde adresi görünce
 * tıklayıp tıklamayacağına karar verir.
 *
 * Kural sırası:
 *  1) SLUG_OVERRIDE: elle verilmiş adres (etiketten güzel çıkmayanlar)
 *  2) BIST hisseleri: borsa kodu ("thyao"). İnsanlar hisseyi kodla arıyor.
 *  3) Türkçe etiketi olan varlıklar: etiketin sadeleşmiş hali ("dolar")
 *  4) Gerisi: varlık kodunun sadeleşmiş hali
 *
 * ESKİ ADRESLER ÇALIŞMAYA DEVAM EDER. Sitemap'e ve Google'ın dizinine
 * "usd-try" gibi eski adresler girmişti; `legacyAssetSlug` bunları tanır ve
 * sayfa, kalıcı yönlendirmeyle (308) yeni adrese gönderir. Eski adres bu
 * dosyadan silinmemeli — silinirse sıralama birikimi kaybolur.
 */
import { ASSET_LABEL } from "./display";

const TR: Record<string, string> = { "ç": "c", "ğ": "g", "ı": "i", "ö": "o", "ş": "s", "ü": "u", "İ": "i" };

/** "Türk Hava Yolları" -> "turk-hava-yollari" */
export function slugify(text: string): string {
    return text
        .toLocaleLowerCase("tr")
        .replace(/[çğıöşüİ]/g, (m) => TR[m] ?? m)
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

/** Eski kural: varlık KODUNDAN türetilen adres ("USD/TRY" -> "usd-try"). */
export function legacyAssetSlug(asset: string): string {
    return slugify(asset);
}

const SLUG_OVERRIDE: Record<string, string> = {
    SP500: "sp-500",
    DJI: "dow-jones",
    KONUT: "konut",
    MEVDUAT: "mevduat",
    "BANKA-HISSE": "banka-hisseleri",
    "ABD-HISSE": "abd-hisseleri",
    "AVRUPA-HISSE": "avrupa-hisseleri",
    US10Y: "abd-10-yillik-tahvil",
    VIX: "vix",
};

/** İnsanların isimle değil kodla aradığı Borsa İstanbul hisseleri. */
export const BIST_TICKERS = new Set([
    "THYAO", "ASELS", "GARAN", "AKBNK", "EREGL", "SISE", "KCHOL", "SAHOL", "TUPRS",
    "BIMAS", "PGSUS", "FROTO", "TOASO", "ARCLK", "TCELL", "YKBNK", "ISCTR", "HALKB",
    "VAKBN", "PETKM", "KRDMD", "TKFEN", "ENKAI", "ULKER", "TURSG", "SASA", "HEKTS", "ODAS",
]);

/** Kanonik adres. Sayfa bağlantılarının ve sitemap'in tek kaynağı. */
export function assetSlug(asset: string): string {
    const override = SLUG_OVERRIDE[asset];
    if (override) return override;
    if (BIST_TICKERS.has(asset)) return slugify(asset);
    const label = ASSET_LABEL[asset];
    if (label) return slugify(label) || slugify(asset);
    return slugify(asset);
}

/**
 * Adresten varlığı bulur. Önce kanonik, sonra eski adrese bakar.
 * Dönen `canonical` adresten farklıysa sayfa yönlendirme yapmalıdır.
 */
export function resolveAssetSlug(
    assets: Iterable<string>,
    slug: string
): { asset: string; canonical: string } | null {
    const list = [...assets];
    const byCanonical = list.find((a) => assetSlug(a) === slug);
    if (byCanonical) return { asset: byCanonical, canonical: slug };
    const byLegacy = list.find((a) => legacyAssetSlug(a) === slug);
    if (byLegacy) return { asset: byLegacy, canonical: assetSlug(byLegacy) };
    return null;
}

/** Slug'dan varlık koduna geri dönüş için, listedeki varlıklar arasında arar. */
export function findAssetBySlug<T extends { asset: string }>(items: T[], slug: string): T | undefined {
    const hit = resolveAssetSlug(items.map((i) => i.asset), slug);
    return hit ? items.find((i) => i.asset === hit.asset) : undefined;
}
