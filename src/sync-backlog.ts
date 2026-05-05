import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import { getChannels } from "./lib/firestore";
import { getChannelVideos } from "./services/youtube";
import { syncVideo } from "./lib/sync";
import { db } from "./lib/firebase";

const TARGET_DATE = new Date("2026-02-21T00:00:00Z");

const runCatchUp = async () => {
    console.log(`\n🚀 [BACKLOG SYNC] 21 Şubat'tan itibaren olan videolar taranıyor...\n`);

    try {
        const channels = await getChannels();
        if (!db) {
             // Already handled by getChannels log but for TS safety
             return;
        }
        if (channels.length === 0) {
            console.log("[BACKLOG] Takip edilen kanal bulunamadı.");
            return;
        }

        let totalProcessed = 0;
        let totalFindings = 0;

        for (const channel of channels) {
            console.log(`\n>>> Kanal: ${channel.title} kontrol ediliyor...`);

            try {
                // RSS'ten en son 15 videoyu (maksimum) al, `getChannelVideos` default olarak dilimleniyorsa limitini artırmamız gerekebilir.
                // Şimdilik standart fonksiyonu kullanıyoruz (zaten YouTube RSS feed genelde son 15 videoyu verir)
                const videos = await getChannelVideos(channel.id, (m) => console.log(`  ${m}`));

                const videosToSync = videos.filter(v => {
                    const pubDate = new Date(v.publishedAt);
                    return pubDate >= TARGET_DATE;
                });

                console.log(`  Bulunan video sayısı: ${videos.length}, 21 Şubat sonrası olanlar: ${videosToSync.length}`);

                for (const video of videosToSync) {
                    console.log(`\n  --- Video: ${video.title} (${video.publishedAt}) işleniyor ---`);
                    const result = await syncVideo(video.id, channel.id, channel.title, channel.thumbnail);

                    if (result.success) {
                        totalProcessed += result.videosProcessed || 0;
                        totalFindings += result.totalFindings || 0;
                        console.log(`  ✅ Başarılı. Bulgu: ${result.totalFindings}`);
                    } else {
                        console.log(`  ❌ Başarısız: ${result.error}`);
                    }
                }

            } catch (err: any) {
                console.error(`  ❌ Kanal okuma hatası: ${err.message}`);
            }
        }

        console.log(`\n🎉 [BACKLOG SYNC] TAMAMLANDI!`);
        console.log(`Toplam analiz edilen video: ${totalProcessed}`);
        console.log(`Toplam bulunan sinyal: ${totalFindings}\n`);

    } catch (error) {
        console.error("[BACKLOG SYNC] Kritik Hata:", error);
    }
};

runCatchUp();
