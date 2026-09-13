/**
 * Takip listesine kanal ekler ve anlık bildirim aboneliğini başlatır.
 *   npx tsx src/scripts/add-channel.ts UCxxxxxxxxxxxx
 */
import "./_env";
import Parser from "rss-parser";
import { addChannel } from "@/server/repo";
import { subscribeChannel } from "@/server/websub";

const parser = new Parser();

async function main() {
    const channelId = process.argv[2];
    if (!channelId?.startsWith("UC")) {
        console.error("UC ile başlayan bir YouTube Channel ID verin.");
        process.exit(1);
    }

    const feed = await parser.parseURL(
        `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
    );
    if (!feed?.title) throw new Error("Kanal RSS üzerinden bulunamadı.");

    await addChannel({
        id: channelId,
        title: feed.title,
        totalScore: 100,
        predictionCount: 0,
        successCount: 0,
        weight: 1,
    });
    console.log(`✓ Eklendi: ${feed.title}`);

    try {
        await subscribeChannel(channelId);
        console.log("✓ Anlık bildirim aboneliği istendi.");
    } catch (err) {
        console.warn(`! Abonelik kurulamadı (yedek tarama devrede): ${(err as Error).message}`);
    }
}

main().then(() => process.exit(0)).catch((e) => { console.error(e.message); process.exit(1); });
