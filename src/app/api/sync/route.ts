import { NextResponse } from "next/server";
import { verifyAdminSecret } from "@/server/auth";
import { getChannel } from "@/server/repo";
import { syncVideo } from "@/server/sync";
import { writeHomeSnapshot } from "@/server/snapshot";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Admin panelinden manuel tetikleme.
 * NOT: Vercel ücretsiz planda 60 saniye sınırı vardır. Uzun analizler için
 * GitHub Actions iş akışını kullanın (Anlık Video Analizi > Run workflow).
 */
export async function POST(request: Request) {
    try {
        const { videoId, channelId, secret } = await request.json();
        if (!verifyAdminSecret(secret)) {
            return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
        }
        if (!videoId || !channelId) {
            return NextResponse.json({ error: "videoId ve channelId gerekli." }, { status: 400 });
        }

        const channel = await getChannel(channelId);
        if (!channel) return NextResponse.json({ error: "Kanal bulunamadı." }, { status: 404 });

        const result = await syncVideo(videoId, channelId, channel.title, channel.thumbnail);
        if (result.totalFindings > 0) await writeHomeSnapshot();
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
