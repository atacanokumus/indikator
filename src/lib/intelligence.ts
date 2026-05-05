import { getAnalysesByChannel, VideoAnalysis } from "./firestore";

interface PublishingPattern {
    dayOfWeek: number; // 0-6
    hour: number;      // 0-23
    frequency: number;
}

export const getChannelPublishingPatterns = async (channelId: string): Promise<PublishingPattern[]> => {
    const historicalData = await getAnalysesByChannel(channelId, 100);
    if (historicalData.length === 0) return [];

    const stats: Record<string, number> = {};

    historicalData.forEach(analysis => {
        const date = new Date(analysis.publishedAt);
        const day = date.getDay();
        const hour = date.getHours();
        const key = `${day}-${hour}`;
        stats[key] = (stats[key] || 0) + 1;
    });

    return Object.entries(stats).map(([key, freq]) => {
        const [day, hour] = key.split("-").map(Number);
        return { dayOfWeek: day, hour, frequency: freq };
    }).sort((a, b) => b.frequency - a.frequency);
};

export const shouldCheckChannelNow = async (channelId: string): Promise<boolean> => {
    const patterns = await getChannelPublishingPatterns(channelId);
    const now = new Date();
    const currentDay = now.getDay();
    const currentHour = now.getHours();

    // 1. Eğer kanalın bu saatte/günde geçmişte en az bir videosu varsa kontrol et
    const match = patterns.find(p => p.dayOfWeek === currentDay && p.hour === currentHour);
    if (match) {
        console.log(`[INTEL] Match found for ${channelId} at this window (${currentDay}-${currentHour}). Frequency: ${match.frequency}`);
        return true;
    }

    // 2. Fallback: Eğer hiç geçmiş veri yoksa veya bu saatte hiç videosu olmamışsa, 
    // her 12 saatte bir genel kontrol yap (örneğin gece yarısı ve öğle vakti)
    if (currentHour === 0 || currentHour === 12) {
        console.log(`[INTEL] Fallback check for ${channelId} at ${currentHour}:00`);
        return true;
    }

    // 3. Çok yeni bir kanalsa (hiç veri yoksa) her saat başı kontrol et ki ilk verileri toplayabilelim
    if (patterns.length === 0) return true;

    return false;
};

export const getNextExpectedWindows = async (channelId: string) => {
    const patterns = await getChannelPublishingPatterns(channelId);
    return patterns.slice(0, 3); // En yüksek ihtimalli 3 pencere
};
