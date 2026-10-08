import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Rehber metinlerinde kullanılan iki işaretlemeyi çevirir:
 *   **kalın**           -> <strong>
 *   [metin](/adres)     -> <Link> (site içi) ya da <a rel="noopener"> (dış)
 *
 * Neden HTML değil: içerik dosyası (src/content/guides.ts) düz metin kalsın,
 * yanlışlıkla bir betik/etiket sızdırmasın. Tüm çıktı React düğümüdür;
 * dangerouslySetInnerHTML kullanılmaz.
 */
const TOKEN = /(\*\*.+?\*\*|\[[^\]]+\]\([^)]+\))/g;

export function Inline({ text }: { text: string }): ReactNode {
    const parts = text.split(TOKEN).filter((p) => p !== "");
    return (
        <>
            {parts.map((part, i) => {
                if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
                    return <strong key={i}><Inline text={part.slice(2, -2)} /></strong>;
                }
                const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
                if (link) {
                    const [, label, href] = link;
                    if (href.startsWith("/")) return <Link key={i} href={href}>{label}</Link>;
                    return <a key={i} href={href} rel="noopener noreferrer" target="_blank">{label}</a>;
                }
                return <span key={i}>{part}</span>;
            })}
        </>
    );
}
