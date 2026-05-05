import { getFirestore, collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "./src/lib/firebase";

async function checkRecent() {
    if (!db) return;
    const q = query(collection(db, "analyses"), orderBy("analyzedAt", "desc"), limit(10));
    const snap = await getDocs(q);
    snap.forEach(doc => {
        const data = doc.data();
        console.log(`${data.channelTitle} - ${data.videoTitle} - ${data.analyzedAt.toDate().toLocaleString('tr-TR')} - Findings: ${data.results?.length || 0}`);
    });
    process.exit(0);
}

checkRecent();
