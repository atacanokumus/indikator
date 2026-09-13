import { NextResponse } from "next/server";
import { getNews } from "@/services/news-service";

export const runtime = "nodejs";
export const revalidate = 300;

export async function GET() {
    try {
        const news = await getNews();
        return NextResponse.json(news, {
            headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800" },
        });
    } catch (error) {
        console.error("[API] /api/news:", (error as Error).message);
        return NextResponse.json([], { status: 200 });
    }
}
