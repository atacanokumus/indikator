import { syncChannel, syncVideo } from "@/lib/sync";
import { AdminService } from "@/services/admin-service";
import { NextResponse } from "next/server";

// Vercel Free (Hobby) plan: max 60 saniye
export const maxDuration = 60;

export async function POST(request: Request) {
    try {
        const { channelId, channelTitle, channelThumbnail, videoId, action, secret } = await request.json();

        // Security Check
        const isValid = await AdminService.verifySecret(secret);
        if (!isValid) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (action === "manual-video" && videoId && channelId && channelTitle) {
            const result = await syncVideo(videoId, channelId, channelTitle, channelThumbnail);
            return NextResponse.json(result);
        }

        if (!channelId || !channelTitle) {
            return NextResponse.json({ error: "Missing channelId or channelTitle" }, { status: 400 });
        }

        const result = await syncChannel(channelId, channelTitle, channelThumbnail);
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message, logs: [error.message] }, { status: 500 });
    }
}
