import { db, storage } from "./firebase";
import {
    collection,
    setDoc,
    query,
    getDocs,
    orderBy,
    limit,
    Timestamp,
    doc,
    where,
    deleteDoc
} from "firebase/firestore";

const COLLECTION_NAME = "analyses";

export interface Analysis {
    asset: string;
    recommendation: 'AL' | 'SAT' | 'TUT' | 'GÖZLEMLE';
    score?: number;
    timeframe: 'KISA' | 'ORTA' | 'UZUN';
    reasoning: string;
    targetPrice?: number | string | null;
    entryPrice?: number | null;
    exitPrice?: number | null;
    evaluatedAt?: Timestamp | null;
    isEvaluated?: boolean;
    status?: 'PENDING' | 'SUCCESS' | 'FAILURE' | 'NEUTRAL';
}

export interface VideoAnalysis {
    videoId: string;
    videoTitle: string;
    channelId: string;
    channelTitle: string;
    channelThumbnail?: string;
    thumbnail: string;
    publishedAt: string;
    analyzedAt: Timestamp;
    results: Analysis[];
}

export interface Channel {
    id: string;
    title: string;
    thumbnail?: string;
    handle?: string;
    addedAt: Timestamp;
    totalScore?: number;
    predictionCount?: number;
    successRate?: number;
    weight?: number;
}

export const saveAnalysis = async (analysis: VideoAnalysis) => {
    try {
        const analysisRef = doc(db!, "analyses", analysis.videoId);
        await setDoc(analysisRef, analysis);
        console.log(`Firestore: Saved analysis for ${analysis.videoId}`);
    } catch (error: any) {
        console.error("Firestore Save Error:", error);
        throw new Error(`Firestore Kayıt Hatası: ${error.message}`);
    }
};

export const getLatestAnalyses = async (n = 100) => {
    try {
        const q = query(
            collection(db!, "analyses"),
            orderBy("publishedAt", "desc"),
            limit(n)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data() as VideoAnalysis);
    } catch (error: any) {
        console.error("Firestore Load Error:", error);
        return [];
    }
};

/**
 * Son N gün içindeki analizleri getirir, her kanal (analist) için sadece en son videoyu tutar.
 * Bu, eski "AL" sinyallerinin yeni "SAT" sinyalleriyle çakışmasını engeller.
 * 
 * @param maxAgeDays - Kaç günlük pencere (varsayılan: 7)
 */
export const getLatestAnalysesFiltered = async (maxAgeDays: number = 7): Promise<VideoAnalysis[]> => {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);
        const cutoffStr = cutoffDate.toISOString();

        const q = query(
            collection(db!, "analyses"),
            where("publishedAt", ">=", cutoffStr),
            orderBy("publishedAt", "desc")
        );
        const snapshot = await getDocs(q);
        const allAnalyses = snapshot.docs.map(doc => doc.data() as VideoAnalysis);

        // Her kanal için sadece en son videoyu tut
        const channelLatest = new Map<string, VideoAnalysis>();
        for (const analysis of allAnalyses) {
            const existing = channelLatest.get(analysis.channelId);
            if (!existing || new Date(analysis.publishedAt) > new Date(existing.publishedAt)) {
                channelLatest.set(analysis.channelId, analysis);
            }
        }

        return Array.from(channelLatest.values())
            .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    } catch (error: any) {
        console.error("Firestore Latest Per Channel Error:", error);
        return [];
    }
};

export const checkVideoAnalysisExists = async (videoId: string): Promise<boolean> => {
    if (!videoId) return false;
    try {
        const q = query(collection(db!, "analyses"), where("videoId", "==", videoId));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error("Error checking analysis existence:", error);
        return false;
    }
};

export const getChannels = async (): Promise<Channel[]> => {
    if (!db) {
        console.error("Firestore Error: Database not initialized. Check Firebase config.");
        return [];
    }
    try {
        const q = query(collection(db!, "channels"), orderBy("addedAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data() as Channel);
    } catch (error) {
        console.error("Firestore Get Channels Error:", error);
        return [];
    }
};

export const addChannel = async (channel: Channel) => {
    try {
        await setDoc(doc(db!, "channels", channel.id), channel);
        return true;
    } catch (error) {
        console.error("Firestore Add Channel Error:", error);
        return false;
    }
};

export const deleteChannel = async (channelId: string) => {
    try {
        await deleteDoc(doc(db!, "channels", channelId));
        return true;
    } catch (error) {
        console.error("Firestore Delete Channel Error:", error);
        return false;
    }
};

export const getAnalysesByChannel = async (channelId: string, n = 50) => {
    try {
        const q = query(
            collection(db!, "analyses"),
            where("channelId", "==", channelId),
            orderBy("publishedAt", "desc"),
            limit(n)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data() as VideoAnalysis);
    } catch (error: any) {
        console.error("Firestore Channel Load Error:", error);
        return [];
    }
};

export const updateStoredPrice = async (asset: string, price: number, currency: string) => {
    try {
        const safeAssetId = asset.replace(/\//g, '-');
        const priceRef = doc(db!, "prices", safeAssetId);
        await setDoc(priceRef, {
            asset,
            price,
            currency,
            updatedAt: Timestamp.now()
        });
    } catch (error) {
        console.error("Firestore Update Price Error:", error);
    }
};

export const getStoredPrices = async () => {
    try {
        const snapshot = await getDocs(collection(db!, "prices"));
        const prices: Record<string, { price: number; currency: string }> = {};
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            prices[data.asset] = { price: data.price, currency: data.currency };
        });
        return prices;
    } catch (error) {
        console.error("Firestore Get Prices Error:", error);
        return {};
    }
};

// ==================== Firebase Storage Audio Helpers ====================
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

const AUDIO_STORAGE_PATH = "audio";

export const uploadAudioToStorage = async (videoId: string, audioBuffer: Buffer, mimeType: string = "audio/mpeg"): Promise<string> => {
    try {
        const storageRef = ref(storage!, `${AUDIO_STORAGE_PATH}/${videoId}.mp3`);
        const uint8 = new Uint8Array(audioBuffer);
        await uploadBytes(storageRef, uint8, { contentType: mimeType });
        const downloadUrl = await getDownloadURL(storageRef);
        console.log(`[STORAGE] Audio uploaded for ${videoId} (${(audioBuffer.length / 1024 / 1024).toFixed(2)} MB)`);
        return downloadUrl;
    } catch (error: any) {
        console.error("[STORAGE] Upload Error:", error);
        throw new Error(`Firebase Storage Yükleme Hatası: ${error.message}`);
    }
};

export const getAudioDownloadUrl = async (videoId: string): Promise<string | null> => {
    try {
        const storageRef = ref(storage!, `${AUDIO_STORAGE_PATH}/${videoId}.mp3`);
        return await getDownloadURL(storageRef);
    } catch {
        return null;
    }
};

export const deleteAudioFromStorage = async (videoId: string): Promise<void> => {
    try {
        const storageRef = ref(storage!, `${AUDIO_STORAGE_PATH}/${videoId}.mp3`);
        await deleteObject(storageRef);
        console.log(`[STORAGE] Audio deleted for ${videoId}`);
    } catch (error: any) {
        // Don't throw - cleanup failures shouldn't break the pipeline
        console.warn(`[STORAGE] Delete warning for ${videoId}: ${error.message}`);
    }
};

