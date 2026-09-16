/**
 * SOSYAL MEDYA GONDERI METNI URETICI
 *
 * Siteyi X'te duyurmak icin gonderi metni uretir. HICBIR SEY PAYLASMAZ —
 * yalnizca metni ekrana basar; paylasma karari ve eylemi insanda kalir.
 *
 * NEDEN BOYLE TASARLANDI:
 *
 * 1) LINK GOVDEDE YOK. X'in kullandikca-ode fiyatlandirmasinda icinde
 *    baglanti olan gonderi 0,20 dolar, olmayan 0,015 dolar — 13 kat fark.
 *    Ayrica link iceren gonderiler akista daha az kisiye gosteriliyor.
 *    Link profilde ve sabitlenmis gonderide dursun. (--link ile istenirse eklenir.)
 *
 * 2) HER GUN AYNI CUMLE KURULMAZ. X'in otomasyon kurallari "ayni ya da buyuk
 *    olcude benzer gonderiler"i yasakliyor. Bu yuzden betik once O GUN NE
 *    DEGISTIGINE bakar: yon degistiren varlik varsa onu, fikir degistiren
 *    yorumcu varsa onu one cikarir; kayda deger bir sey yoksa sayimi verir.
 *
 * 3) TREND/HASHTAG KOVALAMAZ. Kurallar "trend olan konular hakkinda otomatik
 *    gonderi" paylasmayi acikca yasakliyor. Betik hashtag uretmez.
 *
 * 4) EMIR KIPI YOK. Sitenin her yerinde oldugu gibi burada da tavsiye degil
 *    sayim dili kullanilir: "20 analistin 11'i ALIM yonunde", "alin" degil.
 *
 * Kullanim:
 *   npx tsx src/scripts/social-post.ts            # bugun icin en iyi secenek
 *   npx tsx src/scripts/social-post.ts gunluk
 *   npx tsx src/scripts/social-post.ts haftalik
 *   npx tsx src/scripts/social-post.ts karne
 *   npx tsx src/scripts/social-post.ts --hepsi    # uc secenegi birden goster
 *   npx tsx src/scripts/social-post.ts gunluk --link
 */
import "./_env";
import { getDocData } from "@/server/repo";
import { ASSET_LABEL, DIRECTION, sayiEki as eki, sayiEkiDe as ekiDe } from "@/lib/display";
import type { HomeSnapshot, Recommendation } from "@/lib/types";
import type { Scorecard } from "@/server/scorecard";
import type { Bulletin } from "@/server/bulletin";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://analistnediyor.com";
const LIMIT = 280;

function label(asset: string): string {
    return ASSET_LABEL[asset] ?? asset;
}

function satir(c: { asset: string; leadingCount: number; analystCount: number; leading: Recommendation }): string {
    return `${label(c.asset)} — ${c.analystCount} analistin ${c.leadingCount}${eki(c.leadingCount)} ${DIRECTION[c.leading]}`;
}

/* ------------------------------ Secenekler ------------------------------ */

function gunluk(snap: HomeSnapshot): string {
    // En cok konusulan dort varlik. Sabit bir liste degil: gun icinde hangi
    // varliklar one ciktiysa o degisiyor, dolayisiyla metin de degisiyor.
    const satirlar = snap.consensus.slice(0, 4).map(satir);
    return [
        `Bugün ${snap.analystCount} yorumcuda sayım:`,
        "",
        ...satirlar,
        "",
        "Tavsiye değil, sayım. Kim ne dedi profilde.",
    ].join("\n");
}

function haftalik(b: Bulletin): string {
    const kac = b.changes.length;
    if (kac === 0) {
        return [
            `${b.weekLabel}: ${b.channelCount} kanal ${b.videoCount} video yayımladı.`,
            "",
            "Bu hafta kimse bir varlıkta fikrini değiştirmedi.",
            "",
            "Haftalık bülten profilde.",
        ].join("\n");
    }
    const ornek = b.changes.slice(0, 3).map(
        (c) => `${c.channelTitle} · ${label(c.asset)}: ${DIRECTION[c.from]} → ${DIRECTION[c.to]}`
    );
    return [
        `Bu hafta ${kac} yorumcu bir varlıkta fikrini değiştirdi.`,
        "",
        ...ornek,
        "",
        "Geçen hafta ne dediklerini kimse hatırlamıyor. Biz kaydediyoruz.",
    ].join("\n");
}

