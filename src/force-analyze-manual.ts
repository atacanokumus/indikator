import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import { analyzeTranscript } from "./lib/gemini";
import { saveAnalysis } from "./lib/firestore";
import { Timestamp } from "firebase/firestore";
import { PriceService } from "./services/price-service";

async function forceAnalyze() {
    console.log("[MANUAL] Starting manual analysis for Devrim Akyıl's latest video...");

    const transcript = fs.readFileSync(path.resolve(__dirname, '../devrim-transcript.txt'), 'utf8');

    const videoData = {
        id: "mSYBkDCouZ8",
        title: "Altın, Gümüş + Bist’de Bize Sürpriz Yok!🙏❤️🧿",
        channelId: "UCDou5HvsE1AgL8yXzijbfxg",
        channelTitle: "Devrim Akyıl",
        publishedAt: "2026-02-21T18:55:02.000Z",
        thumbnail: "https://i2.ytimg.com/vi/mSYBkDCouZ8/hqdefault.jpg"
    };

    try {
        console.log("[AI] Analyzing transcript...");
        const analysisResults = await analyzeTranscript(transcript);
        console.log(`[AI] Found ${analysisResults?.length || 0} findings.`);

        if (analysisResults && analysisResults.length > 0) {
            console.log("[PRICES] Enriching with current prices...");
            for (const result of analysisResults) {
                const priceInfo = await PriceService.getCurrentPrice(result.asset);
                if (priceInfo) {
                    result.entryPrice = priceInfo.price;
                }
                result.isEvaluated = false;
                result.status = 'PENDING';
            }

            console.log("[FIRESTORE] Saving analysis...");
            await saveAnalysis({
                videoId: videoData.id,
                videoTitle: videoData.title,
                channelId: videoData.channelId,
                channelTitle: videoData.channelTitle,
                thumbnail: videoData.thumbnail,
                publishedAt: videoData.publishedAt,
                analyzedAt: Timestamp.now(),
                results: analysisResults
            });
            console.log("[SUCCESS] Analysis saved successfully!");
        } else {
            console.log("[WARN] AI found no relevant stock/crypto findings in this transcript.");
        }
    } catch (error) {
        console.error("[ERROR] Analysis failed:", error);
    }
    process.exit(0);
}

forceAnalyze();
