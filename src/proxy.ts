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
/**
 * Kanonik alan adı. Site analistnediyor.com'a taşındı; eski Vercel adresinde
 * açık kalan aynı içerik, arama motoru için yinelenen içerik demek. Bu yüzden
 * kanonik olmayan her ana bilgisayar adı kalıcı olarak (308) yeni adrese
 * gönderiliyor. Önizleme dağıtımları ve yerel geliştirme bunun dışında.
 */
const CANONICAL_HOST = "analistnediyor.com";

function shouldRedirect(host: string): boolean {
    if (!host) return false;
    if (host === CANONICAL_HOST) return false;
    if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) return false;
    // Önizleme dağıtımları (rastgele-ad-proje.vercel.app) yönlendirilmemeli;
    // yalnızca üretimde kullandığımız sabit adres taşınıyor.
    if (host.endsWith(".vercel.app") && !host.startsWith("indikator.")) return false;
    return true;
}

export default function proxy(request: NextRequest) {
    const host = request.headers.get("host") ?? "";

    /**
     * YouTube push bildirimleri yönlendirilmez. Alan adı taşınırken mevcut
     * abonelikler bir süre eski adrese POST etmeye devam ediyor ve hub'ın
     * 308'i izleyeceğinin garantisi yok; izlemezse o kanalların anlık
     * güncellemesi sessizce durur. Abonelikler yeni adrese taşınana kadar
     * bu uç her iki adreste de doğrudan çalışmalı.
     */
    const isWebhook = request.nextUrl.pathname.startsWith("/api/youtube/webhook");

    if (!isWebhook && shouldRedirect(host)) {
        const url = new URL(request.url);
        url.host = CANONICAL_HOST;
        url.protocol = "https:";
        url.port = "";
        return NextResponse.redirect(url, 308);
    }

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

/**
 * DIKKAT — _vercel ve .js haric tutulmali.
 *
 * Vercel Web Analytics betigini reklam engelleyicilerden kacmak icin rastgele
 * bir yoldan servis ediyor (ornegin /85b12c015a6b922c/script.js). Bu yol
 * matcher'a takildiginda istek 502 donuyor ve tarayici "MIME type text/plain"
 * diyerek betigi calistirmayi reddediyor. Sonucu: olcum acik gorunuyor ama tek
 * bir ziyaret bile kaydedilmiyor.
 *
 * Genel kural olarak da dogru: bu katman yalnizca guvenlik basliklari ekliyor,
 * statik dosyalarda calismasinin bir faydasi yok.
 */
export const config = {
    matcher: [
        "/((?!_next/static|_next/image|_vercel|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico|txt|xml|js|css|map|woff|woff2)$).*)",
    ],
};
