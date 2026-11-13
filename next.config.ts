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

    /** Tarayıcılar ve botlar /favicon.ico'yu körlemesine ister; simge /icon rotasında üretiliyor. */
    async rewrites() {
        return [{ source: "/favicon.ico", destination: "/icon" }];
    },

    async redirects() {
        return [
            { source: "/forecasts", destination: "/konsensus", permanent: true },
            // /analistler (puanlı kanal listesi) Kasım 2026'da kaldırıldı; yorumcu sayfaları ana sayfadan bağlanır.
            { source: "/economists", destination: "/#yorumcular", permanent: true },
            { source: "/analistler", destination: "/#yorumcular", permanent: true },
            { source: "/privacy", destination: "/gizlilik", permanent: true },
            // /varlik tek başına bir sayfa değil; adresi kısaltan kişi/tarayıcı 404 görmesin.
            { source: "/analist", destination: "/#yorumcular", permanent: true },
            { source: "/varlik", destination: "/konsensus", permanent: true },
            { source: "/varlik/", destination: "/konsensus", permanent: true },
        ];
    },
};

export default nextConfig;
