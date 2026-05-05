import { YoutubeTranscript } from 'youtube-transcript';

async function run() {
    try {
        // Test a highly popular English video that definitely has English transcripts (Rickroll)
        console.log("Testing Rickroll (dQw4w9WgXcQ)...");
        const rickroll = await YoutubeTranscript.fetchTranscript('dQw4w9WgXcQ');
        console.log("Rickroll Success! Length:", rickroll.length);

        // Test Özgür Demirtaş's latest video (from the user logs: hR-6R9_V4JM)
        console.log("\nTesting Özgür Demirtaş (hR-6R9_V4JM)...");
        const ozgur = await YoutubeTranscript.fetchTranscript('hR-6R9_V4JM', { lang: 'tr' }).catch(() => YoutubeTranscript.fetchTranscript('hR-6R9_V4JM'));
        console.log("Özgür Success! Length:", ozgur.length);

        // Test Devrim Akyıl's video (9EyvvsFRovw)
        console.log("\nTesting Devrim Akyıl (9EyvvsFRovw)...");
        const devrim = await YoutubeTranscript.fetchTranscript('9EyvvsFRovw', { lang: 'tr' });
        console.log("Devrim Success! Length:", devrim.length);
        
    } catch(e: any) {
        console.error("Error:", e.message);
    }
}
run();
