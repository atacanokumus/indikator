import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Allowed domains for API access
const ALLOWED_ORIGINS = [
    'https://ecotube-b18e8.web.app',
    'https://ecotube-b18e8.firebaseapp.com',
    'https://ecotube.web.app',
    'https://ecotube.firebaseapp.com',
    'https://indikator.vercel.app',
    'https://indikator-atacanokumus-8322s-projects.vercel.app'
];

export function middleware(request: NextRequest) {
    // Securing /api routes
    if (request.nextUrl.pathname.startsWith('/api/')) {

        // 0. Vercel Cron & Sync: Allow internal triggers (they have no origin/referer headers)
        // These routes have their own authorization checks (CRON_SECRET / AdminService)
        if (request.nextUrl.pathname === '/api/cron' || request.nextUrl.pathname === '/api/sync') {
            return NextResponse.next();
        }

        // 1. Heavy Operations Protection (Cron / Sync)
        // Ensures nobody can spam your server costs by triggering prices sync.
        if (request.nextUrl.pathname.startsWith('/api/sync/')) {
            const auth = request.headers.get('authorization');
            const expectedSecret = process.env.SYNC_SECRET || "ecotube-super-secret-sync-key";
            if (auth !== `Bearer ${expectedSecret}`) {
                return new NextResponse(JSON.stringify({
                    error: "Fortress Guard: Unauthorized Sync Activity",
                    code: "FORTRESS_401"
                }), {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }

        // 2. Data Endpoint Protection (Preventing API Theft & Scraping)
        const referer = request.headers.get('referer');
        const origin = request.headers.get('origin');

        // Allow localhost for development
        if (request.nextUrl.hostname === 'localhost' || request.nextUrl.hostname === '127.0.0.1') {
            return NextResponse.next();
        }

        // Verify if the request comes from our own frontend
        let isValidSource = false;

        if (origin && ALLOWED_ORIGINS.some(o => origin.startsWith(o))) {
            isValidSource = true;
        } else if (referer && ALLOWED_ORIGINS.some(o => referer.startsWith(o))) {
            isValidSource = true;
        }

        // Also allow requests from any Vercel deployment of this project
        if (!isValidSource) {
            const vercelPattern = /https:\/\/indikator[a-z0-9-]*\.vercel\.app/;
            if ((origin && vercelPattern.test(origin)) || (referer && vercelPattern.test(referer))) {
                isValidSource = true;
            }
        }

        // Block Postman, cURL, or other unauthorized websites.
        if (!isValidSource) {
            return new NextResponse(JSON.stringify({
                error: "Fortress Guard: Access Denied.",
                message: "This API is protected. It can only be called from authorized ECOTUBE interfaces."
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    // Add security headers to the response
    const response = NextResponse.next();
    response.headers.set('X-Frame-Options', 'DENY'); // Prevent clickjacking
    response.headers.set('X-Content-Type-Options', 'nosniff'); // Prevent MIME type sniffing
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    return response;
}

export const config = {
    matcher: '/api/:path*',
};
