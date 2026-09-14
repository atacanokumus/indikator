import "./_env";
import { adminDb } from "@/server/db";
async function main() {
    const [subs, chans] = await Promise.all([
        adminDb().collection("pubsub_subs").get(),
        adminDb().collection("channels").get(),
    ]);
    const titles = new Map(chans.docs.map((c) => [c.id, c.get("title") as string]));
    const cutoff = Date.now() - 2 * 3600_000;
    const old: string[] = [];
    let fresh = 0;
    subs.forEach((d) => {
        const at = Date.parse(String(d.get("lastAttemptAt") ?? ""));
        if (d.get("ok") && at > cutoff) fresh++;
        else old.push(`${titles.get(d.id) ?? d.id} — ${String(d.get("lastAttemptAt")).slice(11, 16)} ok=${d.get("ok")}`);
    });
    console.log(`${subs.size} kanal | son 2 saatte yeni adrese abone: ${fresh}`);
    if (old.length) console.log("Eksik:\n  " + old.join("\n  "));
}
main().then(() => process.exit(0));
