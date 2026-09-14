import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { getBulletinIndex, getLatestBulletin } from "@/server/read";

export const revalidate = 600;

export const metadata: Metadata = {
    title: "Haftalık konsensüs bülteni",
    description:
        "Her hafta: takip edilen ekonomi yorumcularının görüşlerinde ne değişti, hangi varlıkta yön döndü, kim fikir değiştirdi.",
    alternates: { canonical: "/bulten" },
};

export default async function BultenListPage() {
    const [index, latest] = await Promise.all([getBulletinIndex(), getLatestBulletin()]);
    const items = index?.items ?? [];

    return (
        <>
            <section className="wrap" style={{ paddingBlock: "40px 8px", maxWidth: 760 }}>
                <span className="eyebrow">Her pazartesi</span>
                <h1 className="h1" style={{ fontSize: "clamp(1.7rem, 3.6vw, 2.4rem)", marginTop: 8 }}>
                    Haftalık bülten
                </h1>
                <p className="lead" style={{ marginTop: 12 }}>
                    Ana sayfa o anki sayımı gösterir. Bülten ise haftanın <em>farkını</em> anlatır:
                    hangi varlıkta baskın yön döndü, kim geçen hafta söylediğinin tersini söyledi.
                </p>
            </section>

            <section className="wrap section">
                {items.length === 0 ? (
                    <div className="card card-pad" style={{ textAlign: "center", paddingBlock: 56 }}>
                        <strong>İlk bülten hazırlanıyor</strong>
                        <p className="small" style={{ marginTop: 8 }}>
                            Bültenler her pazartesi otomatik olarak üretiliyor.
                        </p>
                    </div>
                ) : (
                    <ol className="stack gap-12" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {items.map((it, i) => (
                            <li key={it.id}>
                                <Link href={`/bulten/${it.id}`} className="card card-hover card-pad between"
                                    style={{ textDecoration: "none", alignItems: "center", gap: 16 }}>
                                    <span className="stack gap-4">
                                        <strong style={{ fontSize: 16 }}>{it.weekLabel}</strong>
                                        <span className="tiny">
                                            {it.signalCount} sinyal
                                            {i === 0 && latest ? ` · ${latest.flips.length} yön değişimi` : ""}
                                        </span>
                                    </span>
                                    <span className="mono tiny">{it.id}</span>
                                </Link>
                            </li>
                        ))}
                    </ol>
                )}
            </section>

            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} />
        </>
    );
}
