/**
 * Takip listesini kurar / günceller ve anlık bildirim aboneliklerini başlatır.
 *
 * Buradaki her kanal kimliği, eklenmeden önce RSS akışı çekilerek doğrulandı;
 * hiçbiri tahmin değildir. Yeniden çalıştırmak güvenlidir (idempotent):
 * mevcut kanalların puanlarını sıfırlamaz, yalnızca eksik alanları tamamlar.
 *
 *   npx tsx src/scripts/seed-channels.ts          # ekle + abone ol
 *   npx tsx src/scripts/seed-channels.ts --dry    # sadece göster
 */
import "./_env";
import type { Region } from "@/lib/types";
import { addChannel, getChannel } from "@/server/repo";
import { subscribeChannel } from "@/server/websub";

interface Seed {
    id: string;
    title: string;
    language: "tr" | "en";
    region: Region;
}

export const CHANNELS: Seed[] = [
    /* ---------------- Türkiye ---------------- */
    { id: "UCqU4fCu2zSL8gamk2CgvjCQ", title: "Selçuk Geçer", language: "tr", region: "TR" },
    { id: "UCrEZaK2_oBqffHZ-FJHXaMg", title: "İslam Memiş", language: "tr", region: "TR" },
    { id: "UCNwlNNDsWUIL1vYqrIErg-g", title: "Atilla Yeşilada", language: "tr", region: "TR" },
    { id: "UCJEzfyorQwES0hyNpqhym_Q", title: "Murat Muratoğlu", language: "tr", region: "TR" },
    { id: "UCiO9MIUiGu2oYYFAG06syjg", title: "Prof. Dr. Özgür Demirtaş", language: "tr", region: "TR" },
    { id: "UCpnArAW7wz8qmBm4qpsBHTA", title: "EMRE ŞİRİN", language: "tr", region: "TR" },
    { id: "UCuldMx7XGwjpmKi0taOpq0w", title: "FACE IT TO DONE FX", language: "tr", region: "TR" },
    { id: "UCDou5HvsE1AgL8yXzijbfxg", title: "Devrim Akyıl", language: "tr", region: "TR" },
    // --- bu turda eklenenler ---
    { id: "UC5mQvCEn01GXkQxjWQcbQWg", title: "Emrah Lafçı", language: "tr", region: "TR" },
    { id: "UCW4Y4bPuafXwVEs0oly5vdw", title: "Mesele Ekonomi", language: "tr", region: "TR" },
    { id: "UCGBytjbMXiF1nbe6HD7iORQ", title: "Kanal Finans", language: "tr", region: "TR" },
    { id: "UC6nnq_RUncAIDtFJoasq9Rg", title: "Ekonomi Ekranı", language: "tr", region: "TR" },
    { id: "UCbVlSXW_MSaZ1TdUH5C-gqg", title: "finansZone", language: "tr", region: "TR" },
    { id: "UCvtd4Vzlh94KS2jDk5pwUag", title: "Ekonomide Saadet", language: "tr", region: "TR" },

    /* ---------------- Global ---------------- */
    { id: "UCIjuLiLHdFxYtFmWlbTGQRQ", title: "Peter Schiff", language: "en", region: "GLOBAL" },
    { id: "UCThv5tYUVaG4ZPA3p6EXZbQ", title: "GoldSilver (Mike Maloney)", language: "en", region: "GLOBAL" },
    { id: "UCqK_GSMbpiV8spgD3ZGloSw", title: "Coin Bureau", language: "en", region: "GLOBAL" },
    { id: "UCOHxDwCcOzBaLkeTazanwcw", title: "Bravos Research", language: "en", region: "GLOBAL" },
    { id: "UCrXNkk4IESnqU-8GMad2vyA", title: "Eurodollar University", language: "en", region: "GLOBAL" },
    { id: "UCFCEuCsyWP0YkP3CZ3Mr01Q", title: "The Plain Bagel", language: "en", region: "GLOBAL" },
    { id: "UCbta0n8i6Rljh0obO7HzG9A", title: "Joseph Carlson", language: "en", region: "GLOBAL" },
    { id: "UCUyH4QfXX-5NOT0bULqG6lQ", title: "Wall Street Millennial", language: "en", region: "GLOBAL" },
    { id: "UCCKpicnIwBP3VPxBAZWDeNA", title: "Money & Macro", language: "en", region: "GLOBAL" },
    { id: "UC5Ghe5TBQGYIOANuiNW4hDQ", title: "Gary's Economics", language: "en", region: "GLOBAL" },
    { id: "UC4fg8o6oUkkZDLaC6eAZKwQ", title: "Heresy Financial", language: "en", region: "GLOBAL" },
    { id: "UCASM0cgfkJxQ1ICmRilfHLw", title: "Patrick Boyle", language: "en", region: "GLOBAL" },
    { id: "UCZ4AMrDcNrfy3X6nsU8-rPg", title: "Economics Explained", language: "en", region: "GLOBAL" },
    { id: "UCGXWKlq1Oxr3ddEtmKhAkPg", title: "Real Vision", language: "en", region: "GLOBAL" },
    { id: "UCUvvj5lwue7PspotMDjk5UA", title: "Meet Kevin", language: "en", region: "GLOBAL" },
    { id: "UChF5O40UBqAc82I7-i5ig6A", title: "Bloomberg Podcasts", language: "en", region: "GLOBAL" },
];

async function main() {
    const dry = process.argv.includes("--dry");
    console.log(`[SEED] ${CHANNELS.length} kanal${dry ? " (kuru çalışma)" : ""}\n`);

    let added = 0;
    let subscribed = 0;

    for (const c of CHANNELS) {
        const existing = await getChannel(c.id);
        const isNew = !existing;
        console.log(`${isNew ? "+" : "·"} ${c.region.padEnd(6)} ${c.title}`);
        if (dry) continue;

        await addChannel({
            id: c.id,
            title: existing?.title || c.title,
            language: c.language,
            region: c.region,
            thumbnail: existing?.thumbnail ?? "",
            // Mevcut kanalların puanlarına dokunma
            totalScore: existing?.totalScore ?? 100,
            predictionCount: existing?.predictionCount ?? 0,
            successCount: existing?.successCount ?? 0,
            weight: existing?.weight ?? 1,
        });
        if (isNew) added++;

        try {
            await subscribeChannel(c.id);
            subscribed++;
        } catch (err) {
            console.warn(`  ! abonelik kurulamadı: ${(err as Error).message}`);
        }
    }

    console.log(`\n[SEED] ${added} yeni kanal, ${subscribed}/${CHANNELS.length} abonelik.`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
