/**
 * Abonelik sağlığı kontrolü.
 * Kullanım: npx tsx src/scripts/check-subs.ts
 *
 * Anlık güncelleme zinciri sessizce ölebilen bir şey: abonelikler ~5 günde
 * düşer ve hiçbir hata görünmez, sadece güncellemeler gelmez olur. Bu betik
 * hangi kanalın aboneliğinin bayatladığını gösterir.
 */
import "./_env";
import { adminDb } from "@/server/db";

async function main() {
    const [subs, chans] = await Promise.all([
        adminDb().collection("pubsub_subs").get(),
        adminDb().collection("channels").get(),
    ]);
    const titles = new Map(chans.docs.map((c) => [c.id, c.get("title") as string]));
    const limit = Date.now() - 4 * 864e5; // 4 günden eskiyse tehlike bölgesi
    const stale: string[] = [];
    let ok = 0;

    subs.forEach((d) => {
        const at = Date.parse(String(d.get("lastAttemptAt") ?? ""));
        if (d.get("ok") && at > limit) ok++;
        else stale.push(`${titles.get(d.id) ?? d.id} — ${String(d.get("lastAttemptAt")).slice(0, 16)} (ok=${d.get("ok")})`);
    });

    console.log(`${chans.size} kanal | aboneliği taze: ${ok} | bayat: ${stale.length}`);
    if (stale.length) console.log("Bayat:\n  " + stale.join("\n  "));
    if (chans.size > subs.size) {
        console.log(`UYARI: ${chans.size - subs.size} kanalın hiç abonelik kaydı yok.`);
    }
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