function karne(c: Scorecard): string {
    const t = c.totals;
    const oran = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);
    const al = c.directionTotals.AL;
    const sat = c.directionTotals.SAT;
    return [
        `Ölçtük: takip ettiğimiz yorumcuların vadesi dolmuş ${t.measured.toLocaleString("tr-TR")} görüşünden %${oran(t.hit, t.measured)}${eki(oran(t.hit, t.measured))} tuttu.`,
        "",
        `Alım yönlü görüşlerin %${oran(al.hit, al.measured)}${eki(oran(al.hit, al.measured))} tuttu, satış yönlü görüşlerin %${oran(sat.hit, sat.measured)}${eki(oran(sat.hit, sat.measured))}.`,
        "",
        `Görüşlerin %${oran(t.flat, t.measured)}${ekiDe(oran(t.flat, t.measured))} fiyat hiçbir yöne gitmedi.`,
    ].join("\n");
}

/* ------------------------------ Yardimcilar ------------------------------ */

function goster(baslik: string, metin: string, link: boolean) {
    const tam = link ? `${metin}\n\n${SITE}` : metin;
    const uzunluk = [...tam].length;
    console.log(`\n${"─".repeat(56)}`);
    console.log(`${baslik}  (${uzunluk}/${LIMIT} karakter${uzunluk > LIMIT ? " — UZUN, KISALT" : ""})`);
    if (link) console.log("DİKKAT: bağlantılı gönderi 0,20 $ — bağlantısızı 0,015 $");
    console.log("─".repeat(56));
    console.log(tam);
}

async function main() {
    const argv = process.argv.slice(2);
    const link = argv.includes("--link");
    const hepsi = argv.includes("--hepsi");
    const mod = argv.find((a) => !a.startsWith("--"));

    const [snap, card, bul] = await Promise.all([
        getDocData<HomeSnapshot>("snapshots", "home"),
        getDocData<Scorecard>("snapshots", "scorecard"),
        getDocData<Bulletin>("bulletins", "latest"),
    ]);

    const secenekler: { ad: string; metin: string }[] = [];
    if (snap?.consensus?.length) secenekler.push({ ad: "GÜNLÜK SAYIM", metin: gunluk(snap) });
    if (bul) secenekler.push({ ad: "HAFTALIK BÜLTEN", metin: haftalik(bul) });
    if (card?.totals?.measured) secenekler.push({ ad: "İSABET KARNESİ", metin: karne(card) });

    if (secenekler.length === 0) {
        console.log("Henüz paylaşılacak veri yok.");
        return;
    }

    if (mod) {
        const eslesme =
            mod === "gunluk" ? "GÜNLÜK SAYIM" : mod === "haftalik" ? "HAFTALIK BÜLTEN" : "İSABET KARNESİ";
        const s = secenekler.find((x) => x.ad === eslesme);
        if (!s) { console.log(`"${mod}" için veri yok.`); return; }
        goster(s.ad, s.metin, link);
        return;
    }

    if (hepsi) {
        secenekler.forEach((s) => goster(s.ad, s.metin, link));
        return;
    }

    /*
     * Varsayilan: BUGUN EN KAYDA DEGER OLAN.
     * Pazartesi taze bulten varsa o; hafta icinde fikir degistiren cikmissa o;
     * yoksa gunluk sayim. Boylece her gun ayni metin uretilmez.
     */
    const bultenTaze =
        bul?.generatedAt && Date.now() - Date.parse(bul.generatedAt) < 36 * 3600_000;
    const secilen =
        (bultenTaze && secenekler.find((s) => s.ad === "HAFTALIK BÜLTEN")) ||
        (bul && bul.changes.length >= 5 && secenekler.find((s) => s.ad === "HAFTALIK BÜLTEN")) ||
        secenekler[0];

    goster(secilen.ad, secilen.metin, link);
    console.log(
        `\nDiğer seçenekler: ${secenekler.filter((s) => s !== secilen).map((s) => s.ad).join(", ")}` +
        `\n(npx tsx src/scripts/social-post.ts gunluk | haftalik | karne)`
    );
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
