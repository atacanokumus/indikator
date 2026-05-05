import Parser from 'rss-parser';
import { getModel } from '@/lib/gemini';

const parser = new Parser();

export interface NewsItem {
    id: string;
    title: string;
    link: string;
    pubDate: string;
    source: string;
    summary?: string;
    sentiment?: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    relatedAssets?: string[];
}

const NEWS_SOURCES = [
    { name: 'Cointelegraph', url: 'https://cointelegraph.com/rss', category: 'CRYPTO' },
    { name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', category: 'CRYPTO' },
    { name: 'Uzmanpara', url: 'https://www.milliyet.com.tr/rss/rssuzmanpara.xml', category: 'BIST' },
    { name: 'Investing.com TR', url: 'https://tr.investing.com/rss/news_25.rss', category: 'BIST' }
];

export const fetchLatestNews = async (): Promise<NewsItem[]> => {
    const allNews: NewsItem[] = [];

    for (const source of NEWS_SOURCES) {
        try {
            const feed = await parser.parseURL(source.url);
            const items = feed.items.slice(0, 5).map(item => ({
                id: item.guid || item.link || '',
                title: item.title || '',
                link: item.link || '',
                pubDate: item.pubDate || '',
                source: source.name
            }));
            allNews.push(...items);
        } catch (error) {
            console.error(`Error fetching news from ${source.name}:`, error);
        }
    }

    // Sort by date newest first
    return allNews.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
};

export const analyzeNewsItem = async (newsItem: NewsItem): Promise<NewsItem> => {
    try {
        const prompt = `
      Sen bir finansal haber analiz asistanısın. Aşağıdaki haberi kısaca analiz et.
      Haber Başlığı: ${newsItem.title}
      
      Görevlerin:
      1. Haberi 1 kısa cümle ile özetle.
      2. Haberin duygusunu belirle (POSITIVE, NEGATIVE, NEUTRAL).
      3. Haberin ilgili olduğu varlıkları (BTC, ALTIN, THYAO, USD vb.) tespit et.
      
      Çıktıyı SADECE bu JSON formatında döndür:
      {
        "summary": "...",
        "sentiment": "POSITIVE/NEGATIVE/NEUTRAL",
        "relatedAssets": ["...", "..."]
      }
    `;

        const result = await getModel().generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            const analysis = JSON.parse(jsonMatch[0]);
            return {
                ...newsItem,
                summary: analysis.summary,
                sentiment: analysis.sentiment,
                relatedAssets: analysis.relatedAssets
            };
        }
    } catch (error) {
        console.error('Error analyzing news item:', error);
    }
    return newsItem;
};
