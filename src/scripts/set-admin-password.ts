/**
 * Admin şifresi için hash üretir. Çıktıyı ADMIN_PASSWORD_HASH olarak
 * Vercel ortam değişkenlerine ekleyin. Şifre hiçbir yerde düz metin saklanmaz.
 *   npx tsx src/scripts/set-admin-password.ts "şifreniz"
 */
import { scryptSync, randomBytes } from "crypto";

const password = process.argv[2];
if (!password || password.length < 10) {
    console.error("En az 10 karakterli bir şifre verin: npx tsx src/scripts/set-admin-password.ts \"...\"");
    process.exit(1);
}

const salt = randomBytes(16).toString("hex");
const hash = scryptSync(password, salt, 64).toString("hex");
console.log("\nAşağıdaki satırı ADMIN_PASSWORD_HASH ortam değişkeni olarak ekleyin:\n");
console.log(`${salt}:${hash}\n`);
