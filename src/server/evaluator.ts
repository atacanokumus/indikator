/**
 * Tahmin başarı değerlendiricisi.
 *
 * DÜZELTİLEN HATA: Eski sürüm `where("isEvaluated","==",false)` sorguluyordu,
 * ama `isEvaluated` alanı dokümanın kökünde değil `results[]` dizisinin
 * içindeydi. Firestore dizi içi alanları böyle sorgulayamaz; sorgu HER ZAMAN
 * 0 doküman döndürüyordu. Yani analist başarı puanları hiç hesaplanmadı,
 * `weight` hep 1.0 kaldı ve konsensüs ağırlıklandırması çalışmadı.
 *
 * Çözüm: Kayıt anında kök seviyeye `hasPending` boolean'ı yazılıyor ve sorgu
 * onun üzerinden yapılıyor.
 */
import { PriceService } from "@/services/price-service";
import type { Analysis } from "@/lib/types";
import { toIso } from "@/lib/types";
import { getChannel, getPendingAnalyses, updateAnalysisResults, updateChannelStats } from "./repo";

const TIMEFRAME_DAYS: Record<string, number> = { KISA: 7, ORTA: 30, UZUN: 180 };
/** Fiyat hareketinin "anlamlı" sayılması için gereken eşik (%) */
const THRESHOLD = 1.5;

export async function evaluatePendingPredictions() {
    const pending = await getPendingAnalyses();
    console.log(`[EVALUATOR] ${pending.length} bekleyen analiz bulundu.`);

    let evaluated = 0;
    const channelDeltas = new Map<string, { score: number; total: number; success: number }>();

    for (const { data } of pending) {
        const publishedAt = new Date(toIso(data.publishedAt));
        const daysPassed = (Date.now() - publishedAt.getTime()) / 864e5;
        let changed = false;

        for (const analysis of data.results || []) {
            if (analysis.isEvaluated) continue;
            const required = TIMEFRAME_DAYS[analysis.timeframe] ?? 30;
            if (daysPassed < required) continue;

            const outcome = await evaluateOne(analysis);
            if (!outcome) continue;

            changed = true;
            evaluated++;

            const d = channelDeltas.get(data.channelId) ?? { score: 0, total: 0, success: 0 };
            d.score += outcome.scoreChange;
            d.total += 1;
            if (outcome.status === "SUCCESS") d.success += 1;
            channelDeltas.set(data.channelId, d);
        }

        if (changed) {
            await updateAnalysisResults(data.videoId, data.results);
        }
    }

    for (const [channelId, d] of channelDeltas) {
        const channel = await getChannel(channelId);
        if (!channel) continue;
        const totalScore = Math.max(0, Math.min(300, (channel.totalScore ?? 100) + d.score));
        const predictionCount = (channel.predictionCount ?? 0) + d.total;
        const successCount = (channel.successCount ?? 0) + d.success;
        // Ağırlık 0.4 – 1.8 aralığında tutuluyor ki tek bir analist konsensüsü ele geçirmesin
        const weight = Math.max(0.4, Math.min(1.8, totalScore / 100));
        await updateChannelStats(channelId, { totalScore, predictionCount, successCount, weight });
        console.log(`[EVALUATOR] ${channel.title}: puan=${totalScore}, ağırlık=${weight.toFixed(2)}`);
    }

    console.log(`[EVALUATOR] ${evaluated} tahmin değerlendirildi.`);
    return { evaluated };
}

async function evaluateOne(
    analysis: Analysis
): Promise<{ status: "SUCCESS" | "FAILURE" | "NEUTRAL"; scoreChange: number } | null> {
    const entry = analysis.entryPrice ?? 0;
    if (!entry || entry <= 0) {
        // Giriş fiyatı yoksa ölçemeyiz; tekrar tekrar denememek için nötr kapat.
        analysis.isEvaluated = true;
        analysis.status = "NEUTRAL";
        analysis.evaluatedAt = new Date().toISOString();
        return { status: "NEUTRAL", scoreChange: 0 };
    }

    const current = await PriceService.getCurrentPrice(analysis.asset);
    if (!current) return null; // fiyat alınamadı, sonraki turda tekrar dene

    const change = ((current.price - entry) / entry) * 100;
    let status: "SUCCESS" | "FAILURE" | "NEUTRAL" = "NEUTRAL";
    let scoreChange = 0;

    if (analysis.recommendation === "AL") {
        if (change > THRESHOLD) { status = "SUCCESS"; scoreChange = 8; }
        else if (change < -THRESHOLD) { status = "FAILURE"; scoreChange = -10; }
    } else if (analysis.recommendation === "SAT") {
        if (change < -THRESHOLD) { status = "SUCCESS"; scoreChange = 8; }
        else if (change > THRESHOLD) { status = "FAILURE"; scoreChange = -10; }
    } else {
        // TUT / GÖZLEMLE: yatay kalması başarıdır
        status = Math.abs(change) <= THRESHOLD ? "SUCCESS" : "NEUTRAL";
        scoreChange = status === "SUCCESS" ? 3 : 0;
    }

    analysis.exitPrice = current.price;
    analysis.isEvaluated = true;
    analysis.status = status;
    analysis.evaluatedAt = new Date().toISOString();

    return { status, scoreChange };
}
