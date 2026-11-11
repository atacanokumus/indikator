import { Inline } from "@/components/RichText";
import type { Block } from "@/content/guides";

/**
 * Rehber ve araç sayfalarının ortak metin blokları (paragraf, liste, formül, not).
 * İçerik dosyaları düz veri tutar; görünüm tek yerde kalsın diye burada çizilir.
 */
export function renderBlock(b: Block, i: number) {
    switch (b.t) {
        case "p":
            return <p key={i}><Inline text={b.text} /></p>;
        case "ul":
            return <ul key={i}>{b.items.map((it, j) => <li key={j}><Inline text={it} /></li>)}</ul>;
        case "ol":
            return <ol key={i}>{b.items.map((it, j) => <li key={j}><Inline text={it} /></li>)}</ol>;
        case "formula":
            return (
                <div key={i} className="formula" role="note">
                    {b.text}
                    {b.caption && <small>{b.caption}</small>}
                </div>
            );
        case "note":
            return <div key={i} className="note" role="note"><Inline text={b.text} /></div>;
    }
}
