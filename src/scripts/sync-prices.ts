/** Takip edilen varlıkların fiyatlarını günceller ve snapshot'ı tazeler. */
import "./_env";
import { normalizeAsset } from "@/lib/asset-utils";
import { PriceService } from "@/services/price-service";
import { getAnalysesSince, updateStoredPrice } from "@/server/repo";
import { writeHomeSnapshot } from "@/server/snapshot";

async function main() {
    const analyses = await getAnalysesSince(45, 800);
    const assets = new Set<string>();
    analyses.forEach((v) => v.results?.forEach((r) => assets.add(normalizeAsset(r.asset))));

    console.log(`[PRICES] ${assets.size} varlık güncelleniyor...`);
    let ok = 0;
    for (const asset of assets) {
        try {
            const p = await PriceService.getCurrentPrice(asset);
            if (p) { await updateStoredPrice(asset, p.price, p.currency); ok++; }
        } catch { /* atla */ }
    }
    await writeHomeSnapshot();
    console.log(`[PRICES] ${ok}/${assets.size} güncellendi.`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
