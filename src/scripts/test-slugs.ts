/**
 * Eski varlık adreslerinin kanonik adrese yönlendirilmesi için hızlı doğrulama.
 * Kullanım: npx tsx src/scripts/test-slugs.ts
 *
 * Sayfa (src/app/varlik/[slug]/page.tsx) bulamadığı slug için redirectSlugFor'a
 * sorar. Bozulursa ya eski adresler 404'e düşer ya da yanlış sayfaya gider.
 */
import { redirectSlugFor } from "../lib/slug-redirect";

const items = ["CMG", "SBUX", "INTC", "AVGO", "QCOM", "TSM", "MRNA", "YKBNK", "USD/TRY", "ALTIN"].map((asset) => ({ asset }));

// [bulunamayan slug, beklenen yönlendirme hedefi (null = 404)]
const CASES: [string, string | null][] = [
    ["chipotle", "cmg"], ["starbucks", "sbux"], ["intel", "intc"], ["broadcom", "avgo"],
    ["qualcomm", "qcom"], ["tsmc", "tsm"], ["moderna", "mrna"], ["ykb", "ykbnk"],
    // ad + kod birlikte üretilmiş üçüncü kova adresleri
    ["chipotle-cmg", "cmg"], ["intel-intc", "intc"], ["ykb-bankasi", "ykbnk"],
    ["taiwan-semiconductor-manufacturing", "tsm"],
    // eski kurallar için de çalışır
    ["ons-altin", "altin"], ["dolar", "usd-try"],
    // 404 kalmalı: bilinmeyen, gürültü, zaten kanonik, boş
    ["asdf", null], ["piyasalar", null], ["cmg", null], ["usd-try", null], ["", null],
];

let fail = 0;
for (const [slug, expected] of CASES) {
    const got = redirectSlugFor(items, slug);
    if (got !== expected) { fail++; console.error(`✗ "${slug}" → ${got} (beklenen: ${expected})`); }
}

// Hedef listede yoksa yönlendirme yapılmaz: boş sayfaya göndermek 404'ten kötü.
if (redirectSlugFor(items.filter((i) => i.asset !== "CMG"), "chipotle") !== null) {
    fail++; console.error("✗ hedef listede yokken yönlendirme yapıldı");
}

// Döngü yok: yönlendirme hedefi tekrar yönlendirilmemeli.
for (const [slug, expected] of CASES) {
    if (expected && redirectSlugFor(items, expected) !== null) {
        fail++; console.error(`✗ döngü: "${slug}" → "${expected}" tekrar yönleniyor`);
    }
}

console.log(`${CASES.length + 1 - fail}/${CASES.length + 1} geçti.`);
process.exit(fail ? 1 : 0);
