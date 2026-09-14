import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/server/auth";
import { recordSignalReport } from "@/server/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REASONS = new Set(["YANLIS_YON", "YANLIS_VARLIK", "BAGLAM", "KALDIR"]);

/**
 * Kullanıcı bildirimi: "bu özet yanlış".
 *
 * Bildirilen (video, varlık) çifti bir sonraki snapshot üretiminde listeden
 * çıkar. Kimlik doğrulaması istemiyoruz — itiraz eden kişinin üye olmasını
 * beklemek, kişilik hakkı ihlalini uzatmaktan başka işe yaramaz. Kötüye
 * kullanıma karşı IP başına hız sınırı var ve admin panelinden geri alınabilir.
 */
export async function POST(request: Request) {
    const ip = clientIp(request);

    // IP başına saatte 10 bildirim
    if (!rateLimit(`report:${ip}`, 10, 60 * 60_000)) {
        return NextResponse.json(
            { error: "Çok fazla bildirim gönderdiniz. Bir saat sonra tekrar deneyin." },
            { status: 429 }
        );
    }

    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });

    const { videoId, asset, reason, note } = body as Record<string, unknown>;
    if (
        typeof videoId !== "string" || !/^[A-Za-z0-9_-]{6,20}$/.test(videoId) ||
        typeof asset !== "string" || asset.length === 0 || asset.length > 120 ||
        typeof reason !== "string" || !REASONS.has(reason)
    ) {
        return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
    }

    // IP'yi düz metin saklamıyoruz (KVKK veri minimizasyonu)
    const ipHash = createHash("sha256").update(ip + (process.env.WEBSUB_SECRET ?? "")).digest("hex").slice(0, 16);

    try {
        await recordSignalReport(videoId, asset, reason, typeof note === "string" ? note : "", ipHash);
    } catch (err) {
        console.error("[REPORT]", (err as Error).message);
        return NextResponse.json({ error: "Kaydedilemedi" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}
