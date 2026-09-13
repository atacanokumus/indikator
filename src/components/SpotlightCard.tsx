import type { AssetConsensus } from "@/lib/types";
import { assetLabel, formatPrice, relativeTime, signalClass, SIGNAL_LABEL } from "@/lib/display";

/** Ana sayfada "hemen cevap" kartı: varlık + fiyat + konsensüs. */
export function SpotlightCard({ item }: { item: AssetConsensus }) {
    const price = formatPrice(item.price, item.currency);
    const total = Math.max(1, item.breakdown.AL + item.breakdown.SAT + item.breakdown.BEKLE);

    return (
        <a href={`#varlik-${encodeURIComponent(item.asset)}`} className="card card-hover card-pad stack gap-12"
            style={{ textDecoration: "none" }}>
            <div className="between" style={{ alignItems: "flex-start" }}>
                <div className="stack">
                    <span className="h3">{assetLabel(item.asset)}</span>
                    <span className="mono" style={{ fontSize: 19, fontWeight: 700, marginTop: 2 }}>
                        {price ?? <span className="tiny" style={{ fontWeight: 400 }}>fiyat yok</span>}
                    </span>
                </div>
                <span className={signalClass(item.recommendation)}>{SIGNAL_LABEL[item.recommendation]}</span>
            </div>

            <div className="meter" aria-hidden="true">
                {item.breakdown.AL > 0 && <i className="m-al" style={{ width: `${(item.breakdown.AL / total) * 100}%` }} />}
                {item.breakdown.SAT > 0 && <i className="m-sat" style={{ width: `${(item.breakdown.SAT / total) * 100}%` }} />}
                {item.breakdown.BEKLE > 0 && <i className="m-bekle" style={{ width: `${(item.breakdown.BEKLE / total) * 100}%` }} />}
            </div>

            <div className="between">
                <span className="tiny">{item.analystCount} analist</span>
                <span className="tiny">{relativeTime(item.latestSignalAt)}</span>
            </div>
        </a>
    );
}
