# SEO — yapılanlar, kurallar ve yayın sonrası liste

Bu dosya, sitenin arama motoru tarafındaki kararların **nedenini** tutar. Kodda ilgili yerlerde de
yorum var; burada özet ve yayın sonrası yapılacaklar yer alır.

## Kısaca durum

Site teknik olarak sağlamdı (sitemap, robots, canonical, JSON-LD vardı). Eksik olanlar:

| Sorun | Çözüm |
|---|---|
| Hiçbir sayfada `og:image` yoktu; her sayfanın `og:url`'si ana sayfaydı | `src/lib/seo.ts` `pageMetadata()` + `opengraph-image` rotaları (Türkçe karakterli, sayımlı görsel) |
| Sitemap'te 189 varlık sayfası, çoğu tek analistli ("Chipotle", "Tesco") | Yalnızca ≥3 analistli ya da elle profili yazılı varlıklar dizine girer; kalanı `noindex, follow` ve sitemap dışı |
| `lastmod` her satırda "şimdi" | Gerçek veri tarihi (`src/app/sitemap.ts`) |
| Varlık adresleri kodla: `/varlik/usd-try`, `/varlik/xu100` | Aranan kelimeyle: `/varlik/dolar`, `/varlik/bist-100`; eski adresler 308 ile yönlenir |
| 30 gün kimse konuşmayan varlığın sayfası 404 oluyordu | Bilinen varlığın sayfası açık kalır (geçmiş grafiği + varlık bilgisi) |
| Varlık sayfaları şablondan ibaretti | Profil metni ("X nedir?", "X fiyatını ne etkiler?"), SSS, rehber bağlantıları |
| Blog/rehber yoktu | `/rehber` + 9 yazı (`src/content/guides.ts`) |
| Organization logosu SVG'ydi (Google kabul etmez) | `/logo.png` (512×512) |
| Footer'da varlık/rehber bağlantısı yoktu | Her sayfada 10 varlık + 8 rehber bağlantısı |
| Haber şeridi geç yüklenip sayfayı aşağı itiyordu (CLS) | Yer ayırma |

## Değiştirmeden önce okuyun

* **`isIndexableAsset`** (`src/lib/asset-seo.ts`) yalnızca profili yazılı varlıkları dizine sokar. Eskiden "≥3 analist" de yetiyordu; AdSense siteyi "düşük değerli içerik" diye reddettiğinde dizindeki `/varlik/t-mobile` gibi sayfalar üç yapay zeka özeti ile kalıp metinden ibaretti. Bir varlığı dizine sokmak için eşik eklemeyin, `src/content/assets.ts`'e profil yazın.
* Kök `layout.tsx`'e `alternates.canonical` ya da `openGraph.url` **eklemeyin**: kendi canonical'ını tanımlamayı unutan her sayfayı ana sayfaya kanonikleştirir.
* `assetSlug()` kurallarını değiştirirseniz eski adres `legacyAssetSlug()` ile çözülmeye devam etmeli; yoksa sıralama birikimi kaybolur.
* Rehber yazılarında **tavsiye ve güncel rakam yok** (README: hukuki tasarım kararları). Örnek rakam varsa "örnek" diye etiketlenir.
* `dateModified` / `updated` tarihini yalnızca metin gerçekten değiştiğinde güncelleyin; her gün değiştirmek güvenilirliği düşürür.

## Yayın sonrası (kodla yapılamayanlar)

