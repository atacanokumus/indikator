import Link from "next/link";

export default function NotFound() {
    return (
        <section className="wrap section stack gap-16" style={{ textAlign: "center", paddingBlock: 90 }}>
            <h1 className="h1" style={{ fontSize: "2rem" }}>Sayfa bulunamadı</h1>
            <p className="lead">Aradığınız sayfa taşınmış veya hiç var olmamış olabilir.</p>
            <Link href="/" className="btn btn-primary" style={{ alignSelf: "center" }}>Ana sayfaya dön</Link>
        </section>
    );
}
