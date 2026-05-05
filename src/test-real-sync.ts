import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });


const testSync = async () => {
    // Dynamically import sync after dotenv config
    const { syncChannel } = await import("./lib/sync");

    const TARGET_CHANNEL = { id: "UCDou5HvsE1AgL8yXzijbfxg", title: "Devrim Akyıl" };
    console.log(`[TEST] Starting real sync test for: ${TARGET_CHANNEL.title}`);

    try {
        const result = await syncChannel(TARGET_CHANNEL.id, TARGET_CHANNEL.title);

        console.log("\n--- SYNC RESULT ---");
        console.log("Success:", result.success);
        console.log("Videos Processed:", result.videosProcessed);
        console.log("Total Findings:", result.totalFindings);

        if (result.logs) {
            console.log("\n--- LOGS ---");
            result.logs.forEach(log => console.log(log));
        }
    } catch (error) {
        console.error("[TEST] Critical Error:", error);
    }

    process.exit(0);
};

testSync();
