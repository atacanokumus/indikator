import { YoutubeTranscript } from 'youtube-transcript';

const testLib = async () => {
    const videoId = "ev3QSEszDYY";
    console.log(`Testing youtube-transcript library for: ${videoId}`);
    try {
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        console.log("Success! Length:", transcript.length);
    } catch (e: any) {
        console.error("Failed:", e.message);
    }
};

testLib();
