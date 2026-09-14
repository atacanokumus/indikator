/**
 * Haftalık bülteni üretir. GitHub Actions her pazartesi çalıştırır.
 * Kullanım: npx tsx src/scripts/build-bulletin.ts
 */
import "./_env";
import { writeBulletin } from "@/server/bulletin";

writeBulletin()
    .then((b) => {
        console.log(`[BÜLTEN] ${b.id} yazıldı: /bulten/${b.id}`);
        process.exit(0);
    })
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
