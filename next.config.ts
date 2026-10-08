import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    compress: true,

    images: {
        formats: ["image/avif", "image/webp"],
        remotePatterns: [
            { protocol: "https", hostname: "i.ytimg.com" },
            { protocol: "https", hostname: "yt3.ggpht.com" },
        ],
    },

    // firebase-admin sunucu tarafı paketlerini bundle'a katma
    serverExternalPackages: ["firebase-admin"],

    async redirects() {
        return [
            { source: "/forecasts", destination: "/konsensus", permanent: true },
            { source: "/economists", destination: "/analistler", permanent: true },
            { source: "/privacy", destination: "/gizlilik", permanent: true },
            // /varlik tek başına bir sayfa değil; adresi kısaltan kişi/tarayıcı 404 görmesin.
            { source: "/varlik", destination: "/konsensus", permanent: true },
            { source: "/varlik/", destination: "/konsensus", permanent: true },
        ];
    },
};

export default nextConfig;
