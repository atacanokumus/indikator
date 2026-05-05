import { NextResponse } from 'next/server';
import { fetchLatestNews, analyzeNewsItem } from '@/services/news-service';

export async function GET() {
    try {
        const rawNews = await fetchLatestNews();

        // For now, let's analyze only the top 5 to avoid long wait times/rate limits
        const newsToAnalyze = rawNews.slice(0, 10);

        const analyzedNews = await Promise.all(
            newsToAnalyze.map(item => analyzeNewsItem(item))
        );

        return NextResponse.json(analyzedNews);
    } catch (error) {
        console.error('API /api/news error:', error);
        return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
    }
}
