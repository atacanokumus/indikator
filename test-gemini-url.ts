import { analyzeVideoByUrl } from "./src/lib/gemini";
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

async function testGemini() {
    console.log("Testing Gemini URL analysis...");
    try {
        const result = await analyzeVideoByUrl("0JxudU3nYCc"); // some video
        console.log("Result:", result);
    } catch (err) {
        console.error("Error:", err);
    }
}

testGemini();
