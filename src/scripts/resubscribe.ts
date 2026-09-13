/** YouTube push aboneliklerini yeniler (lease ~5 gün, günlük çalıştırılır). */
import "./_env";
import { resubscribeAll } from "@/server/websub";

resubscribeAll()
    .then((r) => {
        const ok = r.filter((x) => x.ok).length;
        console.log(`[WEBSUB] ${ok}/${r.length} kanal aboneliği yenilendi.`);
        process.exit(r.length > 0 && ok === 0 ? 1 : 0);
    })
    .catch((e) => { console.error(e); process.exit(1); });
