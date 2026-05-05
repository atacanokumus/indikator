import { NextRequest, NextResponse } from 'next/server';
import { PriceService } from '@/services/price-service';

export async function POST(req: NextRequest) {
    try {
        const { assets } = await req.json();

        if (!assets || !Array.isArray(assets)) {
            return NextResponse.json({ success: false, error: "Invalid assets list" }, { status: 400 });
        }

        const pricePromises = assets.map(async (asset) => {
            const info = await PriceService.getCurrentPrice(asset);
            return { asset, info };
        });

        const results = await Promise.all(pricePromises);
        const priceMap: Record<string, any> = {};

        results.forEach(res => {
            if (res.info) {
                priceMap[res.asset.toUpperCase()] = res.info;
            }
        });

        return NextResponse.json({ success: true, prices: priceMap });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
