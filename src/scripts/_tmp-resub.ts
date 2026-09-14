import "./_env";
import { adminDb } from "@/server/db";
import { subscribeChannel } from "@/server/websub";
async function main() {
    const [subs, chans] = await Promise.all([
        adminDb().collection("pubsub_subs").get(),
        adminDb().collection("channels").get(),
    ]);
    const titles = new Map(chans.docs.map((c) => [c.id, c.get("title") as string]));
    const cutoff = Date.now() - 2 * 3600_000;
    const stale = subs.docs.filter((d) => !(d.get("ok") && Date.parse(String(d.get("lastAttemptAt") ?? "")) > cutoff));
    stale.sort(() => Math.random() - 0.5);
    const deadline = Date.now() + 150_000;
    let done = 0;
    for (const d of stale) {
        if (Date.now() > deadline) break;
        try {
            await subscribeChannel(d.id);
            done++;
            console.log(`✓ ${titles.get(d.id) ?? d.id}`);
        } catch (e) {
            console.log(`✗ ${titles.get(d.id) ?? d.id}: ${(e as Error).message.slice(0, 50)}`);
        }
    }
    console.log(`bu turda ${done}/${stale.length}`);
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
