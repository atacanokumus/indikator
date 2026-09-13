import { NextRequest, NextResponse } from "next/server";
import Parser from "rss-parser";
import { decodeHtml } from "@/lib/utils";
import { verifyAdminSecret } from "@/server/auth";
import { addChannel, deleteChannel, getChannels } from "@/server/repo";
import { subscribeChannel } from "@/server/websub";

export const runtime = "nodejs";
export const revalidate = 300;

const parser = new Parser();

/** Kanal ID'sini çözer. YouTube Data API kotası tüketmemek için önce RSS dener. */
async function resolveChannel(input: string) {
    const direct = input.match(/(UC[A-Za-z0-9_-]{22})/)?.[1];
    if (direct) return await fromRss(direct);

    // @handle → kanal sayfasından ID ayıkla (API anahtarı gerektirmez)
    const handle = input.match(/@([A-Za-z0-9._-]+)/)?.[1];
    const url = handle ? `https://www.youtube.com/@${handle}` : input;
    const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0", "Accept-Language": "tr-TR,tr;q=0.9" },
    });
    if (!res.ok) throw new Error("Kanal sayfası açılamadı.");
    const html = await res.text();
    const id =
        html.match(/"channelId":"(UC[A-Za-z0-9_-]{22})"/)?.[1] ||
        html.match(/channel\/(UC[A-Za-z0-9_-]{22})/)?.[1];
    if (!id) throw new Error("Kanal ID'si bulunamadı. Kanal linkini kontrol edin.");
    return await fromRss(id);
}

async function fromRss(channelId: string) {
    const feed = await parser.parseURL(
        `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
    );
    if (!feed?.title) throw new Error("Kanal bulunamadı.");
    return { id: channelId, title: decodeHtml(feed.title) };
}

export async function GET() {
    try {
        const channels = await getChannels();
        return NextResponse.json({ success: true, channels });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { url, secret } = await req.json();
        if (!verifyAdminSecret(secret)) {
            return NextResponse.json({ success: false, error: "Yetkisiz erişim." }, { status: 401 });
        }
        if (!url) throw new Error("Kanal linki gerekli.");

        const resolved = await resolveChannel(String(url));
        const channel = {
            id: resolved.id,
            title: resolved.title,
            thumbnail: "",
            totalScore: 100,
            predictionCount: 0,
            successCount: 0,
            weight: 1,
        };
        await addChannel(channel);

        let subscribed = true;
        let subscribeError: string | undefined;
        try {
            await subscribeChannel(resolved.id);
        } catch (err) {
            subscribed = false;
            subscribeError = (err as Error).message;
        }

        return NextResponse.json({ success: true, channel, subscribed, subscribeError });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!verifyAdminSecret(searchParams.get("secret"))) {
            return NextResponse.json({ success: false, error: "Yetkisiz erişim." }, { status: 401 });
        }
        if (!id) throw new Error("ID gerekli.");
        await deleteChannel(id);
        await subscribeChannel(id, "unsubscribe").catch(() => { });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
    }
}
