import { NextResponse } from "next/server";
import { clientIp, rateLimit, verifyAdminSecret } from "@/server/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
    // Kaba kuvvet saldırısına karşı: IP başına 5 dakikada 8 deneme
    if (!rateLimit(`admin:${clientIp(request)}`, 8, 5 * 60_000)) {
        return NextResponse.json(
            { success: false, error: "Çok fazla deneme. 5 dakika sonra tekrar deneyin." },
            { status: 429 }
        );
    }

    const { secret } = await request.json().catch(() => ({ secret: null }));
    // Zamanlama sızıntısını azaltmak için sabit gecikme
    await new Promise((r) => setTimeout(r, 300));

    if (!verifyAdminSecret(secret)) {
        return NextResponse.json({ success: false, error: "Geçersiz şifre." }, { status: 401 });
    }
    return NextResponse.json({ success: true });
}
