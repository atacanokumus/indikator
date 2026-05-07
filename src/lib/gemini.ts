import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";

let _model: any = null;

export const getModel = () => {
  if (!_model) {
    const apiKey = process.env.GEMINI_API_KEY || "";
    if (!apiKey) {
      console.warn("[GEMINI] GEMINI_API_KEY is not set!");
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    _model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });
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
  const MAX_RETRIES = 10;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      const prompt = `${FINANCIAL_ANALYSIS_PROMPT}\n\n    Transkript:\n    ${transcript}`;
      const result = await getModel().generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch (error: any) {
      attempt++;
      const isRetryable = error.message && (
        error.message.includes("429") ||
        error.message.includes("exceeded your current quota") ||
        error.message.includes("503") ||
        error.message.includes("RESOURCE_EXHAUSTED")
      );
      if (isRetryable && attempt < MAX_RETRIES) {
        const waitTime = 60000; // Kota yenilenene kadar 60s bekle
        console.warn(`[GEMINI] Transcript: Quota/rate limit. Waiting ${waitTime/1000}s (attempt ${attempt}/${MAX_RETRIES})...`);
        await new Promise(r => setTimeout(r, waitTime));
      } else {
        throw error;
      }
    }
  }
  return [];
};

/**
 * Ses dosyasını (örneğin yt-dlp ile indirilmiş) yerel sistemden Gemini'ye yükler, analiz eder ve sonra siler.
 * Otonom fallback sistemidir. Cloud timeout (503) sorunlarını aşar.
 */
export const analyzeAudioFileLocally = async (filePath: string) => {
  console.log(`[GEMINI FILE] Initiating local audio analysis pipeline for ${filePath}...`);
  const apiKey = process.env.GEMINI_API_KEY || "";
  const fileManager = new GoogleAIFileManager(apiKey);

  const MAX_RETRIES = 10;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    let fileUri = "";
    let fileId = "";
    
    try {
      // 1. Upload
      console.log(`[GEMINI FILE] Uploading audio...`);
      const uploadResponse = await fileManager.uploadFile(filePath, {
        mimeType: "audio/mp4",
        displayName: "audio_extract",
      });
      fileUri = uploadResponse.file.uri;
      fileId = uploadResponse.file.name;
      console.log(`[GEMINI FILE] Uploaded successfully. URI: ${fileUri}`);

      // 2. Wait for processing (ACTIVE state)
      let fileState = uploadResponse.file.state;
      while (fileState === "PROCESSING") {
        console.log(`[GEMINI FILE] Waiting for audio processing...`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
        const fileData = await fileManager.getFile(fileId);
        fileState = fileData.state;
      }

      if (fileState === "FAILED") {
        throw new Error("Gemini File processing failed.");
      }

      // 3. Analyze
      console.log(`[GEMINI FILE] Audio is ACTIVE. Starting analysis...`);
      const result = await getModel().generateContent([
        {
          fileData: {
            fileUri: fileUri,
            mimeType: "audio/mp4",
          },
        },
        {
          text: `Bu ses dosyası bir YouTube ekonomi/finans videosundan alınmıştır.\n\n${FINANCIAL_ANALYSIS_PROMPT}`,
        },
      ]);

      const response = await result.response;
      const text = response.text();
      console.log(`[GEMINI FILE] Analysis complete (${text.length} chars).`);

      // 4. Delete
      console.log(`[GEMINI FILE] Cleaning up file ${fileId} from Gemini...`);
      await fileManager.deleteFile(fileId);

      const jsonMatch = text.match(/\[[\s\S]*\]/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch (error: any) {
      // Always try to clean up if we have a fileId before retrying
      if (fileId) {
        try {
          console.log(`[GEMINI FILE] Cleanup on error for ${fileId}...`);
          await fileManager.deleteFile(fileId);
        } catch (cleanupError) {
          console.warn(`[GEMINI FILE] Cleanup failed: ${cleanupError}`);
        }
      }

      attempt++;
      const isRetryable = error.message && (
        error.message.includes("429") ||
        error.message.includes("exceeded your current quota") ||
        error.message.includes("503") ||
        error.message.includes("Service Unavailable") ||
        error.message.includes("Deadline expired") ||
        error.message.includes("RESOURCE_EXHAUSTED")
      );

      if (isRetryable && attempt < MAX_RETRIES) {
        let waitTime = 60000;
        const retryMatch = error.message.match(/Please retry in ([\d\.]+)s/);
        if (retryMatch && retryMatch[1]) {
          waitTime = Math.max(60000, Math.ceil(parseFloat(retryMatch[1]) * 1000) + 2000);
        }
        console.warn(`[GEMINI FILE] Retryable error. Waiting ${waitTime / 1000}s before attempt ${attempt + 1}/${MAX_RETRIES}...`);
        await new Promise(r => setTimeout(r, waitTime));
      } else {
        throw error;
      }
    }
  }
  return [];
};

