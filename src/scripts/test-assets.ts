/**
 * normalizeAsset için hızlı doğrulama.
 * Kullanım: npx tsx src/scripts/test-assets.ts
 *
 * Yapay zeka varlık adlarını serbest metin döndürdüğü için bu eşleme
 * sitenin en kırılgan yeri: bozulursa aynı varlık ana sayfada ikiye bölünür.
 */
import { normalizeAsset } from "../lib/asset-utils";

const CASES: [string, string][] = [
    ["Ons Altın (XAU/USD)", "ALTIN"], ["gram altın", "ALTIN"], ["Gold", "ALTIN"],
    ["Silver", "GÜMÜŞ"], ["Gümüş", "GÜMÜŞ"],
    ["Dolar/TL", "USD/TRY"], ["USD/TRY", "USD/TRY"], ["Dolar (USD)", "USD/TRY"],
    ["Euro/TL", "EUR/TRY"], ["EUR/USD", "EUR/USD"],
    ["Bitcoin", "BTC"], ["BTC/USD", "BTC"], ["Ethereum", "ETH"],
    ["Kripto paralar", "KRIPTO"], ["crypto", "KRIPTO"],
    ["Brent petrol", "BZ=F"], ["Petrol", "CL=F"], ["WTI crude oil", "CL=F"],
    ["Bakır", "HG=F"], ["copper", "HG=F"],
    ["BIST 100", "XU100"], ["Borsa İstanbul", "XU100"],
    ["S&P 500", "SP500"], ["Nasdaq", "NASDAQ"],
    ["10 yıllık ABD tahvili", "US10Y"], ["US treasury yields", "US10Y"],
    ["VIX", "VIX"], ["MicroStrategy", "MSTR"], ["Nvidia", "NVDA"],
    ["Magnificent 7", "ABD-HISSE"], ["ABD hisseleri", "ABD-HISSE"],
    ["Konut", "KONUT"], ["Mevduat", "MEVDUAT"], ["Eurobond", "EUROBOND"],
    ["Oracle", "ORCL"], ["Vakıf Bank", "VAKBN"], ["Curve", "CRV"], ["Zcash", "ZEC"],
    // gürültü — normalizeAsset boş dize döndürür, sayıma girmez
    ["Piyasalar", ""], ["the market", ""], ["Enflasyon", ""],
    ["Federal Reserve", ""], ["DRAM", ""], ["interest rates", ""],
];

let fail = 0;
for (const [input, expected] of CASES) {
    const got = normalizeAsset(input);
    if (got !== expected) {
        fail++;
        console.error(`✗ "${input}" → ${got} (beklenen: ${expected})`);
    }
}
console.log(`${CASES.length - fail}/${CASES.length} geçti.`);
process.exit(fail ? 1 : 0);
