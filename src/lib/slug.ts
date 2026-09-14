/** Varlık kodunu URL'de kullanılabilir hale getirir: "USD/TRY" -> "usd-try" */
const TR: Record<string, string> = { "ç": "c", "ğ": "g", "ı": "i", "ö": "o", "ş": "s", "ü": "u", "İ": "i" };

export function assetSlug(asset: string): string {
    return asset
        .toLocaleLowerCase("tr")
        .replace(/[çğıöşüİ]/g, (m) => TR[m] ?? m)
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

/** Slug'dan varlık koduna geri dönüş için, listedeki varlıklar arasında arar. */
export function findAssetBySlug<T extends { asset: string }>(items: T[], slug: string): T | undefined {
    return items.find((i) => assetSlug(i.asset) === slug);
}
