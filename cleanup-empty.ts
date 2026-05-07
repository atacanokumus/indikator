import { collection, query, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "./src/lib/firebase";

async function cleanup() {
    if (!db) { console.error("DB init failed"); process.exit(1); }
    
    console.log("=== Boş analizleri (0 sonuç) Firestore'dan temizliyorum ===\n");
    
    const q = query(collection(db, "analyses"));
    const snap = await getDocs(q);
    
    let deleted = 0;
    let kept = 0;
    
    for (const d of snap.docs) {
        const data = d.data();
        const results = data.results || [];
        if (results.length === 0) {
            console.log(`  🗑️  SİLİNDİ: ${data.channelTitle} — ${data.videoTitle} (${d.id})`);
            await deleteDoc(doc(db, "analyses", d.id));
            deleted++;
        } else {
            kept++;
        }
    }
    
    console.log(`\n✅ Temizlik tamamlandı: ${deleted} boş analiz silindi, ${kept} geçerli analiz korundu.`);
    process.exit(0);
}

cleanup();
