/**
 * VARLIK BAZINDA KONSENSUS GECMISI
 *
 * Ana sayfa "su an kim ne diyor" sorusunu cevapliyor. Bu dosya "zamanla ne
 * degisti" sorusunu cevapliyor: bir varlikta ay ay kac analistin hangi yonde
 * konustugu. Kimsede olmayan veri bu, cunku gecmis gorusleri sakliyoruz.
 *
 * OLCUM TANIMI (grafigin altinda da aynen yaziyor):
 * Bir ayin sutunu, O AY ICINDE o varlik hakkinda konusan analist sayisidir.
 * Ayni analist ay icinde birden cok kez konustuysa en son gorusu sayilir.
 */
import { normalizeAsset } from "@/lib/asset-utils";
import type { Recommendation, Tally, VideoAnalysis } from "@/lib/types";
import { toIso } from "@/lib/types";
import { getAnalysesSince, setDocData } from "./repo";

export const HISTORY_MONTHS = 12;

export interface HistoryPoint {
    month: string;
    tally: Tally;
    total: number;
}

export type AssetHistory = Record<string, HistoryPoint[]>;

const emptyTally = (): Tally => ({ AL: 0, SAT: 0, TUT: 0, "GÖZLEMLE": 0 });

export function monthKeys(now = new Date()): string[] {
    const out: string[] = [];
    for (let i = HISTORY_MONTHS - 1; i >= 0; i--) {
        const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
        out.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
    }
    return out;
}

export async function buildAssetHistory(now = new Date()): Promise<AssetHistory> {
    const videos = (await getAnalysesSince(400, 4000)) as VideoAnalysis[];
    const months = monthKeys(now);
    const monthIndex = new Map(months.map((m, i) => [m, i]));

    const latest = new Map<string, { rec: Recommendation; date: string }>();

    for (const video of videos) {
        const date = toIso(video.publishedAt);
        const month = date.slice(0, 7);
        if (!monthIndex.has(month)) continue;

        for (const r of video.results || []) {
            const asset = normalizeAsset(r.asset);
            if (!asset) continue;
            const key = asset + "\u0000" + month + "\u0000" + video.channelId;
            const prev = latest.get(key);
            if (!prev || date > prev.date) latest.set(key, { rec: r.recommendation, date });
        }
    }

    const history: AssetHistory = {};
    for (const [key, value] of latest) {
        const parts = key.split("\u0000");
        const asset = parts[0];
        const month = parts[1];
        let series = history[asset];
        if (!series) {
            series = months.map((m) => ({ month: m, tally: emptyTally(), total: 0 }));
            history[asset] = series;
        }
        const point = series[monthIndex.get(month)!];
        point.tally[value.rec] = (point.tally[value.rec] ?? 0) + 1;
        point.total += 1;
    }

    for (const asset of Object.keys(history)) {
        const series = history[asset];
        const activeMonths = series.filter((p) => p.total > 0).length;
        const totalSignals = series.reduce((n, p) => n + p.total, 0);
        if (activeMonths < 2 || totalSignals < 4) delete history[asset];
    }

    return history;
}

export async function writeAssetHistory(now = new Date()): Promise<AssetHistory> {
    const history = await buildAssetHistory(now);
    await setDocData("snapshots", "history", {
        generatedAt: new Date().toISOString(),
        months: monthKeys(now),
        history: history as unknown as Record<string, unknown>,
    });
    console.log("[GECMIS] " + Object.keys(history).length + " varlik icin aylik seri yazildi");
    return history;
}
