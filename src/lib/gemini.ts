import { GoogleGenerativeAI } from "@google/generative-ai";

let _model: any = null;

export const getModel = () => {
  if (!_model) {
    const apiKey = process.env.GEMINI_API_KEY || "";
    if (!apiKey) {
      console.warn("[GEMINI] GEMINI_API_KEY is not set!");
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    _model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  }
  return _model;
};

const FINANCIAL_ANALYSIS_PROMPT = `
    Sen profesyonel bir finansal analistsin. Aşağıdaki YouTube videosunu derinlemesine analiz et.
    
    Özellikle şu görevleri yerine getir:
    1. Videoda bahsedilen spesifik yatırım araçlarını (Hisse Senetleri, Kripto Paralar, Emtialar, Döviz kurları vb.) tespit et.
    2. Her bir varlık için ekonomistin görüşünü şu formatta çıkar:
       - Varlık Adı (Asset)
       - Sinyal (AL, SAT, TUT, GÖZLEMLE)
       - Güven Skoru (0-100 arası bir puan)
       - Vade (KISA, ORTA, UZUN)
       - Gerekçe (Kısa ve öz teknik/temel analiz özeti)
       - Hedef Fiyat (Eğer videoda rakam belirtilmişse)

    Çıktıyı SADECE şu JSON yapısında döndür:
    [
      {
        "asset": "Varlık Adı",
        "recommendation": "AL/SAT/TUT/GÖZLEMLE",
        "score": 85,
        "timeframe": "KISA/ORTA/UZUN",
        "reasoning": "...",
        "targetPrice": "120.5 (veya null)"
      }
    ]

    Kurallar:
    - Sadece ekonomist net bir görüş bildirdiğinde kayıt oluştur.
    - Belirsiz ifadeler için "GÖZLEMLE" kullan.
    - Metin dışı yorum ekleme, sadece JSON döndür.
`;

export const analyzeTranscript = async (transcript: string) => {
  const prompt = `${FINANCIAL_ANALYSIS_PROMPT}\n\n    Transkript:\n    ${transcript}`;

  const result = await getModel().generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  // JSON temizleme (bazı modeller markdown block ekleyebilir)
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
};

/**
 * YouTube videosunu doğrudan URL üzerinden Gemini'ye gönderip finansal analiz yapar.
 * Ses indirmeye, yt-dlp'ye, Firebase Storage'a gerek yoktur.
 * Vercel Free plan'ın 60 saniyelik limitine rahat sığar.
 * 
 * @param videoId - YouTube video ID
 */
export const analyzeVideoByUrl = async (videoId: string) => {
  console.log(`[GEMINI] Analyzing YouTube video by URL: ${videoId}...`);

  const MAX_RETRIES = 3;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      const result = await getModel().generateContent([
        {
          fileData: {
            fileUri: `https://www.youtube.com/watch?v=${videoId}`,
            mimeType: "video/mp4",
          },
        },
        {
          text: `Bu video bir YouTube ekonomi/finans videosudur.\n\n${FINANCIAL_ANALYSIS_PROMPT}`,
        },
      ]);

      const response = await result.response;
      const text = response.text();

      console.log(`[GEMINI] Video analysis response length: ${text.length} chars`);

      // JSON temizleme
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch (error: any) {
      attempt++;
      const isRetryable = error.message && (
        error.message.includes("exceeded your current quota") ||
        error.message.includes("503") ||
        error.message.includes("Service Unavailable") ||
        error.message.includes("Deadline expired") ||
        error.message.includes("RESOURCE_EXHAUSTED")
      );
      if (isRetryable && attempt < MAX_RETRIES) {
        let waitTime = 15000;
        const retryMatch = error.message.match(/Please retry in ([\d\.]+)s/);
        if (retryMatch && retryMatch[1]) {
          waitTime = Math.ceil(parseFloat(retryMatch[1]) * 1000) + 2000;
        }
        console.warn(`[GEMINI] Retryable error. Waiting ${waitTime / 1000}s before attempt ${attempt + 1}/${MAX_RETRIES}...`);
        await new Promise(r => setTimeout(r, waitTime));
      } else {
        throw error;
      }
    }
  }
  return [];
};

/**
 * Ses dosyasını doğrudan Gemini'ye gönderip finansal analiz yapar. (Legacy - artık kullanılmıyor)
 */
export const analyzeAudio = async (audioBuffer: Buffer, mimeType: string = "audio/mpeg") => {
  console.log(`[GEMINI] [LEGACY] analyzeAudio called, redirecting to transcript-based approach is recommended.`);

  const audioBase64 = audioBuffer.toString("base64");
  const result = await getModel().generateContent([
    { inlineData: { mimeType, data: audioBase64 } },
    { text: `Bu ses dosyası bir YouTube ekonomi/finans videosundan alınmıştır.\n\n${FINANCIAL_ANALYSIS_PROMPT}` },
  ]);
  const response = await result.response;
  const text = response.text();
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
};

