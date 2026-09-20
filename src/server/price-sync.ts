/**
 * Takip edilen varlıkların fiyatlarını günceller ve ana sayfa snapshot'ını tazeler.
 *
 * Hem `src/scripts/sync-prices.ts` (GitHub Actions'tan) hem de
 * `/api/sync/prices` (Vercel Cron'dan) burayı çağırır — mantık tek yerde.
 *
 * NEDEN AYRI BİR VERCEL CRON: Fiyat güncelleme, GitHub Actions'ın "Yedek
 * Tarama ve Bakım" iş akışının bir parçasıydı. Ama GitHub Actions dakikası
 * (private repo'da ayda 2000 dk ücretsiz) video analiziyle paylaşılıyor ve
 * dakika bittiğinde fiyatlar da güncellenmez oluyordu — halbuki fiyat
 * güncelleme birkaç saniyede biten, Vercel'in süre sınırına hiç takılmayan
 * hafif bir iş. Bu yüzden GitHub Actions'tan çıkarıp kendi ücretsiz Vercel
 * Cron'una taşıdık; video analizi (dakikalarca sürebilen Gemini işi) hâlâ
 * GitHub Actions'ta kalıyor.
 */
import { normalizeAsset } from "@/lib/asset-utils";
import { PriceService } from "@/services/price-service";
import { getAnalysesSince, updateStoredPrice } from "@/server/repo";
import { writeHomeSnapshot } from "@/server/snapshot";

export interface PriceSyncResult {
    total: number;
    updated: number;
}

export async function syncPrices(): Promise<PriceSyncResult> {
    const analyses = await getAnalysesSince(45, 800);
    const assets = new Set<string>();
    analyses.forEach((v) => v.results?.forEach((r) => assets.add(normalizeAsset(r.asset))));

    let updated = 0;
    for (const asset of assets) {
        try {
            const p = await PriceService.getCurrentPrice(asset);
            if (p) {
                await updateStoredPrice(asset, p.price, p.currency);
                updated++;
            }
        } catch {
            /* tek varlık başarısız olursa diğerlerini engellemesin */
        }
    }
    await writeHomeSnapshot();
    return { total: assets.size, updated };
}
