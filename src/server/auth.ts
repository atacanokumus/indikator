/**
 * Admin doğrulaması.
 *
 * DÜZELTİLEN AÇIK: Eski sürüm admin şifresini Firestore'da DÜZ METİN olarak
 * tutuyor ve client SDK ile okuyordu. Firestore kuralları açık olduğu için
 * herhangi biri tarayıcı konsolundan settings/admin dokümanını okuyup
 * yönetici şifresini alabilirdi.
 *
 * Yeni yöntem: şifre ortam değişkeninde scrypt hash'i olarak tutulur,
 * doğrulama sabit zamanlı karşılaştırma ile sunucuda yapılır.
 * Hash üretmek için: npx tsx src/scripts/set-admin-password.ts "şifre"
 */
import "server-only";
import { scryptSync, timingSafeEqual } from "crypto";

export function verifyAdminSecret(provided: unknown): boolean {
    if (typeof provided !== "string" || provided.length === 0) return false;

    const stored = process.env.ADMIN_PASSWORD_HASH;
    if (!stored || !stored.includes(":")) {
        console.error("[AUTH] ADMIN_PASSWORD_HASH tanımlı değil — admin erişimi kapalı.");
        return false;
    }

    const [salt, hash] = stored.split(":");
    try {
        const candidate = scryptSync(provided, salt, 64);
        const expected = Buffer.from(hash, "hex");
        return candidate.length === expected.length && timingSafeEqual(candidate, expected);
    } catch {
        return false;
    }
}

/** Basit, bellek içi hız sınırlayıcı (pahalı uçlar için). */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const b = buckets.get(key);
    if (!b || now > b.resetAt) {
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        return true;
    }
    if (b.count >= limit) return false;
    b.count++;
    return true;
}

export function clientIp(request: Request): string {
    const h = request.headers;
    return (
        h.get("x-forwarded-for")?.split(",")[0].trim() ||
        h.get("x-real-ip") ||
        "unknown"
    );
}
