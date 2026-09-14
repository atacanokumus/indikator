/**
 * Gemini entegrasyonu.
 * - Güncel @google/genai SDK (eski @google/generative-ai kullanımdan kaldırıldı)
 * - Yapılandırılmış çıktı (responseSchema) — regex ile JSON ayıklamaya son
 * - Üstel geri çekilme (eskiden 10 x 60 sn = 10 dk bloklama vardı)
 * - Transkript uzunluk sınırı (2 saatlik video = 150k+ karakter)
 */
import { GoogleGenAI, Type } from "@google/genai";
import type { Analysis } from "./types";

const MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
const MAX_TRANSCRIPT_CHARS = Number(process.env.MAX_TRANSCRIPT_CHARS || 120_000);
const MAX_RETRIES = Number(process.env.GEMINI_MAX_RETRIES || 4);

let _ai: GoogleGenAI | null = null;
export function ai(): GoogleGenAI {
    if (!_ai) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY tanımlı değil.");
        _ai = new GoogleGenAI({ apiKey });
    }
    return _ai;
}

/* ------------------------------------------------------------------ */

const ANALYSIS_SCHEMA = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            asset: { type: Type.STRING, description: "Varlık adı, ör: ALTIN, BTC, THYAO, DOLAR" },
            recommendation: { type: Type.STRING, enum: ["AL", "SAT", "TUT", "GÖZLEMLE"] },
            score: { type: Type.INTEGER, description: "Ekonomistin ifadesindeki kararlılık, 0-100" },
            timeframe: { type: Type.STRING, enum: ["KISA", "ORTA", "UZUN"] },
            reasoning: { type: Type.STRING, description: "En fazla 25 kelimelik, KENDİ SÖZCÜKLERİNLE yazılmış gerekçe. Konuşmacının cümlelerini birebir aktarma." },
            targetPrice: { type: Type.STRING, description: "Videoda rakam verildiyse, yoksa boş bırak" },
        },
        required: ["asset", "recommendation", "timeframe", "reasoning"],
    },
} as const;

const SYSTEM_PROMPT = `Sen finansal içerik analiz eden bir asistansın. Sana bir ekonomi/yatırım
videosunun içeriği verilecek. Transkript TÜRKÇE ya da İNGİLİZCE olabilir; her ikisini de anla.
Çıktıyı DAİMA Türkçe ve aşağıdaki sade adlarla ver — İngilizce videoda "gold" duysan bile "Altın" yaz.

Görevin: Konuşmacının NET görüş bildirdiği yatırım araçlarını (hisse, kripto, emtia, döviz, endeks) tespit etmek.

Kurallar:
- SADECE konuşmacının açık bir yönlü görüş belirttiği varlıkları listele.
- Konuşmacı kararsızsa veya "izliyorum, bekliyorum" diyorsa GÖZLEMLE kullan.
- Gerekçe, konuşmacının argümanını YANSITMALI ama onun cümleleriyle DEĞİL, senin
  kendi sözcüklerinle yazılmalı. Videodan birebir alıntı yapmak telif ihlalidir.
  En fazla 25 kelime. Tırnak içinde alıntı kullanma.
- Kendi yorumunu, tahminini veya tavsiyeni ekleme; sadece konuşmacının söylediğini özetle.
- Genel piyasa yorumu, siyaset veya makro tahmin varlık sinyali DEĞİLDİR; bunları listeleme.
- Hiçbir net sinyal yoksa boş dizi döndür. Uydurma sinyal üretme.

Varlık adı yazım kuralı — MUTLAKA aşağıdaki sade adlardan birini kullan.
Parantez, açıklama, sembol veya ek kelime EKLEME. ("Ons Altın (XAU/USD)" değil, "Altın")
  Kıymetli maden: Altın, Gümüş, Platin, Paladyum, Bakır
  Enerji/emtia:   Petrol, Brent Petrol, Doğalgaz, Buğday, Şeker, Kakao, Uranyum
  Döviz:          Dolar, Euro, Sterlin, Euro/Dolar, Dolar/Yen, Dolar Endeksi, Türk Lirası
  Kripto:         Bitcoin, Ethereum, Solana, XRP  (belirsizse: Kripto Paralar)
  Endeks:         BIST 100, Nasdaq, S&P 500, Dow Jones, Nikkei
  BIST hissesi:   dört harfli kodu yaz — THYAO, ASELS, TUPRS, TCELL…
  ABD hissesi:    sembolü yaz — NVDA, TSLA, AAPL, GOOGL…
  Sınıf:          Banka Hisseleri, ABD Hisseleri, Konut, Mevduat, Tahvil, Eurobond
Listede olmayan bir varlık için sade Türkçe adını ya da borsa kodunu yaz.

İngilizce karşılıklar (video İngilizceyse bunları kullan):
  gold/bullion -> Altın · silver -> Gümüş · crude/WTI -> Petrol · Brent -> Brent Petrol
  natural gas -> Doğalgaz · copper -> Bakır · wheat -> Buğday
  S&P 500 -> S&P 500 · Nasdaq -> Nasdaq · Dow -> Dow Jones · VIX -> VIX
  dollar index/DXY -> Dolar Endeksi · 10-year treasury -> ABD 10 Yıllık Tahvili
  treasuries/bonds -> Tahvil · real estate/REITs -> Konut · crypto -> Kripto Paralar
  US stocks/Magnificent 7 -> ABD Hisseleri

ASLA varlık sayma: enflasyon, resesyon, faiz, Fed kararı, CPI, işsizlik, GSYH, "the market",
"the economy", likidite, para politikası. Bunlar makro yorumdur, yatırım aracı değildir.`;

