import { NextRequest, NextResponse } from "next/server";
import { getNextExpectedWindows } from "@/lib/intelligence";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const channelId = searchParams.get("channelId");
        if (!channelId) throw new Error("channelId gerekli");

        const windows = await getNextExpectedWindows(channelId);
        return NextResponse.json({ success: true, windows });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
