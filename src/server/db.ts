/**
 * SUNUCU TARAFI VERİTABANI KATMANI
 * ---------------------------------
 * Bu dosya SADECE sunucuda (API route, GitHub Actions, script) çalışır.
 * firebase-admin kullanır; servis hesabı ile Firestore güvenlik kurallarını
 * bypass eder. Böylece tarayıcıya açık olan client SDK'ya hiçbir yazma
 * yetkisi vermemiz gerekmez (bkz. firestore.rules).
 *
 * Servis hesabı yoksa client SDK'ya düşer ve yüksek sesle uyarır — bu sadece
 * geçiş dönemi içindir, canlıda servis hesabı ZORUNLUDUR.
 */
import "server-only";
import { cert, getApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

let _db: Firestore | null = null;
let _app: App | null = null;
let warned = false;

function readServiceAccount(): Record<string, string> | null {
    const raw =
        process.env.FIREBASE_SERVICE_ACCOUNT ||
        process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 ||
        "";
    if (!raw) return null;
    try {
        const json = raw.trim().startsWith("{")
            ? raw
            : Buffer.from(raw, "base64").toString("utf8");
        const parsed = JSON.parse(json);
        // Vercel/GitHub secret'larında \n kaçışları bozulabiliyor
        if (parsed.private_key) {
            parsed.private_key = String(parsed.private_key).replace(/\\n/g, "\n");
        }
        return parsed;
    } catch (e) {
        console.error("[DB] FIREBASE_SERVICE_ACCOUNT çözümlenemedi:", e);
        return null;
    }
}

export function adminDb(): Firestore {
    if (_db) return _db;

    const sa = readServiceAccount();
    if (!sa) {
        if (!warned) {
            warned = true;
            console.warn(
                "[DB] FIREBASE_SERVICE_ACCOUNT tanımlı değil — veritabanı erişimi devre dışı. " +
                "Derleme sırasında bu normaldir; canlıda mutlaka tanımlayın (bkz. README)."
            );
        }
        throw new Error(
            "FIREBASE_SERVICE_ACCOUNT ortam değişkeni gerekli. " +
            "Firebase Console > Proje Ayarları > Servis Hesapları > Yeni özel anahtar oluştur."
        );
    }

    _app = getApps().length
        ? getApp()
        : initializeApp({
            credential: cert(sa as never),
            projectId: sa.project_id,
            storageBucket:
                process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
                `${sa.project_id}.appspot.com`,
        });

    _db = getFirestore(_app);
    _db.settings({ ignoreUndefinedProperties: true });
    return _db;
}

export function adminStorage() {
    adminDb();
    return getStorage(_app!);
}

export function hasServiceAccount(): boolean {
    return readServiceAccount() !== null;
}

export { FieldValue };
