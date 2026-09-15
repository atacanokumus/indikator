import { relativeTime } from "@/lib/display";

/**
 * GORELI ZAMAN
 *
 * "5 dakika once" gibi bir metin sunucuda ve tarayicida FARKLI anlarda
 * hesaplanir. Sayfa 60 saniye onbellekte durdugu icin sunucunun urettigi
 * metinle tarayicinin urettigi metin cogu zaman tutmaz ve React hidrasyonu
 * "Minified React error #418" ile patlar. Patlayinca o agactaki istemci
 * bilesenleri sessizce calismaz hale gelir.
 *
 * suppressHydrationWarning tam olarak bunun icin var: sunucunun bastigi metin
 * korunur, tarayici farkli hesaplasa bile hata firlatilmaz. Ayrica <time>
 * etiketiyle makine okunur tarihi de veriyoruz.
 */
export function RelativeTime({
    iso,
    className,
}: {
    iso: string | null | undefined;
    className?: string;
}) {
    if (!iso) return null;
    return (
        <time dateTime={iso} className={className} suppressHydrationWarning>
            {relativeTime(iso)}
        </time>
    );
}
