/**
 * Tüm değerlendirmeleri sıfırlar ki düzeltilmiş ölçümle yeniden hesaplansın.
 *
 * NEDEN: Eski değerlendirici (a) çıkış fiyatı olarak vade sonunu değil bugünü
 * alıyordu, (b) giriş fiyatı yoksa kaydı ölçmeden NEUTRAL kapatıyordu. Bu
 * yüzden mevcut 941 değerlendirmenin tamamı güvenilmez. İsabet karnesi
 * yayımlanmadan önce hepsi yeniden ölçülmeli.
 *
 * Kullanım: npx tsx src/scripts/reset-evaluations.ts
 */
import "./_env";
import { adminDb } from "@/server/db";

async function main() {
    const db = adminDb();
    const snap = await db.collection("analyses").get();

    let docs = 0, signals = 0;
    let batch = db.batch();
    let inBatch = 0;

    for (const doc of snap.docs) {
        const results = (doc.get("results") || []) as Record<string, unknown>[];
        let touched = false;
        for (const r of results) {
            if (r.isEvaluated) {
                r.isEvaluated = false;
                r.status = "PENDING";
                r.exitPrice = null;
                r.evaluatedAt = null;
                r.measuredAt = null;
                r.changePct = null;
                signals++;
                touched = true;
            }
        }
        if (touched) {
            batch.update(doc.ref, { results, hasPending: true });
            docs++; inBatch++;
            if (inBatch >= 400) { await batch.commit(); batch = db.batch(); inBatch = 0; }
        }
    }
    if (inBatch) await batch.commit();

    // Kanal puanları da sıfırlanmalı; eskisi yanlış ölçümden birikmişti.
    const chans = await db.collection("channels").get();
    let cb = db.batch();
    chans.forEach((c) =>
        cb.update(c.ref, { totalScore: 100, predictionCount: 0, successCount: 0, weight: 1 })
    );
    await cb.commit();

    console.log(`${docs} video, ${signals} sinyal sıfırlandı. ${chans.size} kanal puanı 100'e döndü.`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