1. **Search Console**: mülkü doğrulayın (`NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` zaten destekli) → *Sitemaps* → `https://analistnediyor.com/sitemap.xml` gönderin.
2. *URL denetimi* ile şunlar için "dizine eklenmesini iste": ana sayfa, `/rehber`, 9 rehber yazısı, `/varlik/altin`, `/varlik/dolar`, `/varlik/bist-100`, `/varlik/bitcoin`.
3. *Sayfalar* raporunda eski `/varlik/usd-try` gibi adreslerin "Yönlendirmeli sayfa" göründüğünü doğrulayın (bir iki hafta sürer).
4. **Bing Webmaster Tools**: Search Console'dan içe aktarın (tek tık); `NEXT_PUBLIC_BING_SITE_VERIFICATION` da destekli.
5. [Rich Results Test](https://search.google.com/test/rich-results) ile bir rehber ve bir varlık sayfası deneyin: Breadcrumb ve Article geçerli olmalı. (FAQ zengin sonucu Google'da artık yalnızca resmî/sağlık sitelerine açık; şema yine de zararsız ve yapay zeka asistanları okuyor.)
6. **PageSpeed Insights** / Vercel Speed Insights: ana sayfa HTML'i ham ~390 KB (sıkıştırılmış ~59 KB). Büyüme yönü: `SignalExplorer`'a giden `signals` dizisini kısmak.
7. **Bağlantı kazanımı** (en büyük etken, koddan çıkmaz): haftalık bülten ve isabet karnesi paylaşılmaya değer, özgün veridir. Her bülten çıktığında X/LinkedIn'de paylaşın; ekonomi gazetecilerine ve bloglarına bülten bağlantısını kaynak olarak önerin. RSS: `/bulten/rss.xml`.
8. **Organization `sameAs`**: sosyal hesaplar açılınca `src/lib/seo.ts` `organizationLd()` içine ekleyin.

## AdSense "düşük değerli içerik" reddi (Ekim 2026)

Yapılanlar:

* Dizin yalnızca profili yazılı varlıklarla sınırlandı; profilsiz sayfalar `noindex`, sitemap dışı ve reklamsız.
* Rehber 9 yazıdan 22 yazıya çıktı (`src/content/guides-markets.ts`, `src/content/guides-macro.ts`); eski yazılar yenilerine bağlandı.

Kodla yapılamayanlar, yeniden incelemeden önce:

1. **Kim yapıyor?** Hakkımızda sayfasında sitenin arkasındaki kişi ya da şirket yazmıyor. Para konusundaki (YMYL) bir sitede anonimlik güveni en çok düşüren etkendir; gerçek ad, kısa özgeçmiş ve iletişim eklenmeli.
2. **Zaman ve trafik.** Reddin üç koşulundan ikisi ("sürekli içerik", "gerçek kullanıcı ilgisi") birikimle oluşur. Yeni yazıları Search Console'da dizine ekletin, en az 2-4 hafta organik trafik oluşmasını bekleyin, sonra yeniden inceleme isteyin.
3. **Düzenli yayın.** Haftada en az bir yeni ya da gerçekten güncellenmiş rehber yazısı, "sürekli içerik seçimi" koşulunu doğrudan karşılar.

## Kasım 2026: denetim ve ikinci tur (AdSense yeniden başvuru hazırlığı)

Canlı site 11 Kasım 2026'da tarandı (sitemap'teki 67 adresin tamamı). Teknik temel sağlamdı:
her adres 200, kendine canonical, tek H1, `index, follow`; robots.txt arama ve yapay zeka botlarına açık
(OAI-SearchBot, Claude-SearchBot, PerplexityBot, Bingbot, Googlebot, Mediapartners-Google hepsi 200);
http / www / eski Vercel adresi 308 ile tek adrese gidiyor. Sorun teknik değil, **içerik ve güven** tarafındaydı.

| Bulgu | Yapılan |
|---|---|
| Site yalnızca "başkasının videosunun özeti" + "her yerde bulunan açıklama yazısı" sunuyordu; ziyaretçinin bir iş yaptığı, siteye özgü sayfa yoktu | `/araclar` + 3 hesaplama aracı (`src/content/tools.ts`, `src/components/Calculators.tsx`): gram altın, mevduat faizi, reel getiri. Rehberdeki formüllerin çalışan hali; her aracın altında formül, varsayım ve SSS |
| Rehber yazıları hiçbir kaynağa bağlanmıyordu (YMYL için zayıf) | Her yazıya birincil kaynak listesi (`src/content/guide-sources.ts`): TCMB, TÜİK, SPK, Borsa İstanbul, Fed, LBMA… Bağlantılar 11.11.2026'da tek tek denetlendi |
| `/hakkimizda` 311 kelime, `/iletisim` 54 kelime | Hakkımızda: ne yayımlıyoruz, içerik nasıl hazırlanıyor, canlı sayılar, ek yayın ilkeleri (657 kelime). İletişim: konuya göre ne yazılmalı, yanıtlanmayan sorular (207 kelime). İkisine `AboutPage` / `ContactPage` verisi |
| Sitenin arkasındaki kişi yazmıyor | `src/content/publisher.ts`: **doldurulması gerekiyor**. Dolunca Hakkımızda'da "Siteyi kim yapıyor?" bölümü açılır, rehber yazılarının `author` alanı kişiye döner |
| Bülten başlıkları 64-66 karakter (arama sonucunda kesiliyor) | "Haftalık bülten: <hafta> analist görüşleri" (≈52 karakter) |
| Metodoloji ve gizlilik açıklamaları kısa (95 / 78 karakter) | ≈155 karaktere tamamlandı |

