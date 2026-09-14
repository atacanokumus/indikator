/**
 * HAFTALIK KONSENSÜS BÜLTENİ
 *
 * Site canlı bir sayaç; bülten ise o sayacın haftalık fotoğrafı ve —asıl
 * değerli kısmı— bir önceki fotoğrafla FARKI. "Bu hafta altında kaç kişi
 * yön değiştirdi" sorusunun cevabı hiçbir yerde yok; bizde var, çünkü
 * geçmiş görüşleri saklıyoruz.
 *
 * Her bülten kendi adresinde kalıcı bir sayfa olur: arama motoru için
 * düzenli taze içerik, okuyucu için geri gelme sebebi.
 *
 * Bültenler de tavsiye vermez; ne olduğunu anlatır.
 */
import { normalizeAsset } from "@/lib/asset-utils";
import { ASSET_LABEL } from "@/lib/display";
import type { Recommendation, Tally, VideoAnalysis } from "@/lib/types";
import { toIso } from "@/lib/types";
import { getAnalysesSince, getChannels, getDocData, setDocData } from "./repo";

const ORDER: Recommendation[] = ["AL", "SAT", "TUT", "GÖZLEMLE"];

export interface BulletinAsset {
    asset: string;
    tally: Tally;
    total: number;
    leading: Recommendation;
    /** Geçen haftaki baskın yön — yoksa null (varlık ilk kez görülüyor). */
    previousLeading: Recommendation | null;
}

export interface BulletinChange {
    channelTitle: string;
    asset: string;
    from: Recommendation;
    to: Recommendation;
    videoId: string;
    date: string;
}

export interface Bulletin {
    id: string;
    weekLabel: string;
    generatedAt: string;
    periodStart: string;
    periodEnd: string;
    videoCount: number;
    signalCount: number;
    channelCount: number;
    /** Bu hafta baskın yönü değişen varlıklar. */
    flips: BulletinAsset[];
    /** En çok konuşulan varlıklar. */
    busiest: BulletinAsset[];
    /** Fikir değiştiren analistler. */
    changes: BulletinChange[];
    /** Bir sonraki bültenin karşılaştırma yapabilmesi için. */
    leadingByAsset: Record<string, Recommendation>;
}

/** ISO hafta kimliği: 2026-W38 */
export function weekId(d: Date): string {
    const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const day = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((t.getTime() - yearStart.getTime()) / 864e5) + 1) / 7);
    return `${t.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function leadingOf(tally: Tally, fallback: Recommendation): Recommendation {
    let best = fallback;
    let count = tally[fallback] ?? 0;
    for (const rec of ORDER) {
        if ((tally[rec] ?? 0) > count) { best = rec; count = tally[rec] ?? 0; }
    }
    return best;
}

export async function buildBulletin(now = new Date()): Promise<Bulletin> {
    const id = weekId(now);
    const periodEnd = now.toISOString();
    const periodStart = new Date(now.getTime() - 7 * 864e5).toISOString();

    const [videos, channels, previous] = await Promise.all([
        getAnalysesSince(7, 400),
        getChannels(),
        // Önceki bülten: karşılaştırma bunun üzerinden yapılır.
        getDocData<Bulletin>("bulletins", "latest"),
    ]);
    const titleOf = new Map(channels.map((c) => [c.id, c.title]));

    const byAsset = new Map<string, { tally: Tally; latest: Map<string, { rec: Recommendation; date: string }> }>();
    const changes: BulletinChange[] = [];
    const seenChannels = new Set<string>();
    let signalCount = 0;

    // Haftanın sinyalleri, (varlık, kanal) bazında en güncel görüş
    const sorted = [...(videos as VideoAnalysis[])].sort(
        (a, b) => toIso(a.publishedAt).localeCompare(toIso(b.publishedAt))
    );

    for (const video of sorted) {
        const date = toIso(video.publishedAt);
        seenChannels.add(video.channelId);
        for (const r of video.results || []) {
            const asset = normalizeAsset(r.asset);
            if (!asset) continue;
            signalCount++;

            let entry = byAsset.get(asset);
            if (!entry) {
                entry = { tally: { AL: 0, SAT: 0, TUT: 0, "GÖZLEMLE": 0 }, latest: new Map() };
                byAsset.set(asset, entry);
            }

            const prior = entry.latest.get(video.channelId);
            if (prior && prior.rec !== r.recommendation) {
                changes.push({
                    channelTitle: titleOf.get(video.channelId) || video.channelTitle,
                    asset,
                    from: prior.rec,
                    to: r.recommendation,
                    videoId: video.videoId,
                    date,
                });
            }
            entry.latest.set(video.channelId, { rec: r.recommendation, date });
        }
    }

    // Sayım: kanal başına tek görüş (en günceli)
    const assets: BulletinAsset[] = [];
    for (const [asset, entry] of byAsset) {
        const tally: Tally = { AL: 0, SAT: 0, TUT: 0, "GÖZLEMLE": 0 };
        for (const { rec } of entry.latest.values()) tally[rec] = (tally[rec] ?? 0) + 1;
        const total = entry.latest.size;
        if (total === 0) continue;

        // Serbest metin artıklarını ele (ana sayfadakiyle aynı kural)
        const known = !!ASSET_LABEL[asset] || total >= 2 || /^[A-Z0-9.=/-]{2,10}$/.test(asset);
        if (!known) continue;

        const leading = leadingOf(tally, ORDER.find((r) => tally[r] > 0) ?? "GÖZLEMLE");
        assets.push({
            asset,
            tally,
            total,
            leading,
            previousLeading: previous?.leadingByAsset?.[asset] ?? null,
        });
    }

    assets.sort((a, b) => b.total - a.total);

    const flips = assets.filter(
        (a) => a.previousLeading && a.previousLeading !== a.leading && a.total >= 2
    );

    const leadingByAsset: Record<string, Recommendation> = {};
    for (const a of assets) leadingByAsset[a.asset] = a.leading;

    const fmt = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long" });
    const weekLabel = `${fmt.format(new Date(periodStart))} – ${fmt.format(new Date(periodEnd))}`;

    return {
        id,
        weekLabel,
        generatedAt: new Date().toISOString(),
        periodStart,
        periodEnd,
        videoCount: videos.length,
        signalCount,
        channelCount: seenChannels.size,
        flips,
        busiest: assets.slice(0, 12),
        changes: changes.slice(-25).reverse(),
        leadingByAsset,
    };
}

export async function writeBulletin(now = new Date()): Promise<Bulletin> {
    const bulletin = await buildBulletin(now);
    await setDocData("bulletins", bulletin.id, bulletin as unknown as Record<string, unknown>);
    await setDocData("bulletins", "latest", bulletin as unknown as Record<string, unknown>);

    // Dizin: bülten listesi sayfası tek doküman okuyarak çalışsın.
    const index = (await getDocData<{ items: { id: string; weekLabel: string; signalCount: number }[] }>(
        "bulletins", "index"
    )) ?? { items: [] };
    const items = index.items.filter((i) => i.id !== bulletin.id);
    items.unshift({ id: bulletin.id, weekLabel: bulletin.weekLabel, signalCount: bulletin.signalCount });
    await setDocData("bulletins", "index", { items: items.slice(0, 160) });

    console.log(
        `[BÜLTEN] ${bulletin.id}: ${bulletin.signalCount} sinyal, ` +
        `${bulletin.flips.length} yön değişimi, ${bulletin.changes.length} fikir değiştiren`
    );
    return bulletin;
}
