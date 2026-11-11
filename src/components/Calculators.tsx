"use client";

import { useId, useState } from "react";
import type { ToolKind } from "@/content/tools";

/**
 * Hesaplama araçları. Hesap yalnızca tarayıcıda yapılır: girilen değer
 * sunucuya gitmez, saklanmaz, çerez bırakmaz.
 *
 * Alanlar BOŞ başlar (bkz. src/content/tools.ts kuralları): güncel fiyat ya da
 * oran ön tanımlı gelmez. "Örnek değerler" düğmesi uydurma rakam doldurur ve
 * sonuç kutusunda bunun örnek olduğu yazılır.
 */

/** "3.000", "3000", "40,5", "40.5", "1.234,56" -> sayı. Geçersizse NaN. */
export function parseTr(raw: string): number {
    let s = raw.trim().replace(/\s|₺|\$|%/g, "");
    if (!s) return NaN;
    if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
    else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
    return /^-?\d*\.?\d+$/.test(s) ? Number(s) : NaN;
}

const tl = (n: number, digits = 2) =>
    `${n.toLocaleString("tr-TR", { minimumFractionDigits: digits, maximumFractionDigits: digits })} TL`;
const pct = (n: number) =>
    `%${(n * 100).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function Field({
    label, value, onChange, placeholder, suffix, hint,
}: {
    label: string; value: string; onChange: (v: string) => void; placeholder?: string; suffix?: string; hint?: string;
}) {
    const id = useId();
    const invalid = value.trim() !== "" && Number.isNaN(parseTr(value));
    return (
        <div className="field">
            <label htmlFor={id}>{label}</label>
            <div className="field-box">
                <input
                    id={id}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={value}
                    placeholder={placeholder}
                    aria-invalid={invalid || undefined}
                    aria-describedby={hint ? `${id}-h` : undefined}
                    onChange={(e) => onChange(e.target.value)}
                />
                {suffix && <span className="field-suffix">{suffix}</span>}
            </div>
            {invalid ? (
                <span className="field-hint field-err">Yalnızca rakam girin (ör. 1.250,50).</span>
            ) : (
                hint && <span id={`${id}-h`} className="field-hint">{hint}</span>
            )}
        </div>
    );
}

function Shell({
    children, results, ready, sample, onSample, onClear, emptyText,
}: {
    children: React.ReactNode; results: [string, string, boolean?][]; ready: boolean; sample: boolean;
    onSample: () => void; onClear: () => void; emptyText: string;
}) {
    return (
        <div className="card card-pad calc">
            <div className="calc-fields">{children}</div>
            <div className="row gap-8 wrapflex" style={{ marginTop: 14 }}>
                <button type="button" className="btn btn-ghost" onClick={onSample}>Örnek değerlerle doldur</button>
                <button type="button" className="btn btn-ghost" onClick={onClear}>Temizle</button>
            </div>
            <div className="calc-result" role="status" aria-live="polite">
                {ready ? (
                    <>
                        {sample && (
                            <p className="tiny" style={{ margin: "0 0 10px" }}>
                                <strong>Örnek değerler:</strong> rakamlar yalnızca hesabı göstermek için uydurulmuştur, güncel fiyat ya da oran değildir.
                            </p>
                        )}
                        <dl>
                            {results.map(([k, v, strong]) => (
                                <div key={k} className={strong ? "calc-main" : undefined}>
                                    <dt>{k}</dt>
                                    <dd className="mono">{v}</dd>
                                </div>
                            ))}
                        </dl>
                    </>
                ) : (
                    <p className="small" style={{ margin: 0 }}>{emptyText}</p>
                )}
            </div>
        </div>
    );
}

/* ------------------------------ Gram altın ------------------------------ */

const AYAR: [string, number][] = [["24", 1], ["22", 0.916], ["18", 0.75], ["14", 0.585]];
const TROY = 31.1035;

function GramAltin() {
    const [ons, setOns] = useState("");
    const [kur, setKur] = useState("");
    const [gram, setGram] = useState("1");
    const [ayar, setAyar] = useState("24");
    const [sample, setSample] = useState(false);
    const selectId = useId();

    const o = parseTr(ons), k = parseTr(kur), g = parseTr(gram);
    const ready = o > 0 && k > 0 && g > 0;
    const has = (o * k) / TROY;
    const milyem = AYAR.find(([a]) => a === ayar)?.[1] ?? 1;
    const edit = (set: (v: string) => void) => (v: string) => { setSample(false); set(v); };

    return (
        <Shell
            ready={ready}
            sample={sample}
            emptyText="Ons altın ve dolar kurunu girdiğinizde sonuç burada görünür."
            onSample={() => { setOns("3.000"); setKur("40"); setGram("1"); setAyar("24"); setSample(true); }}
            onClear={() => { setOns(""); setKur(""); setGram("1"); setAyar("24"); setSample(false); }}
            results={ready ? [
                [`${g.toLocaleString("tr-TR")} gram ${ayar} ayar altının teorik değeri`, tl(has * milyem * g), true],
                ["Has altın (24 ayar) gram fiyatı", tl(has)],
                ["22 ayar gram karşılığı", tl(has * 0.916)],
                ["Çeyrek altının has değeri (≈1,75 g, 22 ayar)", tl(has * 0.916 * 1.75)],
                ["Yarım altının has değeri (≈3,50 g, 22 ayar)", tl(has * 0.916 * 3.5)],
                ["Tam altının has değeri (≈7,00 g, 22 ayar)", tl(has * 0.916 * 7)],
                ["Bir onsun lira karşılığı", tl(o * k, 0)],
            ] : []}
        >
            <Field label="Ons altın" value={ons} onChange={edit(setOns)} suffix="USD" placeholder="ons fiyatı" />
            <Field label="Dolar / TL kuru" value={kur} onChange={edit(setKur)} suffix="TL" placeholder="kur" />
            <Field label="Miktar" value={gram} onChange={edit(setGram)} suffix="gram" />
            <div className="field">
                <label htmlFor={selectId}>Ayar</label>
                <div className="field-box">
                    <select id={selectId} value={ayar} onChange={(e) => setAyar(e.target.value)}>
                        {AYAR.map(([a, m]) => (
                            <option key={a} value={a}>{a} ayar ({Math.round(m * 1000)} milyem)</option>
                        ))}
                    </select>
                </div>
            </div>
        </Shell>
    );
}

/* ------------------------------ Mevduat ------------------------------ */

function Mevduat() {
    const [ana, setAna] = useState("");
    const [faiz, setFaiz] = useState("");
    const [gun, setGun] = useState("");
    const [stopaj, setStopaj] = useState("");
    const [sample, setSample] = useState(false);

    const a = parseTr(ana), f = parseTr(faiz), d = parseTr(gun), s = parseTr(stopaj);
    const ready = a > 0 && f >= 0 && d > 0 && s >= 0 && s < 100;
    const brut = (a * (f / 100) * d) / 365;
    const kesinti = brut * (s / 100);
    const net = brut - kesinti;
    const bilesik = Math.pow(1 + net / a, 365 / d) - 1;
    const edit = (set: (v: string) => void) => (v: string) => { setSample(false); set(v); };

    return (
        <Shell
            ready={ready}
            sample={sample}
            emptyText="Anapara, faiz oranı, vade ve stopaj oranını girdiğinizde sonuç burada görünür."
            onSample={() => { setAna("100.000"); setFaiz("40"); setGun("32"); setStopaj("15"); setSample(true); }}
            onClear={() => { setAna(""); setFaiz(""); setGun(""); setStopaj(""); setSample(false); }}
            results={ready ? [
                ["Net getiri", tl(net), true],
                ["Vade sonunda hesaptaki tutar", tl(a + net)],
                ["Brüt getiri", tl(brut)],
                ["Stopaj kesintisi", tl(kesinti)],
                ["Yıllık net basit oran", pct((f / 100) * (1 - s / 100))],
                ["Yıllık bileşik net karşılık (aynı koşulla yenilenirse)", pct(bilesik)],
            ] : []}
        >
            <Field label="Anapara" value={ana} onChange={edit(setAna)} suffix="TL" placeholder="tutar" />
            <Field label="Yıllık faiz oranı (brüt)" value={faiz} onChange={edit(setFaiz)} suffix="%" placeholder="oran" />
            <Field label="Vade" value={gun} onChange={edit(setGun)} suffix="gün" placeholder="gün sayısı" />
            <Field
                label="Stopaj oranı" value={stopaj} onChange={edit(setStopaj)} suffix="%" placeholder="oran"
                hint="Vadeye göre değişir; güncel oranı bankanızdan öğrenin."
            />
        </Shell>
    );
}

/* ------------------------------ Reel getiri ------------------------------ */

function ReelGetiri() {
    const [nom, setNom] = useState("");
    const [enf, setEnf] = useState("");
    const [tutar, setTutar] = useState("");
    const [sample, setSample] = useState(false);

    const n = parseTr(nom), e = parseTr(enf), t = parseTr(tutar);
    const ready = Number.isFinite(n) && Number.isFinite(e) && n > -100 && e > -100;
    const reel = (1 + n / 100) / (1 + e / 100) - 1;
    const withAmount = ready && t > 0;
    const edit = (set: (v: string) => void) => (v: string) => { setSample(false); set(v); };

    return (
        <Shell
            ready={ready}
            sample={sample}
            emptyText="Nominal getiriyi ve aynı dönemin enflasyonunu girdiğinizde sonuç burada görünür."
            onSample={() => { setNom("40"); setEnf("50"); setTutar("100.000"); setSample(true); }}
            onClear={() => { setNom(""); setEnf(""); setTutar(""); setSample(false); }}
            results={ready ? [
                ["Reel getiri (enflasyondan arındırılmış)", pct(reel), true],
                ["Satın alma gücü", reel > 0.00005 ? "Arttı" : reel < -0.00005 ? "Azaldı" : "Değişmedi"],
                ["Basit çıkarma ile bulunan (yaklaşık, hatalı) değer", pct((n - e) / 100)],
                ...(withAmount ? [
                    ["Dönem sonu tutar (nominal)", tl(t * (1 + n / 100))] as [string, string],
                    ["Dönem başı fiyatlarıyla karşılığı", tl(t * (1 + reel))] as [string, string],
                ] : []),
            ] : []}
        >
            <Field label="Nominal getiri (net)" value={nom} onChange={edit(setNom)} suffix="%" placeholder="oran" />
            <Field
                label="Enflasyon" value={enf} onChange={edit(setEnf)} suffix="%" placeholder="oran"
                hint="Getiriyle aynı dönemi kapsamalı."
            />
            <Field
                label="Başlangıç tutarı (isteğe bağlı)" value={tutar} onChange={edit(setTutar)} suffix="TL" placeholder="tutar"
            />
        </Shell>
    );
}

export function Calculator({ kind }: { kind: ToolKind }) {
    if (kind === "gram-altin") return <GramAltin />;
    if (kind === "mevduat") return <Mevduat />;
    return <ReelGetiri />;
}