Araç sayfalarında **FAQPage / HowTo işaretlemesi bilerek yok**: Google bu zengin sonuçları kaldırdı; SSS yalnızca görünür metin.
Araçlarda güncel fiyat / oran **ön tanımlı gelmez** (rehberle aynı kural); "örnek değerler" düğmesi uydurma rakam doldurur ve öyle etiketlenir.

### Bekleyen kararlar

1. **`src/content/publisher.ts` doldurulacak** (ad, rol, 2-4 cümle özgeçmiş, varsa LinkedIn/X). AdSense ve YMYL için en değerli tek adım.
2. **Boş bültenler**: `/bulten/2026-W40` 69 kelime, `/bulten/2026-W39` 206 kelime ve ikisi de dizinde. Az sinyalli haftaları
   `noindex, follow` yapıp sitemap dışına almak önerilir (ör. `signalCount < 10`); robots/noindex değişikliği olduğu için onay bekliyor.
3. **Metodoloji tutarlılığı**: sayfa "altyazısı olmayan video analiz edilmez" diyor; 1 Ekim 2026'dan beri altyazı alınamazsa video
   Gemini'ye URL olarak veriliyor (commit 22286cd). Metin gerçek akışa göre güncellenmeli.
4. **Sayfa ağırlığı**: `/konsensus` ham HTML ≈795 KB, ana sayfa ≈439 KB. `SignalExplorer`'a giden `signals` dizisini kısmak Core Web Vitals'ı iyileştirir.
5. **Yeniden başvuru zamanı**: yeni sayfalar Search Console'da dizine eklendikten ve birkaç hafta organik trafik oluştuktan sonra.

## Analist sayfaları (`/analist/<kanal>`, Kasım 2026)

Search Console (14 Eylül - 9 Kasım 2026): **21 gösterim, 0 tıklama**, gösterim alan 8 sayfa. Rehber yazılarının hiçbiri gösterim almamış.
Tek iyi sıra marka sorgusunda ("analistler ne diyor", sıra 1,5); "euro yorumları" 39-76. sıralarda. Sonuç: site henüz Google'da yok sayılacak
kadar az görünüyor; genel sorgularda (altın/dolar/euro yorumları) büyük sitelerle rekabet edemiyor. Rakipsiz alan kişi adlı sorgular:
"<yorumcu> altın yorumu".

| Karar | Nerede | Neden |
|---|---|---|
| Sayfa yalnızca anlık görüntüden beslenir (ek Firestore sorgusu yok); kanal listesi saatte bir okunur | `src/lib/analyst.ts`, `getChannelDirectory` | Okuma maliyeti; pencere içinde konuşmayan kanalın sayfası 404 olmasın |
| **İsabet oranı, puan, sıralama gösterilmez** | `src/app/analist/[slug]/page.tsx` | Adı geçen kişi hakkında "başarılı/başarısız" hükmünü arama sonucuna taşımamak; oranlar yalnızca `/analistler` ve `/karne`'de |
| Pencerede 5'ten az varlıkta görüşü olan kanal `noindex, follow`, sitemap dışı, reklamsız | `isIndexableAnalyst` | Bir iki özetten ibaret sayfa "düşük değerli içerik" |
| Her sayfada "kanalın sahibiyseniz" kaldırma yolu ve her özette "Bu özet yanlış" | sayfa | 5651 / kaldırma akışı |
| Adres kanal adından türer; kanal kimliğiyle gelen adres 308 ile kanonik adrese gider | `analystSlug`, `resolve` | Aranan kelime adreste olsun |

Kanal adı değişirse adres de değişir ve eski adres 404 olur; ad değiştiren kanal olursa `resolve` içine eski ad eşlemesi eklenmeli.

## 13 Kasım 2026 denetimi (canlı tarama + Search Console)

Search Console: 25 sayfa dizinde, 49 dizin dışı; sitemap 12 Kasım'da okundu (88 adres); manuel işlem ve güvenlik sorunu yok;
**dış bağlantı sayısı 0**; Core Web Vitals için yeterli ziyaretçi verisi yok.