/* ------------------------------------------------------------------ */

function isRetryable(err: unknown): boolean {
    const m = String((err as Error)?.message || err);
    return /429|503|500|RESOURCE_EXHAUSTED|UNAVAILABLE|Deadline|ECONNRESET|fetch failed/i.test(m);
}

function retryDelayMs(err: unknown, attempt: number): number {
    const m = String((err as Error)?.message || err);
    const hinted = m.match(/retry in ([\d.]+)s/i);
    if (hinted) return Math.ceil(parseFloat(hinted[1]) * 1000) + 1000;
    // 5s, 15s, 45s, 135s — toplam ~3.5 dk (eskiden 10 dk)
    return Math.min(5000 * Math.pow(3, attempt), 150_000);
}

async function withRetry<T>(label: string, fn: () => Promise<T>): Promise<T> {
    let lastErr: unknown;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            return await fn();
        } catch (err) {
            lastErr = err;
            if (!isRetryable(err) || attempt === MAX_RETRIES - 1) break;
            const wait = retryDelayMs(err, attempt);
            console.warn(`[GEMINI] ${label}: geçici hata, ${Math.round(wait / 1000)} sn bekleniyor (${attempt + 1}/${MAX_RETRIES})`);
            await new Promise((r) => setTimeout(r, wait));
        }
    }
    throw lastErr;
}

function parseResults(text: string | undefined): Analysis[] {
    if (!text) return [];
    let raw: unknown;
    try {
        raw = JSON.parse(text);
    } catch {
        const m = text.match(/\[[\s\S]*\]/);
        if (!m) return [];
        try { raw = JSON.parse(m[0]); } catch { return []; }
    }
    if (!Array.isArray(raw)) return [];
    return (raw as Record<string, unknown>[])
        .filter((r) => r && typeof r.asset === "string" && r.asset.trim().length > 0)
        .map((r) => ({
            asset: String(r.asset).trim(),
            recommendation: (["AL", "SAT", "TUT", "GÖZLEMLE"].includes(String(r.recommendation))
                ? String(r.recommendation)
                : "GÖZLEMLE") as Analysis["recommendation"],
            score: typeof r.score === "number" ? Math.max(0, Math.min(100, r.score)) : undefined,
            timeframe: (["KISA", "ORTA", "UZUN"].includes(String(r.timeframe))
                ? String(r.timeframe)
                : "ORTA") as Analysis["timeframe"],
            reasoning: String(r.reasoning ?? "").slice(0, 300),
            targetPrice: r.targetPrice ? String(r.targetPrice) : null,
        }));
}

/** Uzun transkriptte baş + son kısmı korur (sinyaller genelde bu iki uçta). */
function trimTranscript(t: string): string {
    if (t.length <= MAX_TRANSCRIPT_CHARS) return t;
    const half = Math.floor(MAX_TRANSCRIPT_CHARS / 2);
    return `${t.slice(0, half)}\n\n[...videonun orta bölümü kısaltıldı...]\n\n${t.slice(-half)}`;
}

/* ------------------------------------------------------------------ */

export async function analyzeTranscript(transcript: string, videoTitle?: string): Promise<Analysis[]> {
    const body = trimTranscript(transcript);
    const res = await withRetry("transkript", () =>
        ai().models.generateContent({
            model: MODEL,
            contents: `Video başlığı: ${videoTitle || "bilinmiyor"}\n\nTranskript:\n${body}`,
            config: {
                systemInstruction: SYSTEM_PROMPT,
                responseMimeType: "application/json",
                responseSchema: ANALYSIS_SCHEMA as never,
                temperature: 0.2,
            },
        })
    );
    return parseResults(res.text);
}

/* ------------------------------------------------------------------ */

const NEWS_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        summary: { type: Type.STRING },
        sentiment: { type: Type.STRING, enum: ["POSITIVE", "NEGATIVE", "NEUTRAL"] },
        relatedAssets: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ["summary", "sentiment", "relatedAssets"],
} as const;

/** Haberleri TEK istekte toplu analiz eder (eskiden haber başına 1 istek atılıyordu). */
export async function analyzeNewsBatch(
    titles: string[]
): Promise<{ summary: string; sentiment: string; relatedAssets: string[] }[]> {
    if (titles.length === 0) return [];
    const res = await withRetry("haber", () =>
        ai().models.generateContent({
            model: MODEL,
            contents:
                "Aşağıdaki finansal haber başlıklarının her biri için sırayla analiz üret.\n\n" +
                titles.map((t, i) => `${i + 1}. ${t}`).join("\n"),
            config: {
                systemInstruction:
                    "Finansal haber analisti olarak her başlık için: tek cümlelik Türkçe özet, " +
                    "duygu (POSITIVE/NEGATIVE/NEUTRAL) ve ilgili varlık kodları (BTC, ALTIN, DOLAR, XU100, THYAO gibi) üret. " +
                    "Girdideki başlık sayısı kadar eleman döndür, sırayı koru.",
                responseMimeType: "application/json",
                responseSchema: { type: Type.ARRAY, items: NEWS_SCHEMA } as never,
                temperature: 0.3,
            },
        })
    );
    try {
        const parsed = JSON.parse(res.text || "[]");
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}
