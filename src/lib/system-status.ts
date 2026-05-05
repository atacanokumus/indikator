import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export interface SyncStatus {
    isAnalyzing: boolean;
    currentChannel: string;
    currentVideo: string;
    lastUpdated: number;
}

const STATUS_DOC_ID = "sync_state";
const STATUS_COLLECTION = "system_status";

export const setSyncStatus = async (status: Partial<SyncStatus>) => {
    if (!db) return;
    try {
        const docRef = doc(db, STATUS_COLLECTION, STATUS_DOC_ID);
        await setDoc(docRef, {
            ...status,
            lastUpdated: Date.now()
        }, { merge: true });
    } catch (err) {
        console.error("Failed to update sync status:", err);
    }
};

export const getSyncStatus = async (): Promise<SyncStatus | null> => {
    if (!db) return null;
    try {
        const docRef = doc(db, STATUS_COLLECTION, STATUS_DOC_ID);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
            return snapshot.data() as SyncStatus;
        }
        return null;
    } catch (err) {
        console.error("Failed to get sync status:", err);
        return null;
    }
};
