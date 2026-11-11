/**
 * SİTENİN ARKASINDAKİ KİŞİ / KURULUŞ — Hakkımızda sayfasında ve yazıların
 * yapılandırılmış verisinde (author) kullanılır.
 *
 * Neden var: Para konusundaki (YMYL) bir sitede "bunu kim yapıyor?" sorusunun
 * cevabı yoksa hem okuyucu hem AdSense incelemesi hem arama motoru siteye
 * güvenmez. AdSense "düşük değerli içerik" reddinden sonra en büyük açık buydu.
 *
 * NASIL DOLDURULUR: `name` boşken hiçbir şey gösterilmez (uydurma bir kimlik
 * yazmak, hiç yazmamaktan kötüdür). Gerçek bilgileri yazın:
 *   name  : "Ad Soyad" ya da şirket unvanı
 *   role  : "Kurucu ve editör" gibi
 *   bio   : 2-4 cümle; ilgili geçmiş (eğitim, meslek, kaç yıldır piyasaları izliyor).
 *           Lisans ya da unvan iddiası yalnızca gerçekse yazılır.
 *   links : herkese açık profil adresleri (LinkedIn, X). Organization `sameAs` olarak da basılır.
 *   isPerson : gerçek kişi ise true (Person), şirket ise false (Organization).
 */
export interface Publisher {
    name: string;
    role: string;
    bio: string;
    links: { label: string; url: string }[];
    isPerson: boolean;
}

export const PUBLISHER: Publisher = {
    name: "",
    role: "",
    bio: "",
    links: [],
    isPerson: true,
};

export const HAS_PUBLISHER = PUBLISHER.name.trim().length > 0;
