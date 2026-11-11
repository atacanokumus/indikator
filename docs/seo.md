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

## Ölçüm

Search Console → Performans → sorgularda şu kalıpları izleyin: "`<varlık>` yorumları", "`<varlık>` ne diyor", "ekonomist yorumları", "gram altın nasıl hesaplanır". İlk 4-8 haftada gösterim sayısı, sonra tıklama oranı; sıralama 3 aydan önce oturmaz.

## Açık konular (karar sizin)

* **Analist sayfaları** (`/analist/<kanal>`): "`<yorumcu>` altın yorumu" sorguları yüksek hacimli ve rakipsiz bir alan; ancak adı geçen kişiler için isabet oranını arama dizinine açmak hukuki risk. Yapılacaksa önce kaldırma talebi akışı ve oran gösterimi (en az 20 ölçüm) gözden geçirilmeli.
* **Yinelenen varlıklar**: `src/lib/asset-utils.ts` aynı şirketi ayrı sayfalara bölüyor (chipotle/cmg, starbucks/sbux, intel/intc, broadcom/avgo, qualcomm/qcom, tsmc/tsm, moderna/mrna, ykb/ykbnk). Bu kurallar veri hattını etkilediği için dokunmadım; birleştirmek hem sayımı hem SEO'yu düzeltir.
* **Gizlilik sayfası** "Son güncelleme" olarak her zaman bugünün tarihini yazıyor; gerçek tarihle değiştirilmeli.
* **Rehber yazıları ve Hakkımızda'daki yayın ilkeleri** yeni metindir; yayına almadan önce gözden geçirin (özellikle olgu cümleleri ve "bağımsızlık" beyanı).
