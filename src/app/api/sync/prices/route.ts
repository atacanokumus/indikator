import { NextResponse } from 'next/server';
import { getLatestAnalyses, updateStoredPrice } from '@/lib/firestore';
import { normalizeAsset } from '@/lib/asset-utils';
import { PriceService } from '@/services/price-service';

export async function GET() {
    try {
        console.log('Price Sync: Starting...');
        // 1. Get unique assets from latest 200 analyses
        const analyses = await getLatestAnalyses(200);
        const assets = new Set<string>();

        analyses.forEach(video => {
            video.results.forEach(res => {
                assets.add(normalizeAsset(res.asset));
            });
        });

        const assetList = Array.from(assets);
        console.log(`Price Sync: Updating ${assetList.length} assets`);

        // 2. Fetch and store prices sequentially to avoid rate limits
        const results: Record<string, any> = {
            total: assetList.length,
            updated: 0,
            failed: 0,
            errors: []
        };

        for (const asset of assetList) {
            try {
                const priceInfo = await PriceService.getCurrentPrice(asset);
                if (priceInfo) {
                    await updateStoredPrice(asset, priceInfo.price, priceInfo.currency);
                    results.updated++;
                } else {
                    results.failed++;
                }
            } catch (err: any) {
                results.failed++;
                results.errors.push(`${asset}: ${err.message}`);
            }
        }

        console.log('Price Sync: Finished', results);
        return NextResponse.json({ success: true, results });
    } catch (error: any) {
        console.error('Price Sync Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
