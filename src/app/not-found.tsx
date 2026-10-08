import Link from "next/link";
import { assetSeoName } from "@/lib/asset-seo";
import { assetSlug } from "@/lib/slug";

/**
 * 404 çıkmaz sokak olmasın: kullanıcıya ve tarayıcıya sitenin ana başlıklarına
 * giden bağlantılar verilir. (Next.js bu sayfaya otomatik "noindex" ekler.)
 */
const SUGGESTED = ["ALTIN", "USD/TRY", "XU100", "BTC", "GÜMÜŞ", "CL=F"];

export default function NotFound() {
    return (
        <section className="wrap section stack gap-16" style={{ textAlign: "center", paddingBlock: 90 }}>
            <h1 className="h1" style={{ fontSize: "2rem" }}>Sayfa bulunamadı</h1>
            <p className="lead">Aradığınız sayfa taşınmış veya hiç var olmamış olabilir.</p>
            <Link href="/" className="btn btn-primary" style={{ alignSelf: "center" }}>Ana sayfaya dön</Link>

            <div className="stack gap-8" style={{ alignItems: "center", marginTop: 12 }}>
                <span className="eyebrow">Bunlara göz atabilirsiniz</span>
                <div className="row gap-8 wrapflex" style={{ justifyContent: "center" }}>
                    {SUGGESTED.map((a) => (
                        <Link key={a} href={`/varlik/${assetSlug(a)}`} className="chip">{assetSeoName(a)} yorumları</Link>
                    ))}
                    <Link href="/rehber" className="chip">Ekonomi rehberi</Link>
                    <Link href="/konsensus" className="chip">Tüm varlıklar</Link>
                </div>
            </div>
        </section>
    );
}
