import type { HistoryPoint } from "@/server/history";
import type { Recommendation } from "@/lib/types";
import { DIRECTION } from "@/lib/display";

/**
 * KONSENSUS GECMISI GRAFIGI
 *
 * Bicim secimi: yigili sutun, MUTLAK analist sayisiyla. Yuzde yigini
 * (%100'e normalize) daha "duzgun" gorunurdu ama iki analistin konustugu bir
 * ayi yirmi analistin konustugu ayla esit gosterirdi; isabet karnesinde
 * ornekleme koydugumuz kurali burada da tutuyoruz.
 *
 * Renkler sitenin anlam paletinden: yesil alim, kirmizi satis, altin bekle,
 * mavi gozlemle. Yesil-kirmizi ciftinin renk korlugunde ayirt edilmesi zor;
 * bu yuzden her sutun dogrudan etiketli, altta kelimeyle yazan bir gosterge
 * var ve ayni veri tablo olarak da veriliyor. Renk tek basina hicbir yerde
 * bilgi tasimiyor.
 *
 * Sunucuda uretilir, istemci JavaScript'i yoktur. Ustune gelince cikan bilgi
 * tarayicinin kendi <title> ipucudur.
 */

const ORDER: Recommendation[] = ["AL", "TUT", "GÖZLEMLE", "SAT"];
const FILL: Record<Recommendation, string> = {
    AL: "var(--al)",
    TUT: "var(--bekle)",
    "GÖZLEMLE": "var(--gozlemle)",
    SAT: "var(--sat)",
};

const AY = ["Oca", "Sub", "Mar", "Nis", "May", "Haz", "Tem", "Agu", "Eyl", "Eki", "Kas", "Ara"];
function ayEtiketi(month: string): string {
    const [y, m] = month.split("-");
    return `${AY[Number(m) - 1]} ${y.slice(2)}`;
}

export function ConsensusHistory({
    series,
    assetLabel,
}: {
    series: HistoryPoint[];
    assetLabel: string;
}) {
    const max = Math.max(1, ...series.map((p) => p.total));
    const active = series.filter((p) => p.total > 0);
    if (active.length < 2) return null;

    // Cizim alani. viewBox sabit; SVG kapsayicisina gore olceklenir.
    const W = 720, H = 210;
    const padL = 26, padR = 8, padT = 10, padB = 34;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const slot = plotW / series.length;
    const barW = Math.min(44, slot * 0.62);
    const GAP = 2; // yigin parcalari arasinda yuzey bosslugu

    // Eksen: en fazla 4 cizgi, hepsi grafigin ulastigi bir degeri gosterir.
    const step = max <= 4 ? 1 : Math.ceil(max / 4);
    const ticks: number[] = [];
    for (let v = 0; v <= max; v += step) ticks.push(v);
    if (ticks[ticks.length - 1] !== max) ticks.push(max);

    const y = (v: number) => padT + plotH - (v / max) * plotH;

    return (
        <figure className="card card-pad stack gap-12" style={{ margin: 0 }}>
            <figcaption className="stack gap-4">
                <h2 className="h3" style={{ fontSize: 17 }}>Aylara göre kim konuştu</h2>
                <p className="small" style={{ color: "var(--text-soft)", maxWidth: "62ch" }}>
                    {assetLabel} hakkında her ay kaç analistin hangi yönde konuştuğu. Sütunun
                    yüksekliği o ay konuşan analist sayısıdır; yüzdeye çevirmiyoruz, çünkü iki
                    kişinin konuştuğu bir ay yirmi kişinin konuştuğu ayla aynı görünürdü.
                </p>
            </figcaption>

            <div className="scroll-x">
                <svg
                    viewBox={`0 0 ${W} ${H}`}
                    style={{ width: "100%", minWidth: 480, height: "auto", display: "block" }}
                    role="img"
                    aria-label={`${assetLabel} için aylık analist sayımı. Ayrıntılı veri aşağıdaki tabloda.`}
                >
                    {ticks.map((v) => (
                        <g key={v}>
                            <line
                                x1={padL} x2={W - padR} y1={y(v)} y2={y(v)}
                                stroke="var(--border)" strokeWidth="1"
                            />
                            <text
                                x={padL - 6} y={y(v) + 3.5} textAnchor="end"
                                fontSize="10" fill="var(--text-muted)"
                            >
                                {v}
                            </text>
                        </g>
                    ))}

                    {series.map((p, i) => {
                        const cx = padL + slot * i + slot / 2;
                        let cursor = y(0);
                        return (
                            <g key={p.month}>
                                {p.total > 0 &&
                                    ORDER.map((rec) => {
                                        const n = p.tally[rec] ?? 0;
                                        if (n === 0) return null;
                                        const h = (n / max) * plotH;
                                        const top = cursor - h;
                                        const drawH = Math.max(1, h - GAP);
                                        cursor = top;
                                        return (
                                            <rect
                                                key={rec}
                                                x={cx - barW / 2}
                                                y={top}
                                                width={barW}
                                                height={drawH}
                                                rx="2"
                                                fill={FILL[rec]}
                                            >
                                                <title>{`${ayEtiketi(p.month)} — ${n} analist ${DIRECTION[rec]}`}</title>
                                            </rect>
                                        );
                                    })}

                                {p.total > 0 && (
                                    <text
                                        x={cx} y={y(p.total) - 5} textAnchor="middle"
                                        fontSize="10.5" fontWeight="700" fill="var(--text)"
                                    >
                                        {p.total}
                                    </text>
                                )}

                                <text
                                    x={cx} y={H - 12} textAnchor="middle"
                                    fontSize="10" fill="var(--text-muted)"
                                >
                                    {ayEtiketi(p.month)}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>

            <div className="row gap-12 wrapflex">
                {ORDER.map((rec) => (
                    <span key={rec} className="row gap-6 tiny">
                        <span
                            aria-hidden="true"
                            style={{
                                width: 10, height: 10, borderRadius: 3,
                                background: FILL[rec], display: "inline-block", flexShrink: 0,
                            }}
                        />
                        {DIRECTION[rec]}
                    </span>
                ))}
            </div>

            <details>
                <summary className="small" style={{ cursor: "pointer", fontWeight: 650 }}>
                    Aynı veriyi tablo olarak göster
                </summary>
                <div className="scroll-x" style={{ marginTop: 10 }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 380 }}>
                        <caption className="sr-only">
                            {assetLabel} için aylık analist sayımı
                        </caption>
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--border)" }}>
                                <th scope="col" className="eyebrow" style={{ padding: "8px 10px", textAlign: "left" }}>Ay</th>
                                {ORDER.map((rec) => (
                                    <th key={rec} scope="col" className="eyebrow" style={{ padding: "8px 10px", textAlign: "right" }}>
                                        {DIRECTION[rec]}
                                    </th>
                                ))}
                                <th scope="col" className="eyebrow" style={{ padding: "8px 10px", textAlign: "right" }}>Toplam</th>
                            </tr>
                        </thead>
                        <tbody>
                            {active.map((p) => (
                                <tr key={p.month} style={{ borderBottom: "1px solid var(--border)" }}>
                                    <th scope="row" className="small" style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600 }}>
                                        {ayEtiketi(p.month)}
                                    </th>
                                    {ORDER.map((rec) => (
                                        <td key={rec} className="mono small" style={{ padding: "8px 10px", textAlign: "right" }}>
                                            {p.tally[rec] || "—"}
                                        </td>
                                    ))}
                                    <td className="mono small" style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700 }}>
                                        {p.total}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </details>
        </figure>
    );
}
