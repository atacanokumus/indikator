import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { RegionBadge } from "@/components/RegionSplit";
import { assetLabel, formatDateTr } from "@/lib/display";
import { assetSlug } from "@/lib/slug";
import { getScorecard } from "@/server/read";
import type { ScorecardRow } from "@/server/scorecard";

export const revalidate = 300;

export const metadata: Metadata = {
    title: "İsabet karnesi — söylenenler sonradan tuttu mu?",
    description:
        "Takip edilen YouTube ekonomi yorumcularının geçmiş görüşleri, vadesi dolduğunda fiyatın gerçekten o yönde hareket edip etmediğine göre ölçüldü. Yöntem ve örneklem sayıları açık.",
    alternates: { canonical: "/karne" },
};

function pct(hit: number, measured: number) {
    return measured > 0 ? Math.round((hit / measured) * 100) : 0;
}

/** Oranı olmayan (örneklemi az) kanallar için tek tip gösterim. */
function RateCell({ row, minSample }: { row: ScorecardRow; minSample: number }) {
    if (row.hitRate === null) {
        return (
            <span className="tiny" style={{ color: "var(--text-muted)" }}>
                örneklem yetersiz
                <br />
                <span className="mono">{row.measured}/{minSample}</span>
            </span>
        );
    }
    return (
        <span className="mono" style={{ fontSize: 20, fontWeight: 700 }}>
            %{row.hitRate}
        </span>
    );
}

function Bar({ hit, miss, flat }: { hit: number; miss: number; flat: number }) {
    const total = Math.max(1, hit + miss + flat);
    const seg = (n: number, cls: string, label: string) =>
        n > 0 ? (
            <span
                key={cls}
                className={cls}
                title={`${label}: ${n}`}
                style={{ width: `${(n / total) * 100}%` }}
            />
        ) : null;
    return (
        <div className="tally-bar" role="img" aria-label={`${hit} tuttu, ${flat} yatay kaldı, ${miss} tutmadı`}>
            {seg(hit, "bar-AL", "Tuttu")}
            {seg(flat, "bar-TUT", "Yatay kaldı")}
            {seg(miss, "bar-SAT", "Tutmadı")}
        </div>
    );
}

