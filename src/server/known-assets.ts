/**
 * Varlık sayfasının, paylaşım görselinin ve sitemap'in ortak varlık listesi.
 *
 * "Bilinen varlık" = şu an konuşulanlar + Türkçe etiketi olanlar + elle profili
 * yazılmış olanlar + son 12 ayda konuşulmuş olanlar. Bir varlığa 30 gün kimse
 * değinmese de sayfası 404 olmaz (bkz. src/app/varlik/[slug]/page.tsx).
 */
import { PROFILED_ASSETS } from "@/content/assets";
import { ASSET_LABEL } from "@/lib/display";
import { getAssetHistory, getHomeSnapshot } from "./read";

export async function loadAssets() {
    const [snapshot, history] = await Promise.all([getHomeSnapshot(), getAssetHistory()]);
    const known = new Set<string>([
        ...snapshot.consensus.map((c) => c.asset),
        ...Object.keys(ASSET_LABEL),
        ...PROFILED_ASSETS,
        ...Object.keys(history),
    ]);
    return { snapshot, history, known };
}
