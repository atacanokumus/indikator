"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

const LINKS = [
    { href: "/", label: "Sinyaller" },
    { href: "/konsensus", label: "Konsensüs" },
    { href: "/analistler", label: "Analistler" },
];

export function Navbar() {
    const pathname = usePathname();
    return (
        <header className="navbar">
            <nav className="wrap navbar-inner" aria-label="Ana menü">
                <Link href="/" aria-label="ECOTUBE ana sayfa" style={{ textDecoration: "none" }}>
                    <Logo />
                </Link>
                <div className="row gap-8">
                    <div className="nav-links">
                        {LINKS.map((l) => (
                            <Link
                                key={l.href}
                                href={l.href}
                                className="nav-link"
                                aria-current={pathname === l.href ? "page" : undefined}
                            >
                                {l.label}
                            </Link>
                        ))}
                    </div>
                    <ThemeToggle />
                </div>
            </nav>
        </header>
    );
}