export default async function KarnePage() {
    const card = await getScorecard();

    if (!card || card.rows.length === 0) {
        return (
            <section className="wrap section">
                <div className="card card-pad" style={{ textAlign: "center", paddingBlock: 56 }}>
                    <strong>Karne henüz hesaplanmadı</strong>
                    <p className="small" style={{ marginTop: 8 }}>
                        Görüşler vadesi dolduktan sonra ölçülüyor; ilk sonuçlar birikince burada olacak.
                    </p>
                </div>
            </section>
        );
    }

    const { totals, directionTotals, timeframeTotals, minSample, thresholdPct } = card;
    const overall = pct(totals.hit, totals.measured);
    const shown = card.rows.filter((r) => r.hitRate !== null);
    const hidden = card.rows.filter((r) => r.hitRate === null && r.measured + r.pending > 0);

    return (
        <>
            <section className="wrap" style={{ paddingBlock: "40px 8px", maxWidth: 760 }}>
                <span className="eyebrow">Özgün ölçüm</span>
                <h1 className="h1" style={{ fontSize: "clamp(1.7rem, 3.6vw, 2.4rem)", marginTop: 8 }}>
                    İsabet karnesi
                </h1>
                <p className="lead" style={{ marginTop: 12 }}>
                    Bir yorumcunun bugün ne dediğini bulmak kolay. Zor olan, geçen sefer ne dediğini ve
                    onun tutup tutmadığını hatırlamak. Bu sayfa tam olarak onu yapıyor:{" "}
                    <strong>{totals.measured.toLocaleString("tr-TR")}</strong> görüşün vadesi doldu ve
                    her biri fiyat verisiyle karşılaştırıldı.
                </p>
            </section>

            {/* Bütün kanalların birleşik tablosu — asıl haber burada */}
            <section className="wrap section-tight">
                <div className="grid-cards">
                    <div className="card card-pad stack gap-4">
                        <span className="mono" style={{ fontSize: 26, fontWeight: 700 }}>%{overall}</span>
                        <span className="small">
                            ölçülen {totals.measured.toLocaleString("tr-TR")} görüşün tuttuğu oran
                        </span>
                    </div>
                    <div className="card card-pad stack gap-4">
                        <span className="mono" style={{ fontSize: 26, fontWeight: 700 }}>
                            %{pct(totals.flat, totals.measured)}
                        </span>
                        <span className="small">
                            fiyatın ±%{String(thresholdPct).replace(".", ",")} bandında kaldığı,
                            yani hiçbir yöne gitmediği görüşler
                        </span>
                    </div>
                    <div className="card card-pad stack gap-4">
                        <span className="mono" style={{ fontSize: 26, fontWeight: 700 }}>
                            %{pct(directionTotals.AL.hit, directionTotals.AL.measured)}
                            <span style={{ fontSize: 15, color: "var(--text-muted)" }}> / </span>
                            %{pct(directionTotals.SAT.hit, directionTotals.SAT.measured)}
                        </span>
                        <span className="small">
                            alım yönlü görüşlerin ({directionTotals.AL.measured}) ve satış yönlü
                            görüşlerin ({directionTotals.SAT.measured}) isabeti
                        </span>
                    </div>
                    <div className="card card-pad stack gap-4">
                        <span className="mono" style={{ fontSize: 26, fontWeight: 700 }}>
                            {totals.pending.toLocaleString("tr-TR")}
                        </span>
                        <span className="small">
                            vadesi henüz dolmadığı için ölçülmeyen görüş —
                            ileride bu sayfaya eklenecek
                        </span>
                    </div>
                </div>
            </section>

            <section className="wrap section-tight">
                <div className="card card-pad stack gap-12">
                    <h2 className="h3">Vadeye göre</h2>
                    <p className="small" style={{ color: "var(--text-soft)" }}>
                        Kısa vadeli görüşler 7 gün, orta vadeliler 30 gün, uzun vadeliler 180 gün sonraki
                        fiyata göre ölçülüyor. Görüşün kendi vadesi neyse ölçüm penceresi o.
                    </p>
                    <div className="stack gap-12">
                        {(["KISA", "ORTA", "UZUN"] as const).map((tf) => {
                            const t = timeframeTotals[tf];
                            const label = tf === "KISA" ? "Kısa vade (7 gün)"
                                : tf === "ORTA" ? "Orta vade (30 gün)" : "Uzun vade (180 gün)";
                            return (
                                <div key={tf} className="stack gap-4">
                                    <div className="between">
                                        <span className="small" style={{ fontWeight: 600 }}>{label}</span>
                                        <span className="mono small">
                                            {t.measured > 0 ? `%${pct(t.hit, t.measured)}` : "—"}
                                            <span style={{ color: "var(--text-muted)" }}> · {t.measured} ölçüm</span>
                                        </span>
                                    </div>
                                    <Bar hit={t.hit} miss={t.measured - t.hit} flat={0} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP} />

            {/* Kanal kanal karne */}
            <section className="wrap section">
                <h2 className="h2" style={{ marginBottom: 6 }}>Kanal kanal</h2>
                <p className="small" style={{ color: "var(--text-soft)", marginBottom: 18, maxWidth: "62ch" }}>
                    Oran, yalnızca en az {minSample} ölçülmüş görüşü olan kanallar için hesaplanıyor.
                    Bunun altındaki bir örneklemde çıkan yüzde, o kişi hakkında bir şey söylemez —
                    bu yüzden hiç göstermiyoruz.
                </p>

                <div className="stack gap-12">
                    {shown.map((row) => (
                        <article key={row.channelId} className="card card-pad stack gap-12">
                            <div className="between" style={{ alignItems: "flex-start", gap: 16 }}>
                                <div className="row gap-12" style={{ minWidth: 0 }}>
                                    {row.thumbnail ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={row.thumbnail} alt="" width={40} height={40}
                                            className="avatar" loading="lazy" />
                                    ) : (
                                        <span className="avatar row" style={{
                                            width: 40, height: 40, justifyContent: "center",
                                            color: "var(--brand)", fontWeight: 800,
                                        }}>{row.title.charAt(0)}</span>
                                    )}
                                    <span className="stack gap-4" style={{ minWidth: 0 }}>
                                        <span className="row gap-6" style={{ fontWeight: 700 }}>
                                            <RegionBadge region={row.region} />
                                            <span className="truncate">{row.title}</span>
                                        </span>
                                        <span className="tiny">
                                            {row.measured} ölçülmüş görüş
                                            {row.unmeasurable > 0 && ` · ${row.unmeasurable} ölçülemedi`}
                                            {row.pending > 0 && ` · ${row.pending} vadesi dolmadı`}
                                        </span>
                                    </span>
                                </div>
                                <span style={{ textAlign: "right", flexShrink: 0 }}>
                                    <RateCell row={row} minSample={minSample} />
                                    <span className="tiny" style={{ display: "block" }}>tuttu</span>
                                </span>
                            </div>

                            <Bar hit={row.hit} miss={row.miss} flat={row.flat} />

                            <div className="row gap-12 wrapflex tiny">
                                <span><strong style={{ color: "var(--al)" }}>{row.hit}</strong> tuttu</span>
                                <span><strong style={{ color: "var(--bekle)" }}>{row.flat}</strong> yatay kaldı</span>
                                <span><strong style={{ color: "var(--sat)" }}>{row.miss}</strong> tutmadı</span>
                            </div>

                            {row.topAssets.length > 0 && (
                                <div className="row gap-8 wrapflex">
                                    <span className="tiny">En çok konuştukları:</span>
                                    {row.topAssets.map((a) => (
                                        <Link key={a.asset} href={`/varlik/${assetSlug(a.asset)}`} className="chip">
                                            {assetLabel(a.asset)}{" "}
                                            <span className="mono" style={{ color: "var(--text-muted)" }}>
                                                {a.measured}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </article>
                    ))}
                </div>

                {hidden.length > 0 && (
                    <div className="card card-pad stack gap-8" style={{ marginTop: 16 }}>
                        <h3 className="h3" style={{ fontSize: 16 }}>Henüz oranı gösterilmeyen kanallar</h3>
                        <p className="small" style={{ color: "var(--text-soft)" }}>
                            Bu kanalların görüşleri de ölçülüyor, ama örneklem {minSample} ölçüme ulaşana
                            kadar oran yayımlanmıyor.
                        </p>
                        <div className="row gap-8 wrapflex">
                            {hidden.map((r) => (
                                <span key={r.channelId} className="chip">
                                    {r.title}{" "}
                                    <span className="mono" style={{ color: "var(--text-muted)" }}>
                                        {r.measured}/{minSample}
                                    </span>
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            {/* Yöntem — karnenin hukuki ve gazetecilik omurgası */}
            <section className="wrap section" id="yontem">
                <div className="card card-pad stack gap-12" style={{ maxWidth: 820 }}>
                    <h2 className="h2" style={{ fontSize: 22 }}>Bu sayı nasıl hesaplanıyor?</h2>

                    <div className="stack gap-8">
                        <p className="small">
                            <strong>Giriş fiyatı:</strong> videonun yayımlandığı günün kapanış fiyatı.
                        </p>
                        <p className="small">
                            <strong>Çıkış fiyatı:</strong> yayın tarihinin üstüne görüşün kendi vadesi
                            eklenerek bulunan günün kapanışı — bugünün fiyatı değil. Kısa vadeli bir görüş
                            7 gün sonrasına, uzun vadeli bir görüş 180 gün sonrasına bakılarak ölçülüyor.
                        </p>
                        <p className="small">
                            <strong>Eşik:</strong> ±%{String(thresholdPct).replace(".", ",")}. Fiyat bu
                            bandın içinde kaldıysa görüş ne tutmuş ne tutmamış sayılıyor; &ldquo;yatay&rdquo;
                            olarak ayrı gösteriliyor ve kimsenin lehine yazılmıyor.
                        </p>
                        <p className="small">
                            <strong>Neyin tutmuş sayıldığı:</strong> alım yönlü bir görüş için fiyatın
                            yükselmesi, satış yönlü bir görüş için düşmesi, &ldquo;bekle&rdquo; ya da
                            &ldquo;gözlemle&rdquo; için bandın içinde kalması.
                        </p>
                        <p className="small">
                            <strong>Ölçülmeyenler:</strong> konut, mevduat, &ldquo;kripto paralar&rdquo; gibi
                            tek bir fiyatı olmayan başlıklar hiç ölçülmüyor ve paydaya girmiyor. Bu sayfada
                            {" "}{totals.unmeasurable.toLocaleString("tr-TR")} kayıt bu durumda; gizlenmiyor,
                            her kanalın satırında ayrıca yazıyor.
                        </p>
                    </div>

                    <hr className="divider" />

                    <div className="stack gap-8">
                        <h3 className="h3" style={{ fontSize: 16 }}>Bu karne neyi ölçmez</h3>
                        <p className="small" style={{ color: "var(--text-soft)" }}>
                            Bir yorumcunun görüşü, çoğu zaman bir cümlelik &ldquo;al&rdquo; ya da
                            &ldquo;sat&rdquo;tan ibaret değildir: koşullu olabilir, farklı bir vadeyi
                            kastediyor olabilir, konuşmanın tamamında başka bir bağlamı olabilir. Buradaki
                            sınıflandırma videonun altyazısından yapay zekâ ile çıkarılıyor ve hata
                            içerebilir. Dolayısıyla bu sayfa, kimin &ldquo;iyi&rdquo; kimin
                            &ldquo;kötü&rdquo; analist olduğunu söylemez — yalnızca bizim ölçtüğümüz
                            biçimiyle, geçmiş görüşlerin fiyat hareketiyle ne kadar örtüştüğünü gösterir.
                            Yanlış çıkarılmış bir görüş gördüğünüzde ilgili sinyaldeki
                            &ldquo;Bu özet yanlış&rdquo; düğmesiyle bildirebilirsiniz; bildirilen sinyal
                            listeden düşer.
                        </p>
                        <p className="small" style={{ color: "var(--text-soft)" }}>
                            Geçmiş performans gelecek için gösterge değildir ve bu sayfa yatırım tavsiyesi
                            değildir. Ayrıntılı yöntem için{" "}
                            <Link href="/metodoloji">metodoloji sayfasına</Link> bakabilirsiniz.
                        </p>
                    </div>

                    <span className="tiny">
                        Son güncelleme: {formatDateTr(card.generatedAt)}
                    </span>
                </div>
            </section>

            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} />
        </>
    );
}
