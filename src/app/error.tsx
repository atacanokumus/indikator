"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
    return (
        <section className="wrap section stack gap-16" style={{ textAlign: "center", paddingBlock: 90 }}>
            <h1 className="h1" style={{ fontSize: "2rem" }}>Bir şeyler ters gitti</h1>
            <p className="lead">Sayfa yüklenirken beklenmeyen bir hata oluştu.</p>
            <button className="btn btn-primary" style={{ alignSelf: "center" }} onClick={reset}>
                Tekrar dene
            </button>
        </section>
    );
}
