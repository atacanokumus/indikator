/**
 * LOGO — YouTube oynat üçgeni, içinde yükselen ve düşen ok.
 *
 * Fikir: sitenin kaynağı YouTube (üçgen), işi ise o videolarda söylenen
 * yönleri ayırmak (yeşil yukarı ok = alım yönü, kırmızı aşağı ok = satış
 * yönü). Üçgenin içindeki iki ok birbirine karışmasın diye kademeli
 * yerleştirildi; üçgen sağa doğru daraldığı için aşağı ok daha kısa.
 *
 * Renkler sitenin AL/SAT değişkenleriyle aynı olmak zorunda değil çünkü
 * logo tema değişse de sabit kalmalı; bu yüzden değerler gömülü.
 */
const UP = "#16a34a";
const DOWN = "#dc2626";

export function LogoMark({ size = 34 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
            <rect width="48" height="48" rx="13" fill="#0d4d5c" />
            {/* YouTube oynat üçgeni */}
            <path
                d="M16.4 12.6q0-2.4 2-1.2l18.2 11.4q1.9 1.2 0 2.4L18.4 36.6q-2 1.2-2-1.2Z"
                fill="#fff"
            />
            {/* yükselen ok */}
            <path
                d="M22 30.6V19.4M19 22.4l3-3 3 3"
                stroke={UP} strokeWidth="2.5" fill="none"
                strokeLinecap="round" strokeLinejoin="round"
            />
            {/* düşen ok */}
            <path
                d="M29.2 20.2v6.6M27.2 24.9l2 2 2-2"
                stroke={DOWN} strokeWidth="2.5" fill="none"
                strokeLinecap="round" strokeLinejoin="round"
            />
        </svg>
    );
}

export function Logo({ withTagline = false }: { withTagline?: boolean }) {
    return (
        <span className="row gap-8" style={{ textDecoration: "none" }}>
            <LogoMark />
            <span className="stack logo-word" style={{ lineHeight: 1 }}>
                <span style={{ fontSize: 20, fontWeight: 850, letterSpacing: "-0.045em", color: "var(--brand)" }}>
                    analist<span style={{ color: "var(--gold)" }}>nediyor</span>
                </span>
                {withTagline && (
                    <span className="tiny" style={{ marginTop: 3, letterSpacing: ".08em", textTransform: "uppercase", fontSize: 9.5 }}>
                        Kim ne diyor, sayımı burada
                    </span>
                )}
            </span>
        </span>
    );
}
