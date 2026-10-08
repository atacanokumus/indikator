import type { Metadata } from "next";

/**
 * Yönetim paneli arama dizinine girmemeli. robots.txt'teki "Disallow" tek başına
 * yetmez: engellenmiş bir adrese dışarıdan bağlantı verilirse Google adresi yine de
 * dizine alabilir (içeriğini okuyamadığı için başlıksız). "noindex" bunu kesin kapatır.
 */
export const metadata: Metadata = {
    title: "Yönetim",
    robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return children;
}
