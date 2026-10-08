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

* **`MIN_ANALYSTS_FOR_INDEX`** (`src/lib/seo.ts`) düşürülürse ince sayfalar dizine geri girer. Eşiği düşürmek yerine içeriği artırın.
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

## Ölçüm

Search Console → Performans → sorgularda şu kalıpları izleyin: "`<varlık>` yorumları", "`<varlık>` ne diyor", "ekonomist yorumları", "gram altın nasıl hesaplanır". İlk 4-8 haftada gösterim sayısı, sonra tıklama oranı; sıralama 3 aydan önce oturmaz.

## Açık konular (karar sizin)

* **Analist sayfaları** (`/analist/<kanal>`): "`<yorumcu>` altın yorumu" sorguları yüksek hacimli ve rakipsiz bir alan; ancak adı geçen kişiler için isabet oranını arama dizinine açmak hukuki risk. Yapılacaksa önce kaldırma talebi akışı ve oran gösterimi (en az 20 ölçüm) gözden geçirilmeli.
* **Yinelenen varlıklar**: `src/lib/asset-utils.ts` aynı şirketi ayrı sayfalara bölüyor (chipotle/cmg, starbucks/sbux, intel/intc, broadcom/avgo, qualcomm/qcom, tsmc/tsm, moderna/mrna, ykb/ykbnk). Bu kurallar veri hattını etkilediği için dokunmadım; birleştirmek hem sayımı hem SEO'yu düzeltir.
* **Gizlilik sayfası** "Son güncelleme" olarak her zaman bugünün tarihini yazıyor; gerçek tarihle değiştirilmeli.
* **Rehber yazıları ve Hakkımızda'daki yayın ilkeleri** yeni metindir; yayına almadan önce gözden geçirin (özellikle olgu cümleleri ve "bağımsızlık" beyanı).
