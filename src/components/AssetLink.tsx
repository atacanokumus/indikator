import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { assetSlug } from "@/lib/slug";

/**
 * Varlık sayfasına bağlantı; sayfası olmayan varlıkta düz metin.
 *
 * Bülten ve karne geçmiş veriyi gösterir: orada adı geçen bir varlık (ör. haftalar
 * önce tek bir videoda konuşulmuş bir hisse) bugün "bilinen varlık" listesinde
 * olmayabilir ve /varlik/<ad> 404 döner. Kasım 2026 denetiminde bu yüzden 18 kırık
 * iç bağlantı vardı. `known`, src/server/known-assets.ts `loadAssets()` çıktısıdır.
 */
export function AssetLink({
    asset, known, className, style, children,
}: {
    asset: string; known: Set<string>; className?: string; style?: CSSProperties; children: ReactNode;
}) {
    if (!known.has(asset)) return <span className={className?.replace("card-hover", "").trim()} style={style}>{children}</span>;
    return <Link href={`/varlik/${assetSlug(asset)}`} className={className} style={style}>{children}</Link>;
}
