import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import { getChannels } from "./lib/firestore";
import { syncChannel } from "./lib/sync";
import { Evaluator } from "./services/evaluator";

const TURKEY_UTC_OFFSET = 3; // UTC+3
const TARGET_HOUR = 0; // Gece 12 (00:00 TR saati)

const getTurkeyHour = () => {
    const now = new Date();
    return (now.getUTCHours() + TURKEY_UTC_OFFSET) % 24;
};

const runDailyScan = async () => {
    const now = new Date();
    console.log(`\n[CRON] Günlük Tarama Başlatıldı: ${now.toLocaleString('tr-TR')}`);

    try {
        const channels = await getChannels();
        if (channels.length === 0) {
            console.log("[CRON] Takip edilen kanal bulunamadı.");
            return;
        }

        console.log(`[CRON] ${channels.length} kanal taranıyor (transkript + Gemini URL analizi)...`);
        let totalVideos = 0;
        let totalFindings = 0;

        for (const channel of channels) {
            console.log(`[CRON] >>> ${channel.title} kontrol ediliyor (RSS Feed)...`);
            const result = await syncChannel(channel.id, channel.title, channel.thumbnail);

            if (result.success) {
                totalVideos += result.videosProcessed || 0;
                totalFindings += result.totalFindings || 0;
                console.log(`[CRON] +++ ${channel.title}: ${result.videosProcessed} video, ${result.totalFindings} bulgu.`);
            } else {
                console.error(`[CRON] --- ${channel.title} hatası: ${result.error}`);
            }
        }

        console.log(`[CRON] Tahminler değerlendiriliyor...`);
        await Evaluator.evaluatePendingPredictions();

        console.log(`[CRON] Günlük Tarama Tamamlandı. Toplam: ${totalVideos} video, ${totalFindings} bulgu.\n`);
    } catch (error) {
        console.error("[CRON] Kritik Hata:", error);
        process.exitCode = 1;
    }
};

// --once flag: GitHub Actions ve CI/CD için tek seferlik çalıştır
const isOnce = process.argv.includes('--once');

if (isOnce) {
    console.log(`[CRON] One-shot mode (GitHub Actions / CI)`);
    runDailyScan().then(() => {
        console.log(`[CRON] One-shot completed.`);
        process.exit(0);
    }).catch((err) => {
        console.error(`[CRON] One-shot failed:`, err);
        process.exit(1);
    });
} else {
    // Standalone daemon: Her dakika kontrol et, Türkiye 00:00'da çalıştır
    let lastRunDate = '';

    const checkAndRun = async () => {
        const now = new Date();
        const turkeyHour = getTurkeyHour();
        const todayStr = now.toISOString().slice(0, 10);

        if (turkeyHour === TARGET_HOUR && lastRunDate !== todayStr) {
            lastRunDate = todayStr;
            console.log(`[CRON] Türkiye saati 00:00 — Günlük tarama tetikleniyor...`);
            await runDailyScan();
        }
    };

    console.log(`[CRON] Standalone cron başlatıldı. Türkiye saati 00:00'da günlük tarama yapılacak.`);
    runDailyScan();
    setInterval(checkAndRun, 60 * 1000);
}
