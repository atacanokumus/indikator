/**
 * Varlık sayfalarının arama motoru tarafı: ad, başlık, açıklama, dizine girme kararı.
 * Sayfa, sitemap ve paylaşım görseli aynı kuralı kullansın diye tek dosyada.
 */
import { PROFILED_ASSETS, getAssetProfile } from "@/content/assets";
import { DIRECTION, assetLabel, tallyTextShort } from "@/lib/display";
import { fitDescription, fitTitle, monthYearTr } from "@/lib/seo";
import type { AssetConsensus } from "@/lib/types";

/** Başlık ve cümlelerde geçen ad: profilde özel bir ad varsa o, yoksa etiket. */
export function assetSeoName(asset: string): string {
    return getAssetProfile(asset)?.name ?? assetLabel(asset);
}

/**
 * Sayfa arama dizinine girsin mi? Yalnızca elle yazılmış profili olan varlıklar.
 *
 * NEDEN: Eskiden "≥3 analist konuşuyorsa" da dizine giriyordu. AdSense, siteyi
 * "düşük değerli içerik" gerekçesiyle reddetti; örnek sayfa /varlik/t-mobile idi:
 * üç yapay zeka özeti, kalıp SSS ve her sayfada aynı yasal metin. Sayfanın
 * özgün kısmı birkaç cümleydi. Analist sayısı sayfayı dolu yapmıyor; elle
 * yazılmış "nedir / neyi etkiler" metni yapıyor. Profilsiz sayfa kullanıcıya
 * açık kalır (`noindex, follow`), sitemap'e girmez, üzerinde reklam yuvası
 * gösterilmez. Bir varlığı dizine sokmak için src/content/assets.ts'e profil yazın.
 */
export function isIndexableAsset(asset: string): boolean {
    return PROFILED_ASSETS.includes(asset);
}

export function assetMetaTitle(asset: string, generatedAt?: string, hasData = true): string {
    const name = assetSeoName(asset);
    if (!hasData) return fitTitle(`${name} yorumları ve analist görüşleri`, `${name} yorumları`);
    const when = monthYearTr(generatedAt);
    return fitTitle(
        `${name} yorumları: ekonomistler ne diyor? (${when})`,
        `${name} yorumları: ekonomistler ne diyor?`,
        `${name} yorumları`
    );
}

export function assetMetaDescription(asset: string, item: AssetConsensus | undefined, windowDays: number): string {
    const name = assetSeoName(asset);
    if (!item) {
        return fitDescription(
            `${name} hakkında ekonomi yorumcularının görüşleri, 12 aylık görüş geçmişi ve ${name} fiyatını etkileyen unsurlar. ` +
                `Yatırım tavsiyesi değil, sayım.`
        );
    }
    return fitDescription(
        `${name} için son ${windowDays} günde ${item.analystCount} ekonomi yorumcusu konuştu: ` +
            `${tallyTextShort(item.tally, item.analystCount)}. Yatırım tavsiyesi değil, sayım.`
    );
}

/** Yönün küçük harfli, cümle içinde kullanılabilir hali: "alım", "bekle". */
export function directionWord(rec: AssetConsensus["leading"]): string {
    return DIRECTION[rec].toLocaleLowerCase("tr");
}
