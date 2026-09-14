/**
 * Tek video analizi — YouTube push bildirimi tetiklediğinde GitHub Actions
 * bu script'i çalıştırır. Kullanım:
 *   npx tsx src/scripts/analyze-one.ts <videoId> <channelId> [başlık] [yayınTarihi]
 */
import "./_env";
import { getChannel, recordFailure } from "@/server/repo";
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

    /**
     * YouTube push bildirimi videodan 1-2 dakika sonra geliyor; otomatik
     * altyazı ise genelde biraz daha geç hazır oluyor. İlk denemede altyazı
     * yoksa iş akışını bitirip 6 saat beklemek yerine kısa aralıklarla birkaç
     * kez daha deniyoruz — "video atar atmaz güncelleme" vaadi buna bağlı.
     * Yalnızca GEÇİCİ hatada tekrar denenir; altyazısı kapalı video ilk
     * denemede kalıcı olarak işaretlenir ve boşuna dakika harcanmaz.
     */
    const RETRY_WAITS_MS = [120_000, 300_000];
    let result = await runOnce();
    for (let i = 0; i < RETRY_WAITS_MS.length && result.transient; i++) {
        const dk = Math.round(RETRY_WAITS_MS[i] / 60000 * 10) / 10;
        console.log(`[ANALYZE] Altyazı henüz hazır değil; ${dk} dk sonra tekrar denenecek.`);
        await new Promise((r) => setTimeout(r, RETRY_WAITS_MS[i]));
        result = await runOnce();
    }

    // Tüm denemeler geçici hatayla bittiyse videonun altyazısı muhtemelen
    // tamamen kapalı. Sayacı burada bir artırıyoruz: yoksa 6 saatlik tarama
    // bu videoyu sonsuza dek tekrar tekrar denemeye devam eder.
    if (result.transient) {
        await recordFailure(videoId, "Altyazı birkaç denemede de alınamadı");
        console.log(`[ANALYZE] Altyazı hâlâ yok; deneme sayacı artırıldı.`);
    }

    async function runOnce() {
        const r = await syncVideo(
            videoId, channelId, channel!.title, channel!.thumbnail,
            { title: title || undefined, publishedAt: publishedAt || undefined },
            channel!.language ?? "tr"
        );
        r.logs.forEach((l) => console.log(l));
        return r;
    }

    if (result.totalFindings > 0) {
        await evaluatePendingPredictions().catch((e) => console.error("[EVALUATOR]", e.message));
        await writeHomeSnapshot();
    }

    console.log(`[ANALYZE] Bitti. Bulgu: ${result.totalFindings}`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
