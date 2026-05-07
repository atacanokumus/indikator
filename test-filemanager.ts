import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function testFileManager() {
    console.log("Testing GoogleAIFileManager...");
    try {
        const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY!);
        console.log("FileManager initialized successfully.");
    } catch (e) {
        console.error("Failed to initialize FileManager:", e);
    }
}
testFileManager();
