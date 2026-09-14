import type { Recommendation, Tally as TallyType } from "@/lib/types";
import { DIRECTION, DIRECTION_SUFFIX, tallyParts } from "@/lib/display";

/**
 * SAYIM GÖSTERİMİ
 *
 * Site kendi yatırım tavsiyesini vermez. Bu bileşen yalnızca "kaç analist
 * hangi yönde konuştu" bilgisini gösterir. Okuyucu ALIM/SATIŞ/BEKLE/GÖZLEMLE
 * kelimelerini net görür, ama bunlar ona verilmiş bir talimat değil,
 * başkalarının söylediklerinin sayımıdır.
 */

/** "7 analistin 4'ü ALIM yönünde, 2'si BEKLE diyor" */
export function TallySentence({
    tally,
    total,
    size = "md",
}: {
    tally: TallyType;
    total: number;
    size?: "sm" | "md" | "lg";
}) {
    const parts = tallyParts(tally);
    if (parts.length === 0) return null;

    return (
        <p className={`tally-sentence tally-${size}`}>
            <span className="tally-lead">{total} analistin</span>{" "}
            {parts.map((part, i) => (
                <span key={part.rec} className="tally-part">
                    <span className="tally-count">{part.count}</span>
                    <span className="tally-eki">{suffixFor(part.count)}</span>{" "}
                    <strong className={`dir dir-${part.rec}`}>{DIRECTION[part.rec]}</strong>{" "}
                    <span className="tally-tail">{DIRECTION_SUFFIX[part.rec]}</span>
                    {i < parts.length - 1 ? <span className="tally-sep">, </span> : null}
                </span>
            ))}
        </p>
    );
}

/** Türkçe iyelik eki: 4'ü, 2'si, 1'i, 3'ü, 5'i… */
function suffixFor(n: number): string {
    const map: Record<number, string> = {
        1: "'i", 2: "'si", 3: "'ü", 4: "'ü", 5: "'i",
        6: "'sı", 7: "'si", 8: "'i", 9: "'u", 10: "'u",
    };
    return map[n] ?? "'i";
}

/** Yönlere göre renkli, oranlı çubuk. */
export function TallyBar({ tally, total }: { tally: TallyType; total: number }) {
    const parts = tallyParts(tally);
    const sum = Math.max(1, total);
    return (
        <div className="tally-bar" role="img" aria-label={ariaLabel(parts, total)}>
            {parts.map((p) => (
                <span
                    key={p.rec}
                    className={`bar-${p.rec}`}
                    style={{ width: `${(p.count / sum) * 100}%` }}
                />
            ))}
        </div>
    );
}

function ariaLabel(parts: { rec: Recommendation; count: number }[], total: number) {
    return (
        `${total} analistten ` +
        parts.map((p) => `${p.count} tanesi ${DIRECTION[p.rec]}`).join(", ") +
        " yönünde"
    );
}

/** Büyük, tek bakışta okunan başlık: baskın yön + oran. Kart üstlerinde. */
export function TallyHeadline({
    leading,
    leadingCount,
    total,
}: {
    leading: Recommendation;
    leadingCount: number;
    total: number;
}) {
    return (
        <div className="tally-headline">
            <span className="th-frac">
                <span className="th-num">{leadingCount}</span>
                <span className="th-slash">/</span>
                <span className="th-den">{total}</span>
            </span>
            <span className={`th-word dir dir-${leading}`}>{DIRECTION[leading]}</span>
        </div>
    );
}
