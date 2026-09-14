# ECOTUBE

YouTube ekonomi yorumcularının videolarını yapay zeka ile okuyup, hangi varlıkta
**AL / SAT / BEKLE** dediklerini tek ekranda toplayan Next.js uygulaması.

---

## Mimari

```
YouTube (video yayınlanır)
      │  push bildirimi (PubSubHubbub, ücretsiz, ~saniyeler)
      ▼
/api/youtube/webhook  ──HMAC doğrulama──▶  GitHub Actions (repository_dispatch)
                                                │
                                                │ analiz (süre sınırı yok)
                                                ▼
                                Gemini  ──▶  Firestore  ──▶  snapshots/home
                                                                  │
                                                                  ▼
                                                        Next.js (sunucuda render)
```

- **Anlık güncelleme:** Video yayınlandığı anda YouTube bize haber verir, analiz
  GitHub Actions'ta çalışır. Vercel'in 60 saniyelik fonksiyon limitine takılmaz
  ve ek maliyeti yoktur.
- **Yedek tarama:** Push kaçarsa diye 3 saatte bir RSS kontrolü, günde bir de
  derin tarama + abonelik yenileme.
- **Ana sayfa:** Her ziyaretçi Firestore'a gitmez; analiz sonrası üretilen tek
  `snapshots/home` dokümanı sunucuda 60 saniye önbelleğe alınıp sunulur.

## Hukuki tasarım kararları

Bunlar keyfi değil; bilerek böyle yapıldı, değiştirmeden önce nedenini okuyun.

| Karar | Nerede | Neden |
|---|---|---|
| Site kendi tavsiyesini üretmez, yalnızca **sayar** | `src/server/snapshot.ts`, `src/components/Tally.tsx` | Ağırlıklı puanla "AL/SAT" basmak, siteyi III-37.1 m.73/3 anlamında genel yatırım tavsiyesi sunan konuma sokuyordu |
| Emir kipi yok: "AL" değil "ALIM yönünde" | `src/lib/display.ts` | Etiket, okuyucuya talimat değil, konuşmacının yönünün tarifi |
| Ses/video **indirilmez** | `src/services/youtube.ts` | YouTube Kullanım Şartları; yaptırımı AdSense hesabına düşer |
| Altyazı ve ses **saklanmaz** | `src/server/sync.ts` | FSEK — yalnızca türetilmiş olgu saklanır |
| Gerekçe en fazla 300 karakter, birebir alıntı yasak | `src/lib/gemini.ts` | FSEK m.35 — maksadın haklı kıldığı ölçü |
| Her sinyalde "bu özet yanlış" düğmesi, bildirilen sinyal anında düşer | `src/components/ReportButton.tsx`, `src/app/api/report/route.ts` | 5651 m.9 erişim engeline karşı en hızlı savunma |
| Fiyat zamanı, güncellenme sıklığı, 12 aylık görüş değişikliği ekranda | `src/components/LegalNotice.tsx`, `AssetCard` | Tebliğ m.78/2-a, m.78/2-b, m.78/2-c |
| Çıkar çatışması beyanı ve tebliğ uyarı metni her sayfada | `src/components/LegalNotice.tsx` | Tebliğ m.50, m.79 |
| Reklam betiği çerez onayı öncesi yüklenmez | `src/components/AdsenseLoader.tsx` | KVKK — önce onay, sonra çerez |

Ayrıntılı gerekçe ve kalan riskler için oturumdaki **Hukuki Risk Dosyası**'na bakın.

### Dizin yapısı

| Yol | Ne işe yarar |
|---|---|
| `src/app` | Sayfalar ve API uçları |
| `src/components` | Arayüz bileşenleri |
| `src/server/*` | **Yalnızca sunucu.** firebase-admin ile veri yazma/okuma |
| `src/lib/*` | Ortak tipler, yardımcılar, Gemini istemcisi |
| `src/scripts/*` | GitHub Actions ve elle çalıştırılan script'ler |
| `firestore.rules` | Tarayıcıya yazma yetkisi VERMEYEN güvenlik kuralları |

---

## Kurulum (canlıya alma sırası)

### 1. Firebase servis hesabı (ZORUNLU)

Firebase Console → Proje Ayarları → Servis Hesapları → **Yeni özel anahtar oluştur**.
İnen JSON dosyasının tamamını tek satır olarak `FIREBASE_SERVICE_ACCOUNT` değişkenine koyun.