| Bulgu | Durum |
|---|---|
| 32 sayfada `og:image` yoktu (sayfa `openGraph` tanımlayınca kökteki görsel miras alınmıyor) | Düzeltildi: `pageMetadata` varsayılan görsel basar; kendi `opengraph-image` dosyası olan sayfalar `ownImage: true` geçirir. Analist ve araç sayfalarına kendi görselleri eklendi |
| Geçici Firestore hatası önbelleğe "yok" diye giriyordu; var olan bülten bir saat 404 sunulabiliyordu | Düzeltildi: `withRetry` (3 deneme); `getBulletin` hatayı fırlatır (önbelleğe girmez, önceki sağlam sayfa sunulur); analist sayfası veri okunamayınca 404 yerine hata verir |
| Googlebot'un 2.110 tarama isteğinin ≈1.010'u (%48) `?_rsc=` adreslerine gitmiş (Next.js bağlantı ön yüklemesi); aynı dönemde 36 gerçek sayfa hiç taranmamış | Uygulandı (13 Kasım, onaylı): `robots.ts` içine `Disallow: /*?_rsc=` ve `/*&_rsc=` |
| `/bulten/2026-W40` sıfır sinyalli (69 kelime) ve dizinde | Uygulandı (13 Kasım, onaylı): 10'dan az görüşlü bülten `noindex, follow` + sitemap dışı (`MIN_INDEX_BULLETIN_SIGNALS`) |
| `/kvkk` açıklaması 72 karakter | Düzeltildi |
| Ana sayfa ve `/konsensus` yüzlerce `noindex` varlık sayfasına bağlanıyor | Not: Google henüz bunların yalnızca 2'sini keşfetmiş; `_rsc` engelinden sonra tarama dağılımı yeniden değerlendirilmeli |

### 13 Kasım, ikinci tur (SEO + GEO tam tarama)

| Bulgu | Durum |
|---|---|
| Bülten ve karne sayfalarında 18 kırık iç bağlantı (sayfası artık olmayan varlıklara) | Düzeltildi: `AssetLink` yalnızca bilinen varlığa bağlantı verir, diğerini düz metin basar |
| Rehber yazılarında cevap ilk paragrafta değildi (giriş konuyu açıyor, cevabı vermiyor) | Düzeltildi: sayfa başında "Kısa cevap" kutusu (`description`) |
| `/favicon.ico` 404 | Düzeltildi: `/icon` rotasına yeniden yazım |
| Yapay zeka ve arama botları (16 kullanıcı aracısı × 7 adres) | Hepsi 200; içerik ham HTML'de |
| Canlıda tarayıcı konsol hatası | Yok (yerelde görülen React #418 canlıda tekrarlanmadı) |
| Mobil: TTFB ≈55 ms, CLS 0, yatay taşma yok | Geçti |
| `/konsensus`: 5.395 DOM düğümü, 818 KB ham HTML | Açık: sayfalama ya da "kim ne dedi" listesini istek üzerine yükleme gerekir |
| Bing Webmaster doğrulaması yok (`msvalidate.01` etiketi basılmıyor) | Sizde: ChatGPT araması Bing dizinini kullanır |
| `publisher.ts` hâlâ boş | Sizde |
| 404 sayfasında iki `robots` etiketi (noindex + index) | Zararsız: durum kodu 404, Google en kısıtlayıcıyı uygular |

## Ölçüm

Search Console → Performans → sorgularda şu kalıpları izleyin: "`<varlık>` yorumları", "`<varlık>` ne diyor", "ekonomist yorumları", "gram altın nasıl hesaplanır". İlk 4-8 haftada gösterim sayısı, sonra tıklama oranı; sıralama 3 aydan önce oturmaz.

## Açık konular (karar sizin)

* **Analist sayfaları** yapıldı (Kasım 2026); kurallar yukarıda.
* **Yinelenen varlıklar**: `src/lib/asset-utils.ts` aynı şirketi ayrı sayfalara bölüyor (chipotle/cmg, starbucks/sbux, intel/intc, broadcom/avgo, qualcomm/qcom, tsmc/tsm, moderna/mrna, ykb/ykbnk). Bu kurallar veri hattını etkilediği için dokunmadım; birleştirmek hem sayımı hem SEO'yu düzeltir.
* **Gizlilik sayfası** "Son güncelleme" olarak her zaman bugünün tarihini yazıyor; gerçek tarihle değiştirilmeli.
* **Rehber yazıları ve Hakkımızda'daki yayın ilkeleri** yeni metindir; yayına almadan önce gözden geçirin (özellikle olgu cümleleri ve "bağımsızlık" beyanı).
