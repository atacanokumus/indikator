/**
 * Google AdSense / Analytics yapılandırması — tek kaynak.
 *
 * NEXT_PUBLIC_* değişkenleri derleme sırasında satır içine yazılır; bu yüzden
 * burada `process.env.NEXT_PUBLIC_X` ifadesi AYNEN geçmeli (dinamik erişim
 * istemci paketinde boş döner).
 *
 * AdSense yayıncı kimliği zaten herkese açık: public/ads.txt içinde yazıyor.
 * Bu yüzden varsayılan olarak koda gömülü; ortam değişkeni (boş değilse)
 * bunu ezer. Reklamları kapatmak için NEXT_PUBLIC_ADSENSE_CLIENT=off yazın.
 */
const DEFAULT_ADSENSE_CLIENT = "ca-pub-7838551368632112";

const rawClient = (process.env.NEXT_PUBLIC_ADSENSE_CLIENT || DEFAULT_ADSENSE_CLIENT).trim();

/** AdSense yayıncı kimliği ("ca-pub-…"); kapalıysa boş string. */
export const ADSENSE_CLIENT = rawClient === "off" ? "" : rawClient;

/**
 * Google Analytics 4 ölçüm kimliği ("G-XXXXXXXXXX"). Tanımlı değilse GA
 * hiç yüklenmez. analytics.google.com → Yönetici → Veri akışları'ndan alınır.
 */
export const GA_MEASUREMENT_ID = (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "").trim();

/** Çerez onayı gerektiren (reklam ya da analitik) bir Google hizmeti açık mı. */
export const CONSENT_REQUIRED = Boolean(ADSENSE_CLIENT || GA_MEASUREMENT_ID);

/** Çerez tercihinin localStorage anahtarı ve değişim olayı. */
export const CONSENT_KEY = "and-cookie-consent";
export const CONSENT_EVENT = "and-consent";
