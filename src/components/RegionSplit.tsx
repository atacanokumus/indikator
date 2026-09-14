import type { AssetConsensus } from "@/lib/types";

/**
 * Yerli / yabancı analist dağılımı.
 * Sitenin en ayırt edici tarafı bu: aynı varlıkta hem Türk hem yabancı
 * yorumcuların ne dediğini bir arada görüyorsunuz.
 */
export function RegionSplit({ split }: { split: AssetConsensus["regionSplit"] }) {
    const tr = split?.TR ?? 0;
    const gl = split?.GLOBAL ?? 0;
    if (tr + gl === 0) return null;

    return (
        <span className="region-split">
            {tr > 0 && (
                <span className="rs-item">
                    <span className="rs-flag" aria-hidden="true">🇹🇷</span>
                    <strong>{tr}</strong> yerli
                </span>
            )}
            {tr > 0 && gl > 0 && <span className="rs-sep">·</span>}
            {gl > 0 && (
                <span className="rs-item">
                    <span className="rs-flag" aria-hidden="true">🌍</span>
                    <strong>{gl}</strong> yabancı
                </span>
            )}
        </span>
    );
}

/** Tek bir analist satırında gösterilen küçük bölge işareti */
export function RegionBadge({ region }: { region?: "TR" | "GLOBAL" }) {
    if (!region) return null;
    return (
        <span className="rs-badge" title={region === "TR" ? "Türkiye" : "Global"}>
            {region === "TR" ? "🇹🇷" : "🌍"}
        </span>
    );
}
