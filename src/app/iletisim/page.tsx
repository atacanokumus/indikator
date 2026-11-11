import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { pageMetadata, webPageLd } from "@/lib/seo";

const DESCRIPTION =
    "Analist Ne Diyor ile iletişim: hata ve düzeltme bildirimi, içerik kaldırma talebi, kanal önerisi, basın ve reklam soruları. " +
    "Hangi konuda ne yazmanız gerektiği ve yanıt süresi.";

export const metadata: Metadata = pageMetadata({
    title: "İletişim",
    description: DESCRIPTION,
    path: "/iletisim",
});

const EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "iletisim@analistnediyor.com";

export default function IletisimPage() {
    return (
        <article className="wrap section" style={{ maxWidth: 680 }}>
            <Breadcrumbs items={[{ name: "İletişim", path: "/iletisim" }]} />
            <h1 className="h1" style={{ fontSize: "clamp(1.7rem, 3.6vw, 2.3rem)" }}>İletişim</h1>
            <p className="lead" style={{ marginTop: 16 }}>
                Soru, öneri, hata bildirimi ya da içerik kaldırma talepleriniz için bize yazabilirsiniz.
            </p>

            <div className="card card-pad stack gap-8" style={{ marginTop: 28 }}>
                <span className="eyebrow">E-posta</span>
                <a className="h3" href={`mailto:${EMAIL}`} style={{ color: "var(--brand)" }}>{EMAIL}</a>
                <span className="tiny">Genellikle 2 iş günü içinde dönüş yapıyoruz.</span>
            </div>

            <h2 className="h2" style={{ marginTop: 34 }}>Hangi konuda ne yazmalısınız?</h2>
            <p className="small">
                E-postanızda aşağıdaki bilgiler bulunursa talebinizi tek yazışmada sonuçlandırabiliriz:
            </p>
            <ul className="small">
                <li>
                    <strong>Bir özet yanlış:</strong> Videonun bağlantısını ve hangi varlık için yazılan özetin hatalı
                    olduğunu belirtin. En hızlı yol, özetin altındaki &ldquo;Bu özet yanlış&rdquo; düğmesidir; bildirilen
                    kayıt biz incelemeden önce listeden çıkar.
                </li>
                <li>
                    <strong>Kanalımı kaldırın:</strong> Kanal adını ve kanal sayfanızın bağlantısını yazın; takip listesinden
                    çıkaralım. Ayrıntılı yol{" "}
                    <Link href="/kaldirma">içerik kaldırma</Link> sayfasındadır.
                </li>
                <li>
                    <strong>Rehber ya da araçta hata:</strong> Sayfanın adresini, hatalı bulduğunuz cümleyi ya da sonucu
                    ve varsa doğrusunu gösteren kaynağı yazın. Düzeltme yapıldığında sayfadaki güncelleme tarihi değişir.
                </li>
                <li>
                    <strong>Kanal önerisi:</strong> Takip edilmesini istediğiniz kanalın bağlantısını paylaşın. Ekonomi ve
                    piyasa yorumu yapan, düzenli yayın yapan kanallar değerlendirilir.
                </li>
                <li>
                    <strong>Kişisel veriler:</strong> KVKK kapsamındaki başvurular için{" "}
                    <Link href="/kvkk">KVKK aydınlatma metnindeki</Link> yolu izleyin.
                </li>
                <li>
                    <strong>Basın, araştırma ve reklam:</strong> Verilerimizi kaynak göstererek kullanmak, yöntem hakkında
                    soru sormak ya da reklam konusunda görüşmek için aynı adrese yazabilirsiniz.
                </li>
            </ul>

            <h2 className="h2" style={{ marginTop: 34 }}>Yanıtlayamadığımız sorular</h2>
            <p className="small">
                Analist Ne Diyor yatırım danışmanlığı yapmaz. &ldquo;Altın alayım mı?&rdquo;, &ldquo;Hangi hisse
                yükselir?&rdquo; gibi kişiye özel sorulara yanıt veremiyoruz; bu tür sorular için Sermaye Piyasası
                Kurulu&apos;ndan yetki almış bir yatırım kuruluşuna başvurmanız gerekir. Sitenin neyi nasıl saydığını{" "}
                <Link href="/metodoloji">metodoloji</Link>, kim olduğumuzu ve yayın ilkelerimizi{" "}
                <Link href="/hakkimizda">hakkımızda</Link> sayfasında okuyabilirsiniz.
            </p>

            <JsonLd data={webPageLd({ type: "ContactPage", name: "İletişim", description: DESCRIPTION, path: "/iletisim" })} />
        </article>
    );
}
