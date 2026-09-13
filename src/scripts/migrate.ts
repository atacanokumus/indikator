/**
 * Tek seferlik veri taşıma (denetim öncesi kayıtlar için).
 *
 * - analyses: kök seviyeye `hasPending` alanını ekler (Evaluator sorgusu bunu
 *   kullanıyor; eski kayıtlarda alan hiç yoktu ve değerlendirme dışı kalırlardı)
 * - analyses: Firestore Timestamp olan `analyzedAt` alanını ISO string'e çevirir
 * - channels: eksik puan alanlarını tamamlar, eski `successRate` yerine
 *   `successCount` kullanır, `addedAt` alanını ISO string'e çevirir
 *
 * Tekrar çalıştırmak güvenlidir (idempotent).
 *   npx tsx src/scripts/migrate.ts [--dry]
 */
import "./_env";
import { adminDb } from "@/server/db";

function toIso(v: unknown): string | null {
    if (!v) return null;
    if (typeof v === "string") return v;
    const t = v as { toDate?: () => Date; _seconds?: number };
    if (typeof t.toDate === "function") return t.toDate().toISOString();
    if (typeof t._seconds === "number") return new Date(t._seconds * 1000).toISOString();
    return null;
}

async function main() {
    const dry = process.argv.includes("--dry");
    const db = adminDb();
    if (dry) console.log("[MIGRATE] KURU ÇALIŞMA — hiçbir şey yazılmayacak\n");

    /* ---------- analyses ---------- */
    const analyses = await db.collection("analyses").get();
    let touched = 0;
    let batch = db.batch();
    let inBatch = 0;

    for (const doc of analyses.docs) {
        const data = doc.data();
        const patch: Record<string, unknown> = {};

        const results = Array.isArray(data.results) ? data.results : [];
        const hasPending = results.some((r: { isEvaluated?: boolean }) => !r.isEvaluated);
        if (data.hasPending !== hasPending) patch.hasPending = hasPending;

        const analyzedAt = toIso(data.analyzedAt);
        if (analyzedAt && typeof data.analyzedAt !== "string") patch.analyzedAt = analyzedAt;

        const publishedAt = toIso(data.publishedAt);
        if (publishedAt && typeof data.publishedAt !== "string") patch.publishedAt = publishedAt;

        if (Object.keys(patch).length === 0) continue;
        touched++;
        if (dry) continue;

        batch.update(doc.ref, patch);
        if (++inBatch >= 400) {
            await batch.commit();
            batch = db.batch();
            inBatch = 0;
        }
    }
    if (!dry && inBatch > 0) await batch.commit();
    console.log(`[MIGRATE] analyses: ${analyses.size} doküman, ${touched} tanesi güncellendi`);

    /* ---------- channels ---------- */
    const channels = await db.collection("channels").get();
    let chTouched = 0;

    for (const doc of channels.docs) {
        const data = doc.data();
        const patch: Record<string, unknown> = {};

        if (typeof data.totalScore !== "number" || data.totalScore === 0) patch.totalScore = 100;
        if (typeof data.predictionCount !== "number") patch.predictionCount = 0;
        if (typeof data.successCount !== "number") patch.successCount = 0;
        if (typeof data.weight !== "number" || data.weight <= 0) patch.weight = 1;

        const addedAt = toIso(data.addedAt);
        if (addedAt && typeof data.addedAt !== "string") patch.addedAt = addedAt;

        if (Object.keys(patch).length === 0) continue;
        chTouched++;
        if (dry) continue;
        await doc.ref.update(patch);
    }
    console.log(`[MIGRATE] channels: ${channels.size} kanal, ${chTouched} tanesi güncellendi`);

    /* ---------- eski düz metin admin dokümanı ---------- */
    const adminDoc = await db.doc("settings/admin").get();
    if (adminDoc.exists) {
        if (dry) {
            console.log("[MIGRATE] settings/admin silinecek (düz metin şifre içeriyor)");
        } else {
            await adminDoc.ref.delete();
            console.log("[MIGRATE] settings/admin silindi (düz metin şifre içeriyordu)");
        }
    }
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
