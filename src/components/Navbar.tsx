"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

const LINKS = [
    { href: "/", label: "Görüşler" },
    { href: "/konsensus", label: "Konsensüs" },
    { href: "/bulten", label: "Bülten" },
    { href: "/rehber", label: "Rehber" },
    { href: "/araclar", label: "Araçlar" },
];

/** /rehber/gram-altin… açıkken "Rehber" sekmesi de seçili görünsün. */
function isCurrent(pathname: string, href: string) {
    return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
    const pathname = usePathname();
    return (
        <header className="navbar">
            <nav className="wrap navbar-inner" aria-label="Ana menü">
                <Link href="/" className="nav-logo" aria-label="Analist Ne Diyor ana sayfa" style={{ textDecoration: "none" }}>
                    <Logo />
                </Link>
                <div className="nav-links">
                        {LINKS.map((l) => (
                            <Link
                                key={l.href}
                                href={l.href}
                                className="nav-link"
                                aria-current={isCurrent(pathname, l.href) ? "page" : undefined}
                            >
                                {l.label}
                            </Link>
                        ))}
                </div>
                <div className="nav-end">
                    <ThemeToggle />
                </div>
            </nav>
        </header>
    );
}
