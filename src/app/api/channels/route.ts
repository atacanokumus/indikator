import { NextRequest, NextResponse } from "next/server";
import { getChannels, addChannel, deleteChannel } from "@/lib/firestore";
import { Timestamp } from "firebase/firestore";
import { decodeHtml } from "@/lib/utils";
import { AdminService } from "@/services/admin-service";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

async function resolveChannelUrl(url: string) {
    let handle = "";
    if (url.includes("@")) {
        handle = "@" + url.split("@")[1].split("/")[0].split("?")[0];
    } else if (url.includes("/channel/")) {
        const id = url.split("/channel/")[1].split("/")[0].split("?")[0];
        return { id };
    } else if (url.includes("/user/")) {
        const username = url.split("/user/")[1].split("/")[0].split("?")[0];
        // Need to search by forUsername
        const resp = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet&forUsername=${username}&key=${YOUTUBE_API_KEY}`);
        const data = await resp.json();
        if (data.items?.length > 0) return {
            id: data.items[0].id,
            title: decodeHtml(data.items[0].snippet.title),
            thumbnail: data.items[0].snippet.thumbnails?.default?.url
        };
    }

    if (handle) {
        // Search by handle (using search or channels list with forHandle if supported, but search is more reliable for general handles)
        const resp = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${handle}&type=channel&maxResults=1&key=${YOUTUBE_API_KEY}`);
        const data = await resp.json();
        if (data.items?.length > 0) {
            return {
                id: data.items[0].snippet.channelId,
                title: decodeHtml(data.items[0].snippet.channelTitle),
                thumbnail: data.items[0].snippet.thumbnails?.default?.url
            };
        }
    }

    // Fallback search for general strings if it's not a clear URL
    const query = url.replace("https://www.youtube.com/", "").replace("youtube.com/", "");
    const resp = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=channel&maxResults=1&key=${YOUTUBE_API_KEY}`);
    const data = await resp.json();
    if (data.items?.length > 0) {
        return {
            id: data.items[0].snippet.channelId,
            title: decodeHtml(data.items[0].snippet.channelTitle),
            thumbnail: data.items[0].snippet.thumbnails?.default?.url
        };
    }

    return null;
}

export async function GET() {
    try {
        const channels = await getChannels();
        return NextResponse.json({ success: true, channels });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { url, secret } = await req.json();

        // Security check
        const isValid = await AdminService.verifySecret(secret);
        if (!isValid) return NextResponse.json({ success: false, error: "Yetkisiz erişim. Lütfen admin girişi yapın." }, { status: 401 });

        if (!url) throw new Error("URL gerekli");

        const resolved = await resolveChannelUrl(url);
        if (!resolved || !resolved.id) throw new Error("Kanal bulunamadı. Lütfen geçerli bir YouTube kanal linki girin.");

        // If title wasn't found in resolve, fetch it now
        let title = resolved.title;
        let thumbnail = (resolved as any).thumbnail;
        if (!title || !thumbnail) {
            const resp = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${resolved.id}&key=${YOUTUBE_API_KEY}`);
            const data = await resp.json();
            if (data.items?.length > 0) {
                title = title || decodeHtml(data.items[0].snippet.title);
                thumbnail = thumbnail || data.items[0].snippet.thumbnails?.default?.url;
            }
        }

        const channelData = {
            id: resolved.id,
            title: title || "Bilinmeyen Kanal",
            thumbnail: thumbnail,
            handle: url.includes("@") ? "@" + url.split("@")[1].split("/")[0] : undefined,
            addedAt: Timestamp.now()
        };

        await addChannel(channelData);
        return NextResponse.json({ success: true, channel: channelData });
    } catch (error: any) {
        console.error("API POST Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const secret = searchParams.get("secret");

        // Security check
        const isValid = await AdminService.verifySecret(secret || "");
        if (!isValid) return NextResponse.json({ success: false, error: "Yetkisiz erişim. Lütfen admin girişi yapın." }, { status: 401 });

        if (!id) throw new Error("ID gerekli");

        await deleteChannel(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
