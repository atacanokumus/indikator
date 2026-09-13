/**
 * YouTube PubSubHubbub (WebSub) push alıcısı — ANLIK GÜNCELLEME.
 *
 * Kanal video yayınladığı anda Google buraya POST atar (saniyeler içinde).
 * Biz de analiz işini GitHub Actions'a devrederiz (repository_dispatch),
 * çünkü Vercel ücretsiz planda fonksiyonlar 60 saniyede kesilir; analiz ise
 * dakikalar sürebilir. Bu kurgunun ek maliyeti yoktur.
 *
 * GET  : Google'ın abonelik doğrulaması (hub.challenge geri yansıtılır)
 * POST : Yeni/güncellenen video bildirimi (Atom XML)
 */
import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ----------------------- Abonelik doğrulama (GET) ----------------------- */

export async function GET(request: Request) {
    const url = new URL(request.url);
    const mode = url.searchParams.get("hub.mode");
    const topic = url.searchParams.get("hub.topic");
    const challenge = url.searchParams.get("hub.challenge");

    if (!challenge) return new NextResponse("Bad Request", { status: 400 });

    // Sadece YouTube feed topic'lerini kabul et
    if (!topic || !topic.startsWith("https://www.youtube.com/xml/feeds/videos.xml")) {
        return new NextResponse("Forbidden topic", { status: 403 });
    }
    if (mode !== "subscribe" && mode !== "unsubscribe") {
        return new NextResponse("Bad mode", { status: 400 });
    }

    console.log(`[WEBSUB] ${mode} doğrulandı: ${topic}`);
    return new NextResponse(challenge, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
    });
}

/* ------------------------- Video bildirimi (POST) ------------------------ */

function verifySignature(body: string, header: string | null): boolean {
    const secret = process.env.WEBSUB_SECRET;
    // Secret tanımlı değilse imza doğrulaması yapılamaz — güvenli tarafta kal.
    if (!secret) {
        console.error("[WEBSUB] WEBSUB_SECRET tanımlı değil, bildirim reddedildi.");
        return false;
    }
    if (!header) return false;

    const [algo, sent] = header.split("=");
    if (!algo || !sent) return false;
    try {
        const expected = createHmac(algo, secret).update(body).digest("hex");
        const a = Buffer.from(expected, "hex");
        const b = Buffer.from(sent, "hex");
        return a.length === b.length && timingSafeEqual(a, b);
    } catch {
        return false;
    }
}

function pick(xml: string, tag: string): string | null {
    const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
    return m ? m[1].trim() : null;
}

export async function POST(request: Request) {
    const body = await request.text();

    if (!verifySignature(body, request.headers.get("x-hub-signature"))) {
        console.warn("[WEBSUB] Geçersiz imza, istek reddedildi.");
        return new NextResponse("Invalid signature", { status: 403 });
    }

    // Silme bildirimlerini yoksay
    if (body.includes("<at:deleted-entry")) {
        return new NextResponse("OK", { status: 200 });
    }

    const entry = body.match(/<entry>([\s\S]*?)<\/entry>/)?.[1];
    if (!entry) return new NextResponse("OK", { status: 200 });

    const videoId = pick(entry, "yt:videoId");
    const channelId = pick(entry, "yt:channelId");
    const title = pick(entry, "title") || "";
    const published = pick(entry, "published") || new Date().toISOString();
    const updated = pick(entry, "updated") || published;

    if (!videoId || !channelId) return new NextResponse("OK", { status: 200 });

    // YouTube başlık/açıklama düzenlemelerinde de bildirim atar.
    // Yayın tarihi çok eskiyse (>3 gün) bu bir güncellemedir, analiz etme.
    const ageDays = (Date.now() - new Date(published).getTime()) / 864e5;
    if (ageDays > 3) {
        console.log(`[WEBSUB] ${videoId} eski bir videonun güncellemesi (${ageDays.toFixed(1)} gün), atlanıyor.`);
        return new NextResponse("OK", { status: 200 });
    }

    console.log(`[WEBSUB] Yeni video: ${title} (${videoId}) — analiz kuyruğa alınıyor`);

    // Analizi GitHub Actions'a devret. Yanıtı bekletmeyelim ama hatayı görelim.
    try {
        await dispatchToGitHub({ videoId, channelId, title, publishedAt: published, updatedAt: updated });
    } catch (err) {
        console.error("[WEBSUB] GitHub tetikleme hatası:", (err as Error).message);
        // 200 döndürüyoruz: aksi halde Google tekrar tekrar dener.
        // Yedek olarak 15 dakikalık tarama bu videoyu zaten yakalar.
    }

    return new NextResponse("OK", { status: 200 });
}

async function dispatchToGitHub(payload: Record<string, string>) {
    const token = process.env.GITHUB_DISPATCH_TOKEN;
    const repo = process.env.GITHUB_REPO; // ör: atacanokumus/indikator
    if (!token || !repo) throw new Error("GITHUB_DISPATCH_TOKEN / GITHUB_REPO tanımlı değil");

    const res = await fetch(`https://api.github.com/repos/${repo}/dispatches`, {
        method: "POST",
        headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${token}`,
            "X-GitHub-Api-Version": "2022-11-28",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ event_type: "new-video", client_payload: payload }),
    });

    if (!res.ok) {
        throw new Error(`GitHub ${res.status}: ${(await res.text()).slice(0, 200)}`);
    }
}
