import { db } from "../lib/firebase";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import Parser from "rss-parser";

const parser = new Parser();

async function addYouTubeChannel(channelId: string) {
    if (!channelId) {
        console.error("Lütfen bir YouTube Channel ID belirtin. Örn: UCqU4fCu2zSL8gamk2CgvjCQ");
        process.exit(1);
    }

    console.log(`[ADMIN] Kanal bilgileri çekiliyor: ${channelId}...`);

    try {
        const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
        const feed = await parser.parseURL(rssUrl);

        if (!feed || !feed.title) {
            throw new Error("Kanal başlığı RSS üzerinden alınamadı.");
        }

        const channelTitle = feed.title;
        console.log(`[ADMIN] Kanal Bulundu: ${channelTitle}`);

        const channelData = {
            id: channelId,
            title: channelTitle,
            addedAt: Timestamp.now(),
            totalScore: 0,
            predictionCount: 0,
            successRate: 0,
            weight: 1
        };

        await setDoc(doc(db!, "channels", channelId), channelData);

        console.log("--------------------------------------------------");
        console.log(`BAŞARILI: ${channelTitle} sisteme eklendi!`);
        console.log(`Artık cron job bir sonraki taramada bu kanalı otomatik olarak inceleyecektir.`);
        console.log("--------------------------------------------------");

    } catch (error: any) {
        console.error(`[HATA] Kanal eklenemedi: ${error.message}`);
        if (error.message.includes("404")) {
            console.error("İpucu: Channel ID hatalı olabilir. Lütfen 'UC' ile başlayan ID'yi kullandığınızdan emin olun.");
        }
        process.exit(1);
    }
}

const targetChannelId = process.argv[2];
addYouTubeChannel(targetChannelId).then(() => process.exit(0));
