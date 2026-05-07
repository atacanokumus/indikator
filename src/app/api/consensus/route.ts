import { NextResponse } from 'next/server';
import { getLatestAnalysesFiltered, getChannels } from '@/lib/firestore';
import { normalizeAsset } from '@/lib/asset-utils';

export async function GET() {
    try {
        const [analyses, channels] = await Promise.all([
            getLatestAnalysesFiltered(), // Tüm analizler, emtia bazında son sinyal
            getChannels()
        ]);

        const channelMap = Object.fromEntries(channels.map(c => [c.id, c]));
        const assetMap: Record<string, {
            asset: string;
            signals: {
                recommendation: string;
                weight: number;
                channelTitle: string;
                date: string;
            }[];
            sentiment: Record<string, number>;
        }> = {};

        analyses.forEach(video => {
            const channel = channelMap[video.channelId];
            const channelWeight = channel?.weight || 1.0;

            // Zaman ağırlığı - 7 günlük pencerede daha basit
            const daysOld = (Date.now() - new Date(video.publishedAt).getTime()) / (1000 * 60 * 60 * 24);
            let timeWeight = 1.0;
            if (daysOld > 5) timeWeight = 0.7;
            else if (daysOld > 3) timeWeight = 0.85;

            const weight = channelWeight * timeWeight;

            video.results.forEach(res => {
                const asset = normalizeAsset(res.asset);
                if (!assetMap[asset]) {
                    assetMap[asset] = {
                        asset: asset,
                        signals: [],
                        sentiment: { 'AL': 0, 'SAT': 0, 'TUT': 0, 'GÖZLEMLE': 0 }
                    };
                }

                assetMap[asset].signals.push({
                    recommendation: res.recommendation,
                    weight: weight,
                    channelTitle: video.channelTitle,
                    date: video.publishedAt
                });

                if (assetMap[asset].sentiment[res.recommendation] !== undefined) {
                    assetMap[asset].sentiment[res.recommendation] += weight;
                }
            });
        });

        // Consensus özeti çıkar
        const consensus = Object.values(assetMap).map(data => {
            let topRecommendation = 'GÖZLEMLE';
            let maxWeight = -1;
            let totalWeight = 0;

            Object.entries(data.sentiment).forEach(([rec, weight]) => {
                totalWeight += weight;
                if (weight > maxWeight) {
                    maxWeight = weight;
                    topRecommendation = rec;
                }
            });

            // Güven skoru: En çok oy alanın ağırlığı / Toplam ağırlık
            const confidence = totalWeight > 0 ? (maxWeight / totalWeight) : 0;

            return {
                asset: data.asset,
                recommendation: topRecommendation,
                confidence: Math.round(confidence * 100),
                totalAnalysts: new Set(data.signals.map(s => s.channelTitle)).size,
                latestSignal: data.signals.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date
            };
        }).sort((a, b) => b.totalAnalysts - a.totalAnalysts); // En çok konuşulandan başlayarak

        return NextResponse.json({ success: true, consensus });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
