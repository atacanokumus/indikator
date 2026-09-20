import { NextResponse } from "next/server";
import { syncPrices } from "@/server/price-sync";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Vercel Cron tarafından günlük çağrılır (bkz. vercel.json > crons).
 *
 * NEDEN GITHUB ACTIONS DEĞİL: Fiyat güncelleme birkaç saniyede biter,
 * Vercel'in 60sn sınırına hiç yaklaşmaz. Bunu GitHub Actions'tan ayırmak,
 * video analizinin (dakikalarca sürebilen Gemini işi) tükettiği aylık
 * Actions dakikasından bağımsız, hep çalışan bir fiyat güncelleme yolu
 * sağlıyor.
 *
 * Yetkilendirme: Vercel Cron istekleri `Authorization: Bearer $CRON_SECRET`
 * başlığıyla gelir (Vercel'in resmi cron doğrulama yöntemi). Aynı token'ı
 * admin panelinden manuel tetiklemek için de kullanabilirsin.
 */
export async function GET(request: Request) {
    const auth = request.headers.get("authorization");
    const expected = process.env.CRON_SECRET;

    if (!expected) {
        console.error("[CRON] CRON_SECRET tanımlı değil — istek reddedildi.");
        return NextResponse.json({ error: "Yapılandırılmamış." }, { status: 500 });
    }
    if (auth !== `Bearer ${expected}`) {
        return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
    }

    try {
        const result = await syncPrices();
        return NextResponse.json({ ok: true, ...result });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
