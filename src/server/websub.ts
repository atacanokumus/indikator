/**
 * YouTube WebSub abonelik yönetimi.
 * Google abonelikleri en fazla ~5 gün tutar, o yüzden günlük yeniliyoruz.
 */
import { getChannels, setDocData } from "./repo";

const HUB = "https://pubsubhubbub.appspot.com/subscribe";

function callbackUrl(): string {
    const base = process.env.PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
    if (!base) throw new Error("PUBLIC_SITE_URL tanımlı değil (ör. https://ecotube.com.tr)");
    return `${base.replace(/\/$/, "")}/api/youtube/webhook`;
}

/**
 * Google'ın hub'ı zaman zaman "503 Transient error" döndürüyor (kendi tarafındaki
 * geçici sorun; bizim istek biçimimizle ilgisi yok). Bu yüzden her kanal için
 * üstel geri çekilmeyle birkaç kez deniyoruz.
 */
const MAX_TRIES = 4;

export async function subscribeChannel(channelId: string, mode: "subscribe" | "unsubscribe" = "subscribe") {
    const secret = process.env.WEBSUB_SECRET;
    if (!secret) throw new Error("WEBSUB_SECRET tanımlı değil");

    const params = new URLSearchParams({
        "hub.mode": mode,
        "hub.topic": `https://www.youtube.com/xml/feeds/videos.xml?channel_id=${channelId}`,
        "hub.callback": callbackUrl(),
        "hub.verify": "async",
        "hub.secret": secret,
        "hub.lease_seconds": "432000", // 5 gün
    });

    let status = 0;
    let body = "";

    for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
        if (attempt > 0) {
            const wait = 5000 * Math.pow(2, attempt - 1); // 5s, 10s, 20s
            console.log(`[WEBSUB] ${channelId}: hub ${status} döndü, ${wait / 1000} sn sonra tekrar...`);
            await new Promise((r) => setTimeout(r, wait));
        }
        try {
            const res = await fetch(HUB, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: params.toString(),
                signal: AbortSignal.timeout(30_000),
            });
            status = res.status;
            if (status === 202 || status === 204) break;
            body = (await res.text()).slice(0, 200);
            // 4xx bizim hatamızdır, tekrar denemek anlamsız
            if (status >= 400 && status < 500) break;
        } catch (err) {
            status = 0;
            body = (err as Error).message;
        }
    }

    const ok = status === 202 || status === 204;
    await setDocData("pubsub_subs", channelId, {
        channelId,
        mode,
        lastAttemptAt: new Date().toISOString(),
        lastStatus: status,
        ok,
    });

    if (!ok) throw new Error(`Hub ${status}: ${body}`);
    return true;
}

/** Tüm kanallar için aboneliği yeniler. Tek tek hata toleranslıdır. */
export async function resubscribeAll() {
    const channels = await getChannels();
    const results: { channelId: string; title: string; ok: boolean; error?: string }[] = [];

    for (const ch of channels) {
        try {
            await subscribeChannel(ch.id);
            results.push({ channelId: ch.id, title: ch.title, ok: true });
            console.log(`[WEBSUB] ✓ ${ch.title}`);
        } catch (err) {
            results.push({ channelId: ch.id, title: ch.title, ok: false, error: (err as Error).message });
            console.error(`[WEBSUB] ✗ ${ch.title}: ${(err as Error).message}`);
        }
        await new Promise((r) => setTimeout(r, 300)); // hub'ı yormayalım
    }
    return results;
}
