import { NextResponse } from 'next/server';
import dns from 'dns';
dns.setDefaultResultOrder('ipv6first');

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId') || '9EyvvsFRovw';

    try {
        const htmlRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
            headers: { "Accept-Language": "en-US" }
        });
        const html = await htmlRes.text();

        const apiKeyMatch = html.match(/"INNERTUBE_API_KEY":\s*"([a-zA-Z0-9_-]+)"/);
        if (!apiKeyMatch) return NextResponse.json({ error: "No API KEY" });

        const res = await fetch(`https://www.youtube.com/youtubei/v1/player?key=${apiKeyMatch[1]}`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "com.google.android.youtube/17.36.4 (Linux; U; Android 12; en_US; Pixel 6 Build/SD1A.210817.036)"
            },
            body: JSON.stringify({
                context: {
                    client: {
                        clientName: "ANDROID",
                        clientVersion: "20.10.38"
                    }
                },
                videoId: videoId
            })
        });

        const data = await res.json();
        return NextResponse.json({
            status: data.playabilityStatus?.status,
            captions: !!data.captions
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message });
    }
}
