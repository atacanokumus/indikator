import { getLatestAnalysesFiltered } from "./src/lib/firestore";

async function test() {
    console.log("Testing getLatestAnalysesFiltered (no 7-day limit)...");
    const analyses = await getLatestAnalysesFiltered();
    console.log(`\nToplam ${analyses.length} video (filtrelenmiş):`);
    
    let totalSignals = 0;
    const analystAssets = new Map<string, Set<string>>();
    
    for (const a of analyses) {
        console.log(`\n  ${a.channelTitle} — ${a.videoTitle} (${a.publishedAt})`);
        for (const r of a.results) {
            console.log(`    📊 ${r.asset}: ${r.recommendation} (skor: ${r.score})`);
            totalSignals++;
            
            if (!analystAssets.has(a.channelTitle)) analystAssets.set(a.channelTitle, new Set());
            analystAssets.get(a.channelTitle)!.add(r.asset);
        }
    }
    
    console.log(`\n=== ÖZET ===`);
    console.log(`Toplam sinyal: ${totalSignals}`);
    console.log(`Analist bazında emtia dağılımı:`);
    for (const [analyst, assets] of analystAssets) {
        console.log(`  ${analyst}: ${[...assets].join(', ')}`);
    }
    
    process.exit(0);
}

test();
