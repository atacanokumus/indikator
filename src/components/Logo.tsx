export function LogoMark({ size = 34 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
            <rect width="48" height="48" rx="13" fill="#0d4d5c" />
            <path d="M18 15.4Q18 13.1 20 14.2l12.6 8.1q1.8 1.2 0 2.3L20 32.7q-2 1.1-2-1.2Z" fill="#fff" />
            <circle cx="35.5" cy="13.5" r="6" fill="#c9973f" />
            <path
                d="M35.5 16.4V10.8M33 13.1l2.5-2.6 2.5 2.6"
                stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"
            />
        </svg>
    );
}

export function Logo({ withTagline = false }: { withTagline?: boolean }) {
    return (
        <span className="row gap-8" style={{ textDecoration: "none" }}>
            <LogoMark />
            <span className="stack" style={{ lineHeight: 1 }}>
                <span style={{ fontSize: 21, fontWeight: 850, letterSpacing: "-0.045em", color: "var(--brand)" }}>
                    eco<span style={{ color: "var(--gold)" }}>tube</span>
                </span>
                {withTagline && (
                    <span className="tiny" style={{ marginTop: 3, letterSpacing: ".08em", textTransform: "uppercase", fontSize: 9.5 }}>
                        Ekonomistler ne diyor?
                    </span>
                )}
            </span>
        </span>
    );
}
