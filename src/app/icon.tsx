import { renderIcon } from "@/lib/og";

/**
 * Raster simge. Google, arama sonuçlarındaki site simgesi için en az 48×48
 * (48'in katı) bir dosya ister; yalnızca SVG vermek bazı yüzeylerde simgenin
 * hiç çıkmamasına yol açıyor. SVG (icon.svg) tarayıcı sekmesi için kalıyor.
 */
export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default async function Icon() {
    return renderIcon(192);
}
