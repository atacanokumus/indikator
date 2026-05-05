import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import { syncChannel } from "./lib/sync";

async function forceSync() {
    const channelId = "UCDou5HvsE1AgL8yXzijbfxg"; // Devrim Akyıl
    const channelTitle = "Devrim Akyıl";

    console.log(`[FORCE] Starting sync for ${channelTitle}...`);

    try {
        const result = await syncChannel(channelId, channelTitle);

        if (result.success) {
            console.log(`[FORCE] Success! Processed ${result.videosProcessed} videos.`);
            console.log(`[FORCE] Findings: ${result.totalFindings}`);
        } else {
            console.error(`[FORCE] Failed: ${result.error}`);
            console.log(`Logs:`, result.logs);
        }
    } catch (error) {
        console.error(`[FORCE] Critical error:`, error);
    }
    process.exit(0);
}

forceSync();
