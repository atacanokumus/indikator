/**
 * Sunucu tarafı veri erişim fonksiyonları (firebase-admin üzerinden).
 * Tarayıcı bu dosyayı asla import etmez.
 */
import { adminDb, adminStorage, FieldValue } from "./db";
import type { Analysis, Channel, VideoAnalysis } from "@/lib/types";

/* ---------------- Kanallar ---------------- */

export async function getChannels(): Promise<Channel[]> {
    const snap = await adminDb().collection("channels").orderBy("addedAt", "desc").get();
    return snap.docs.map((d) => ({ ...(d.data() as Channel), id: d.id }));
}

export async function getChannel(id: string): Promise<Channel | null> {
    const doc = await adminDb().collection("channels").doc(id).get();
    return doc.exists ? ({ ...(doc.data() as Channel), id: doc.id }) : null;
}

export async function addChannel(channel: Omit<Channel, "addedAt"> & { addedAt?: unknown }) {
    await adminDb()
        .collection("channels")
        .doc(channel.id)
        .set({ ...channel, addedAt: channel.addedAt ?? new Date().toISOString() }, { merge: true });
    return true;
}

export async function deleteChannel(channelId: string) {
    await adminDb().collection("channels").doc(channelId).delete();
    return true;
}

export async function updateChannelStats(
    channelId: string,
    patch: Partial<Pick<Channel, "totalScore" | "predictionCount" | "successCount" | "weight">>
) {
    await adminDb().collection("channels").doc(channelId).set(patch, { merge: true });
}

/* ---------------- Analizler ---------------- */

/** Doküman ID'si videoId olduğu için sorgu değil doğrudan okuma yapıyoruz (1 okuma). */
export async function videoAlreadyAnalyzed(videoId: string): Promise<boolean> {
    if (!videoId) return false;
    const doc = await adminDb().collection("analyses").doc(videoId).get();
    return doc.exists;
}

export async function saveAnalysis(analysis: VideoAnalysis) {
    const hasPending = (analysis.results || []).some((r) => !r.isEvaluated);
    await adminDb()
        .collection("analyses")
        .doc(analysis.videoId)
        .set({ ...analysis, hasPending }, { merge: false });
}

export async function getAnalysesSince(days: number, max = 500): Promise<VideoAnalysis[]> {
    const cutoff = new Date(Date.now() - days * 864e5).toISOString();
    const snap = await adminDb()
        .collection("analyses")
        .where("publishedAt", ">=", cutoff)
        .orderBy("publishedAt", "desc")
        .limit(max)
        .get();
    return snap.docs.map((d) => d.data() as VideoAnalysis);
}

export async function getPendingAnalyses(max = 300) {
    const snap = await adminDb()
        .collection("analyses")
        .where("hasPending", "==", true)
        .limit(max)
        .get();
    return snap.docs.map((d) => ({ id: d.id, data: d.data() as VideoAnalysis }));
}

export async function updateAnalysisResults(videoId: string, results: Analysis[]) {
    await adminDb()
        .collection("analyses")
        .doc(videoId)
        .update({ results, hasPending: results.some((r) => !r.isEvaluated) });
}

/* ------------- Başarısız videolar (sonsuz döngü önleyici) ------------- */

const MAX_ATTEMPTS = 3;

export async function getFailureCount(videoId: string): Promise<number> {
    const doc = await adminDb().collection("failed_videos").doc(videoId).get();
    return doc.exists ? (doc.data()?.attempts ?? 0) : 0;
}

export async function shouldSkipVideo(videoId: string): Promise<boolean> {
    return (await getFailureCount(videoId)) >= MAX_ATTEMPTS;
}

export async function recordFailure(videoId: string, reason: string) {
    await adminDb()
        .collection("failed_videos")
        .doc(videoId)
        .set(
            {
                videoId,
                attempts: FieldValue.increment(1),
                lastReason: String(reason).slice(0, 500),
                lastTriedAt: new Date().toISOString(),
            },
            { merge: true }
        );
}

export async function clearFailure(videoId: string) {
    await adminDb().collection("failed_videos").doc(videoId).delete().catch(() => { });
}

/* ---------------- Fiyatlar ---------------- */

export async function updateStoredPrice(asset: string, price: number, currency: string) {
    const id = asset.replace(/\//g, "-");
    await adminDb()
        .collection("prices")
        .doc(id)
        .set({ asset, price, currency, updatedAt: new Date().toISOString() }, { merge: true });
}

export async function getStoredPrices(): Promise<Record<string, { price: number; currency: string }>> {
    const snap = await adminDb().collection("prices").get();
    const out: Record<string, { price: number; currency: string }> = {};
    snap.docs.forEach((d) => {
        const v = d.data();
        out[v.asset] = { price: v.price, currency: v.currency };
    });
    return out;
}

/* ---------------- Sistem durumu ---------------- */

export async function setSyncStatus(status: Record<string, unknown>) {
    await adminDb()
        .collection("system_status")
        .doc("sync_state")
        .set({ ...status, lastUpdated: Date.now() }, { merge: true });
}

/* ---------------- Genel amaçlı doküman yardımcıları ---------------- */

export async function getDocData<T>(collection: string, id: string): Promise<T | null> {
    const doc = await adminDb().collection(collection).doc(id).get();
    return doc.exists ? (doc.data() as T) : null;
}

export async function setDocData(collection: string, id: string, data: Record<string, unknown>) {
    await adminDb().collection(collection).doc(id).set(data, { merge: true });
}

export { adminDb, adminStorage };
