import { normalizeAsset } from "./asset-utils";
import { assetSlug, findAssetBySlug } from "./slug";

/**
 * Bulunamayan bir slug, normalizeAsset kuralları genişlemeden önce üretilmiş
 * eski bir yazıma ait olabilir ("chipotle" -> artık "cmg"). Arama motoru bu
 * adresleri zaten indekslediği için 404 yerine kalıcı yönlendirme gerekir;
 * aksi halde eski adresin kazandığı değer yeni adrese aktarılmaz.
 *
 * Hedef yalnızca listede GERÇEKTEN varsa döner, yoksa null (sayfa 404 verir).
 * Böylece boş bir sayfaya yönlendirme ya da yönlendirme döngüsü olamaz.
 *
 * Bilerek slug.ts'te değil: o dosya istemci bileşenlerine de giriyor, bu ise
 * asset-utils'in kural tablosunu paketlere taşırdı.
 */
export function redirectSlugFor<T extends { asset: string }>(items: T[], slug: string): string | null {
    const target = assetSlug(normalizeAsset(slug));
    if (!target || target === slug) return null;
    return findAssetBySlug(items, target) ? target : null;
}
