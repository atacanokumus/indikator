import { serializeJsonLd } from "@/lib/seo";

/** Yapılandırılmış veriyi sayfaya güvenli biçimde gömer (bkz. serializeJsonLd). */
export function JsonLd({ data }: { data: object | object[] }) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
        />
    );
}
