import { collection, query, where, getDocs, doc, updateDoc, Timestamp, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { VideoAnalysis, Analysis, Channel } from "../lib/firestore";
import { PriceService } from "./price-service";

const TIMEFRAME_DAYS = {
    'KISA': 7,
    'ORTA': 30,
    'UZUN': 180
};

export class Evaluator {
    static async evaluatePendingPredictions() {
        console.log("[EVALUATOR] Başlatılıyor...");

        const q = query(
            collection(db!, "analyses"),
            where("isEvaluated", "==", false)
        );

        const snapshot = await getDocs(q);
        console.log(`[EVALUATOR] ${snapshot.size} bekleyen tahmin bulundu.`);

        for (const snap of snapshot.docs) {
            const videoAnalysis = snap.data() as VideoAnalysis;
            let changed = false;

            for (const analysis of videoAnalysis.results) {
                if (analysis.isEvaluated) continue;

                const publishedAt = (videoAnalysis.publishedAt as any).toDate ? (videoAnalysis.publishedAt as any).toDate() : new Date(videoAnalysis.publishedAt);
                const daysPassed = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60 * 24);
                const requiredDays = TIMEFRAME_DAYS[analysis.timeframe] || 7;

                if (daysPassed >= requiredDays) {
                    await this.evaluateAnalysis(analysis, videoAnalysis.channelId);
                    changed = true;
                }
            }

            if (changed) {
                await updateDoc(doc(db!, "analyses", snap.id), {
                    results: videoAnalysis.results
                });
            }
        }
    }

    private static async evaluateAnalysis(analysis: Analysis, channelId: string) {
        console.log(`[EVALUATOR] Değerlendiriliyor: ${analysis.asset} (${channelId})`);

        const currentPriceInfo = await PriceService.getCurrentPrice(analysis.asset);
        if (!currentPriceInfo) {
            console.warn(`[EVALUATOR] Fiyat alınamadı: ${analysis.asset}`);
            return;
        }

        const entryPrice = analysis.entryPrice || 0;
        const exitPrice = currentPriceInfo.price;
        const recommendation = analysis.recommendation;

        let status: 'SUCCESS' | 'FAILURE' | 'NEUTRAL' = 'NEUTRAL';
        let scoreChange = 0;

        if (entryPrice > 0) {
            const percentChange = ((exitPrice - entryPrice) / entryPrice) * 100;

            if (recommendation === 'AL') {
                if (percentChange > 1) { // %1 üstü başarı
                    status = 'SUCCESS';
                    scoreChange = 10;
                } else if (percentChange < -1) {
                    status = 'FAILURE';
                    scoreChange = -15;
                }
            } else if (recommendation === 'SAT') {
                if (percentChange < -1) {
                    status = 'SUCCESS';
                    scoreChange = 10;
                } else if (percentChange > 1) {
                    status = 'FAILURE';
                    scoreChange = -15;
                }
            }
        }

        analysis.exitPrice = exitPrice;
        analysis.isEvaluated = true;
        analysis.status = status;
        analysis.evaluatedAt = Timestamp.now() as any;

        // Ekonomist puanını güncelle
        await this.updateChannelScore(channelId, scoreChange);
    }

    private static async updateChannelScore(channelId: string, scoreChange: number) {
        const channelRef = doc(db!, "channels", channelId);
        const channelSnap = await getDoc(channelRef);

        if (channelSnap.exists()) {
            const data = channelSnap.data() as Channel;
            const newScore = Math.max(0, (data.totalScore || 100) + scoreChange);
            const newPredictionCount = (data.predictionCount || 0) + 1;

            // Ağırlık hesabı: Puan / 100 bazlı basit bir ağırlık
            const newWeight = Math.max(0.1, newScore / 100);

            await updateDoc(channelRef, {
                totalScore: newScore,
                predictionCount: newPredictionCount,
                weight: newWeight
            });
            console.log(`[EVALUATOR] Kanal ${channelId} güncellendi: Skor=${newScore}, Ağırlık=${newWeight}`);
        }
    }
}
