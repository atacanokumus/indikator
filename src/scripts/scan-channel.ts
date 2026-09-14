/**
 * Belirli kanalları adına göre tarar.
 * Kullanım: npx tsx src/scripts/scan-channel.ts "Patrick Boyle" "Real Vision"
 * BUDGET_MS ile toplam süre bütçesi verilebilir (varsayılan 140 sn).
 */
import "./_env";
import { getChannels } from "@/server/repo";
import { syncChannel } from "@/server/sync";
const HEDEF = process.argv.slice(2);
async function main() {
    const channels = (await getChannels()).filter((c) =>
        HEDEF.some((h) => c.title.toLowerCase().includes(h.toLowerCase()))
    );
    const deadline = Date.now() + Number(process.env.BUDGET_MS || 140000);
    for (const c of channels) {
        const remaining = deadline - Date.now();
        if (remaining < 20000) { console.log("[HEDEF] Süre doldu."); break; }
        const r = await syncChannel(c.id, c.title, c.thumbnail, {
            maxVideos: 6,
            timeBudgetMs: remaining,
            language: c.language ?? "tr",
        });
        console.log(`[HEDEF] ${c.title}: ${r.videosProcessed} video, ${r.totalFindings} sinyal`);
        if (r.videosProcessed === 0) (r.logs ?? []).slice(-6).forEach((l) => console.log("   " + l));
    }
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
