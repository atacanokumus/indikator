import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    try {
        // Unfortunately, the Node SDK doesn't expose listModels directly. Let's make an HTTP request.
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await res.json();
        console.log(data.models.map((m: any) => m.name).filter((n: string) => n.includes("gemini")));
    } catch (e) {
        console.error(e);
    }
}
listModels();
