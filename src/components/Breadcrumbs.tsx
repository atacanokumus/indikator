import Link from "next/link";
import { JsonLd } from "./JsonLd";
import { breadcrumbLd, type Crumb } from "@/lib/seo";

/**
 * Ekmek kırıntısı: hem görünür gezinti hem BreadcrumbList verisi.
 * Arama sonucunda adresin yerine "Ana sayfa › Rehber › …" yolu görünür ve
 * sayfanın site içindeki yerini arama motoruna açıkça söyler.
 * Son öğe geçerli sayfadır, bağlantı değildir.
 */
export function Breadcrumbs({ items, style }: { items: Crumb[]; style?: React.CSSProperties }) {
    const trail: Crumb[] = [{ name: "Ana sayfa", path: "/" }, ...items];
    return (
        <>
            <nav className="tiny crumbs" aria-label="Konum" style={style}>
                <ol>
                    {trail.map((c, i) => {
                        const last = i === trail.length - 1;
                        return (
                            <li key={c.path}>
                                {last ? (
                                    <span aria-current="page">{c.name}</span>
                                ) : (
                                    <Link href={c.path}>{c.name}</Link>
                                )}
                            </li>
                        );
                    })}
                </ol>
            </nav>
            <JsonLd data={breadcrumbLd(trail)} />
        </>
    );
}
