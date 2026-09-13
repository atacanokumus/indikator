import { NextResponse } from "next/server";
import { getHomeSnapshot } from "@/server/read";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    const snapshot = await getHomeSnapshot();
    return NextResponse.json(snapshot, {
        headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600" },
    });
}
