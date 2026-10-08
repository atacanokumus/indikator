import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";

/** Web uygulama bildirimi: "ana ekrana ekle" ve marka simgesi için. */
export default function manifest(): MetadataRoute.Manifest {
    return {
        name: SITE_NAME,
        short_name: SITE_NAME,
        description: SITE_DESCRIPTION,
        start_url: "/",
        display: "standalone",
        lang: "tr",
        background_color: "#0b1119",
        theme_color: "#0d4d5c",
        icons: [
            { src: "/icon", sizes: "192x192", type: "image/png" },
            { src: "/logo.png", sizes: "512x512", type: "image/png" },
        ],
    };
}
