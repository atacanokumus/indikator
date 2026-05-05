import { AdminService } from "@/services/admin-service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { secret } = await request.json();

        if (!secret) {
            return NextResponse.json({ success: false, error: "Şifre gerekli." }, { status: 400 });
        }

        const isValid = await AdminService.verifySecret(secret);

        if (isValid) {
            return NextResponse.json({ success: true, message: "Giriş başarılı." });
        } else {
            return NextResponse.json({ success: false, error: "Geçersiz şifre." }, { status: 401 });
        }
    } catch (error: any) {
        return NextResponse.json({ success: false, error: "Sunucu hatası: " + error.message }, { status: 500 });
    }
}