> Bu olmadan hiçbir yazma işlemi çalışmaz. Amaç, tarayıcıya hiç yazma yetkisi
> vermeden veritabanını güncelleyebilmek.

### 2. Güvenlik kurallarını yayınlayın

```bash
npx firebase-tools deploy --only firestore:rules,storage
```

Kurallar yayınlandıktan sonra kimse tarayıcıdan veri yazamaz/silemez.

### 3. Ortam değişkenleri

`.env.example` dosyasını `.env.local` olarak kopyalayıp doldurun. Aynı değerleri
Vercel'de **Settings → Environment Variables**'a da girin.

### 4. Yönetici şifresi

```bash
npm run admin:password "uzun-ve-tahmin-edilemez-bir-sifre"
```

Çıkan `salt:hash` dizisini `ADMIN_PASSWORD_HASH` olarak kaydedin. Şifrenin kendisi
hiçbir yerde saklanmaz.

### 5. Anlık güncellemeyi açın

1. **WebSub anahtarı üretin:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Çıktıyı `WEBSUB_SECRET` olarak hem Vercel'e hem GitHub secret'larına ekleyin.

2. **GitHub token'ı oluşturun:** GitHub → Settings → Developer settings →
   Personal access tokens → **Fine-grained tokens**. Sadece bu depoya erişsin,
   yetki olarak **Contents: Read and write** yeterlidir.
   Token'ı Vercel'e `GITHUB_DISPATCH_TOKEN`, depo adını `GITHUB_REPO`
   (`kullanici/indikator`) olarak ekleyin.

3. **GitHub secret'ları** (Settings → Secrets and variables → Actions → Secrets):
   `FIREBASE_SERVICE_ACCOUNT`, `GEMINI_API_KEY`, `WEBSUB_SECRET`,
   `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`

4. **GitHub variables** (aynı sayfa → Variables):
   `PUBLIC_SITE_URL` (ör. `https://ecotube.com.tr`), `GEMINI_MODEL`

5. **Abonelikleri başlatın** — siteyi canlıya aldıktan SONRA:
   ```bash
   npm run websub:renew
   ```
   veya GitHub'da "Yedek Tarama ve Bakım" iş akışını `deep: true` ile çalıştırın.

> `PUBLIC_SITE_URL` gerçek ve dışarıdan erişilebilir olmalıdır; Google abonelik
> doğrulaması için bu adrese GET isteği atar. `localhost` çalışmaz.

### 6. Reklamlar (en son)

AdSense onayı gelene kadar `NEXT_PUBLIC_ADSENSE_*` değişkenlerini **boş bırakın** —
boş kaldıkları sürece sayfada hiçbir reklam kodu yüklenmez, boş gri kutu da çıkmaz.
Onay sonrası reklam birimlerini oluşturup slot ID'lerini girin.

---

## Komutlar

```bash
npm run dev              # geliştirme sunucusu (localhost:8000)
ECOTUBE_MOCK=1 npm run dev   # Firebase olmadan sahte veriyle arayüzü çalıştır
npm run build            # üretim derlemesi
npm run typecheck        # tip kontrolü
npm run scan             # tüm kanalları tara (hızlı)
npm run scan:deep        # derin tarama
npm run analyze <videoId> <channelId>   # tek video analizi
npm run prices           # fiyatları güncelle
npm run channel:add <UC...>             # kanal ekle + push aboneliği
npm run websub:renew     # push aboneliklerini yenile
npm run admin:password "..."            # yönetici şifre hash'i üret
```

---

## Maliyet

| Kalem | Ücretsiz sınır | Durum |
|---|---|---|
| Vercel Hobby | 100 GB bant genişliği | Ana sayfa önbellekli, rahat |
| GitHub Actions | Gizli depoda 2000 dk/ay | 3 saatlik tarama + video başına ~3 dk |
| Firestore | 50.000 okuma/gün | Ziyaretçi başına 0 okuma (snapshot önbellekli) |
| Gemini | Modele göre kota | Video başına 1 istek, haberler 15 dk'da 1 toplu istek |

Depoyu **herkese açık** yaparsanız GitHub Actions dakika sınırı kalkar ve
`.github/workflows/scan.yml` içindeki tarama aralığını `*/15 * * * *` yapabilirsiniz.
