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

    const res = await fetch(HUB, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
    });

    const ok = res.status === 202 || res.status === 204;
    await setDocData("pubsub_subs", channelId, {
        channelId,
        mode,
        lastAttemptAt: new Date().toISOString(),
        lastStatus: res.status,
        ok,
    });

    if (!ok) {
        throw new Error(`Hub ${res.status}: ${(await res.text()).slice(0, 200)}`);
    }
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
