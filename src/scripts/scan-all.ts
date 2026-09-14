/**
 * Yedek tarama — push bildirimi kaçarsa diye tüm kanalların RSS'ini kontrol eder.
 * Kullanım: npx tsx src/scripts/scan-all.ts [--deep]
 *   (varsayılan: kanal başına son 3 video, --deep: son 10 video)
 */
import "./_env";
import { getChannels } from "@/server/repo";
import { syncChannel } from "@/server/sync";
import { evaluatePendingPredictions } from "@/server/evaluator";
import { writeHomeSnapshot } from "@/server/snapshot";

async function main() {
    const deep = process.argv.includes("--deep");
    const channels = await getChannels();
    if (channels.length === 0) {
        console.log("[SCAN] Takip edilen kanal yok.");
        return;
    }

    console.log(`[SCAN] ${channels.length} kanal taranıyor (${deep ? "derin" : "hızlı"} mod)...`);
    let videos = 0;
    let findings = 0;

    for (const channel of channels) {
        try {
            const r = await syncChannel(channel.id, channel.title, channel.thumbnail, {
                maxVideos: deep ? 10 : 3,
                timeBudgetMs: deep ? 10 * 60_000 : 4 * 60_000,
                language: channel.language ?? "tr",
            });
            videos += r.videosProcessed;
            findings += r.totalFindings;
            if (r.videosProcessed > 0) {
                console.log(`[SCAN] ✓ ${channel.title}: ${r.videosProcessed} video, ${r.totalFindings} sinyal`);
            }
        } catch (err) {
            console.error(`[SCAN] ✗ ${channel.title}: ${(err as Error).message}`);
        }
    }

    await evaluatePendingPredictions().catch((e) => console.error("[EVALUATOR]", e.message));
    await writeHomeSnapshot();

    console.log(`[SCAN] Tamamlandı. ${videos} yeni video, ${findings} sinyal.`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
