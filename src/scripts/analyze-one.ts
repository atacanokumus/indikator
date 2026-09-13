/**
 * Tek video analizi — YouTube push bildirimi tetiklediğinde GitHub Actions
 * bu script'i çalıştırır. Kullanım:
 *   npx tsx src/scripts/analyze-one.ts <videoId> <channelId> [başlık] [yayınTarihi]
 */
import "./_env";
import { getChannel } from "@/server/repo";
import { syncVideo } from "@/server/sync";
import { evaluatePendingPredictions } from "@/server/evaluator";
import { writeHomeSnapshot } from "@/server/snapshot";

async function main() {
    const [videoId, channelId, title, publishedAt] = process.argv.slice(2);
    if (!videoId || !channelId) {
        console.error("Kullanım: analyze-one.ts <videoId> <channelId> [başlık] [yayınTarihi]");
        process.exit(1);
    }

    const channel = await getChannel(channelId);
    if (!channel) {
        console.error(`[ANALYZE] Kanal takip listesinde değil: ${channelId}. Atlanıyor.`);
        process.exit(0);
    }

    console.log(`[ANALYZE] ${channel.title} → ${title || videoId}`);
    const result = await syncVideo(videoId, channelId, channel.title, channel.thumbnail, {
        title: title || undefined,
        publishedAt: publishedAt || undefined,
    });

    result.logs.forEach((l) => console.log(l));

    if (result.totalFindings > 0) {
        await evaluatePendingPredictions().catch((e) => console.error("[EVALUATOR]", e.message));
        await writeHomeSnapshot();
    }

    console.log(`[ANALYZE] Bitti. Bulgu: ${result.totalFindings}`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
