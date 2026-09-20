/**
 * Yedek tarama — push bildirimi kaçarsa diye tüm kanalların RSS'ini kontrol eder.
 * Kullanım: npx tsx src/scripts/scan-all.ts [--deep]
 *   (varsayılan: kanal başına son 3 video, --deep: son 10 video)
 */
import "./_env";
import { getChannels, setDocData } from "@/server/repo";
import { syncChannel } from "@/server/sync";
import { evaluatePendingPredictions } from "@/server/evaluator";
import { writeHomeSnapshot } from "@/server/snapshot";
import { writeScorecard } from "@/server/scorecard";
import { writeAssetHistory } from "@/server/history";

/**
 * TOPLAM süre bütçesi. Eskiden bütçe KANAL BAŞINA idi; 30 kanalla bu,
 * iş akışının 30 dakikalık sınırını aşıp ortada kesilmesi demekti — o zaman
 * snapshot ve değerlendirme adımları hiç çalışmıyordu. Artık küresel bir
 * son tarih var: süre dolunca temiz biçimde durulur, snapshot yine yazılır.
 * Kalan videolar bir sonraki turda işlenir (her video kalıcı olarak
 * "analiz edildi" ya da "başarısız" işaretlendiği için ilerleme birikimlidir).
 */
const TOTAL_BUDGET_MS = Number(process.env.SCAN_BUDGET_MS || 18 * 60_000);

async function main() {
    const deep = process.argv.includes("--deep");
    const startedAt = Date.now();
    const channels = await getChannels();
    if (channels.length === 0) {
        console.log("[SCAN] Takip edilen kanal yok.");
        return;
    }

    console.log(
        `[SCAN] ${channels.length} kanal taranıyor (${deep ? "derin" : "hızlı"} mod), ` +
        `toplam bütçe ${Math.round(TOTAL_BUDGET_MS / 60000)} dk...`
    );
    let videos = 0;
    let findings = 0;
    let skipped = 0;

    // En az taranmış kanalın öne geçmesi için sırayı karıştır; böylece bütçe
    // dolduğunda hep aynı kanallar dışarıda kalmaz.
    const queue = [...channels].sort(() => Math.random() - 0.5);

    for (const channel of queue) {
        const remaining = TOTAL_BUDGET_MS - (Date.now() - startedAt);
        if (remaining <= 30_000) {
            skipped = queue.length - queue.indexOf(channel);
            console.log(`[SCAN] Süre bütçesi doldu. ${skipped} kanal sonraki tura kaldı.`);
            break;
        }
        try {
            const r = await syncChannel(channel.id, channel.title, channel.thumbnail, {
                maxVideos: deep ? 10 : 3,
                timeBudgetMs: Math.min(remaining, deep ? 5 * 60_000 : 3 * 60_000),
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

    // ÖNEMLİ: writeHomeSnapshot()'TAN ÖNCE yazılmalı — snapshot, bu dokümanı
    // okuyup "Son tarama" olarak gösteriyor. Sona konursa snapshot hep BİR
    // ÖNCEKİ taramanın zamanını gösterir (ilk çalıştırmada da hiç göstermez).
    // Bilinçli olarak YENİ BULGU olsun olmasın her tur sonunda yazılır —
    // amaç "sistem 6 saatte bir gerçekten çalışıyor" güvencesini vermek.
    await setDocData("system_status", "last_scan", {
        completedAt: new Date().toISOString(),
        deep,
        channelsScanned: channels.length - skipped,
        channelsSkipped: skipped,
        videosFound: videos,
    });

    await evaluatePendingPredictions().catch((e) => console.error("[EVALUATOR]", e.message));
    await writeHomeSnapshot();
    await writeScorecard();
    await writeAssetHistory();

    console.log(
        `[SCAN] Tamamlandı. ${videos} yeni video, ${findings} sinyal` +
        (skipped ? `, ${skipped} kanal sonraki tura kaldı.` : ".")
    );
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
