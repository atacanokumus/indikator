import { NextResponse } from "next/server";
import { getChannels, checkVideoAnalysisExists } from "@/lib/firestore";
import { getChannelVideos } from "@/services/youtube";
import { syncVideo } from "@/lib/sync";
import { Evaluator } from "@/services/evaluator";

// Vercel Free (Hobby) plan: max 60 saniye
export const maxDuration = 60;

export async function GET(request: Request) {
    const startTime = Date.now();
    const TIME_LIMIT = 50000; // 50 saniyede dur

    try {
        console.log(`[CRON API] Sync Started: ${new Date().toLocaleString('tr-TR')}`);

        const authHeader = request.headers.get('authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const channels = await getChannels();
        if (channels.length === 0) {
            return NextResponse.json({ success: true, message: "No channels found" });
        }

        // Phase 1: RSS'leri tara, yeni videoları bul
        console.log(`[CRON API] Scanning ${channels.length} channels...`);
        const newVideos: { videoId: string; title: string; channelId: string; channelTitle: string; channelThumbnail?: string }[] = [];

        for (const channel of channels) {
            if ((Date.now() - startTime) > TIME_LIMIT) break;
            try {
                const videos = await getChannelVideos(channel.id);
                for (const video of videos.slice(0, 3)) {
                    const exists = await checkVideoAnalysisExists(video.id);
                    if (!exists) {
                        newVideos.push({
                            videoId: video.id,
                            title: video.title,
                            channelId: channel.id,
                            channelTitle: channel.title,
                            channelThumbnail: channel.thumbnail
                        });
                    }
                }
            } catch (err: any) {
                console.error(`[CRON API] RSS error for ${channel.title}: ${err.message}`);
            }
        }

        console.log(`[CRON API] Found ${newVideos.length} new videos.`);

        // Phase 2: Yeni videoları analiz et — kalan zaman bütçesi kadar
        // Transcript yolu hızlı (~8s), video URL yavaş (~40s)
        // Transkript çalışırsa 60 saniyede 4-5 video analiz edilebilir
        let analyzedCount = 0;
        let totalFindings = 0;
        let skippedCount = 0;

        for (const video of newVideos) {
            const elapsed = Date.now() - startTime;
            if (elapsed > TIME_LIMIT) {
                skippedCount = newVideos.length - newVideos.indexOf(video);
                console.log(`[CRON API] Time limit reached (${(elapsed/1000).toFixed(1)}s). ${skippedCount} videos remaining.`);
                break;
            }

            console.log(`[CRON API] >>> Analyzing: ${video.title} (${video.videoId})...`);
            try {
                const result = await syncVideo(video.videoId, video.channelId, video.channelTitle, video.channelThumbnail);
                if (result.success && (result.videosProcessed || 0) > 0) {
                    analyzedCount += result.videosProcessed || 0;
                    totalFindings += result.totalFindings || 0;
                    console.log(`[CRON API] +++ ${video.title}: ${result.totalFindings} findings`);
                }
            } catch (err: any) {
                console.error(`[CRON API] --- Failed: ${err.message}`);
            }
        }

        // Phase 3: Tahminleri değerlendir
        if ((Date.now() - startTime) < TIME_LIMIT) {
            try {
                await Evaluator.evaluatePendingPredictions();
            } catch (err: any) {
                console.error(`[CRON API] Evaluator error: ${err.message}`);
            }
        }

        const duration = Date.now() - startTime;
        console.log(`[CRON API] Done in ${(duration/1000).toFixed(1)}s. Analyzed: ${analyzedCount}, Findings: ${totalFindings}`);
        return NextResponse.json({
            success: true,
            totalProcessed: analyzedCount,
            totalFindings,
            newVideosFound: newVideos.length,
            skippedDueToTime: skippedCount,
            durationMs: duration
        });
    } catch (error: any) {
        console.error("[CRON API] Critical Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
