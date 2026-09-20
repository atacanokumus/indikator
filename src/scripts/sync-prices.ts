/** Takip edilen varlıkların fiyatlarını günceller ve snapshot'ı tazeler. (Manuel/CLI çalıştırma) */
import "./_env";
import { syncPrices } from "@/server/price-sync";

async function main() {
    console.log("[PRICES] güncelleniyor...");
    const { total, updated } = await syncPrices();
    console.log(`[PRICES] ${updated}/${total} güncellendi.`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
