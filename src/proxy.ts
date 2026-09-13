import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Eski "Fortress Guard" referer/origin kontrolü kaldırıldı: bu başlıklar
 * istemci tarafından serbestçe uydurulabildiği için gerçek bir koruma
 * sağlamıyordu, buna karşılık meşru kullanımı (önbellek, önizleme, bazı
 * tarayıcı ayarları) bozuyordu. Gerçek koruma artık şurada:
 *   - yazma uçlarında sunucu tarafı şifre doğrulaması (src/server/auth.ts)
 *   - Firestore güvenlik kuralları (firestore.rules)
 *   - pahalı uçlarda hız sınırlama
 * Bu katman güvenlik başlıklarını TÜM sayfalara uygular (eskiden sadece /api).
 */
export default function proxy(request: NextRequest) {
    const response = NextResponse.next();

    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("X-Frame-Options", "SAMEORIGIN");
    response.headers.set(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=(), interest-cohort=()"
    );
    if (request.nextUrl.protocol === "https:") {
        response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
    }
    return response;
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico|txt|xml)$).*)"],
};
