import Link from "next/link";
import type { AssetConsensus } from "@/lib/types";
import { assetLabel, formatPrice, relativeTime } from "@/lib/display";
import { assetSlug } from "@/lib/slug";
import { TallyBar, TallyHeadline, TallySentence } from "./Tally";

/**
 * Ana sayfada "hemen cevap" kartı.
 * Tavsiye göstermez; en çok hangi yönde kaç analistin konuştuğunu gösterir.
 */
export function SpotlightCard({ item }: { item: AssetConsensus }) {
    const price = formatPrice(item.price, item.currency);

    return (
        <Link
            href={`/varlik/${assetSlug(item.asset)}`}
            className="card card-hover card-pad stack gap-12"
            style={{ textDecoration: "none" }}
        >
            <div className="between" style={{ alignItems: "flex-start" }}>
                <span className="h3">{assetLabel(item.asset)}</span>
                {price && (
                    <span className="mono" style={{ fontSize: 15, fontWeight: 700 }}>
                        {price}
                    </span>
                )}
            </div>

            <TallyHeadline
                leading={item.leading}
                leadingCount={item.leadingCount}
                total={item.analystCount}
            />

            <TallyBar tally={item.tally} total={item.analystCount} />

            <TallySentence tally={item.tally} total={item.analystCount} size="sm" />

            <span className="tiny">Son görüş: {relativeTime(item.latestSignalAt)}</span>
        </Link>
    );
}
