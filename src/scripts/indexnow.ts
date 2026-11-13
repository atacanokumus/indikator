/**
 * IndexNow: sitemap'teki adresleri Bing, Yandex ve IndexNow'a katılan diğer arama
 * motorlarına bildirir. Google IndexNow KULLANMAZ; Google için Search Console gerekir.
 *
 * Neden: ChatGPT araması ve Copilot, Bing dizinini kullanır. Bing yeni bir siteyi
 * kendiliğinden yavaş keşfeder; IndexNow ile yeni ve değişen sayfalar dakikalar
 * içinde taranma sırasına girer.
 *
 * Kullanım:  npx tsx src/scripts/indexnow.ts            (sitemap'teki tüm adresler)
 *            npx tsx src/scripts/indexnow.ts /rehber/x  (yalnızca verilen yollar)
 *
 * Anahtar gizli değildir: public/<anahtar>.txt dosyasında herkese açık durur ve
 * yalnızca "bu bildirimi gönderen, sitenin sahibi" olduğunu kanıtlar.
 */
const KEY = "07b87c474c8b70fadced30bfd85d7f3b";
const HOST = "analistnediyor.com";
const SITE = `https://${HOST}`;

async function main() {
    const args = process.argv.slice(2);
    let urlList: string[];
    if (args.length) {
        urlList = args.map((p) => (p.startsWith("http") ? p : `${SITE}${p.startsWith("/") ? p : `/${p}`}`));
    } else {
        const xml = await (await fetch(`${SITE}/sitemap.xml`)).text();
        urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    }
    if (!urlList.length) throw new Error("Bildirilecek adres bulunamadı.");

    const res = await fetch("https://api.indexnow.org/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList }),
    });
    // 200 = kabul edildi, 202 = alındı (anahtar doğrulaması bekliyor). Diğerleri hata.
    console.log(`IndexNow: ${urlList.length} adres gönderildi -> HTTP ${res.status} ${res.statusText}`);
    if (res.status !== 200 && res.status !== 202) {
        console.error(await res.text());
        process.exit(1);
    }
}

main().catch((e) => { console.error(e); process.exit(1); });
