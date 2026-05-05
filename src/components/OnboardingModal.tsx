"use client";

import { useState, useEffect } from "react";

export function OnboardingModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        // Check if the user has seen the onboarding before
        const hasSeen = localStorage.getItem("hasSeenOnboarding");
        if (!hasSeen) {
            setIsOpen(true);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem("hasSeenOnboarding", "true");
    };

    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

    const slides = [
        {
            title: "Ecotube'a Hoş Geldiniz! 🚀",
            description: "Türkiye'nin ve dünyanın en iyi ekonomistlerinin yorumlarını saniyeler içinde analiz edip, size yatırım sinyalleri sunuyoruz. Artık saatlerce video izlemenize gerek yok.",
            icon: "🎯",
            action: "Keşfetmeye Başla"
        },
        {
            title: "Varlık veya Yorumcu Bazlı Görünüm",
            description: "İster Altın, Bitcoin gibi varlıklara göre; isterseniz favori ekonomistinizin (Örn: Devrim Akyıl) tüm yorumlarına göre piyasayı tek ekrandalı analiz edin. 'Varlık Bazlı' veya 'Yorumcu Bazlı' ikonlarına tıklamanız yeterli.",
            icon: "🎚️",
            action: "Devam Et"
        },
        {
            title: "Akıllı Sinyaller Dönemi 📈",
            description: "Yapay zekamız, analistlerin konuşmalarını dinler, nedenleriyle birlikte Al, Sat veya Bekle sinyalleri çıkarır. En Çok Yorumlananlara veya En Güncel olanlara anında ulaşın.",
            icon: "🤖",
            action: "Hemen Başlıyorum"
        }
    ];

    if (!isOpen) return null;

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: isMobile ? "20px" : "40px"
        }}>
            <div style={{
                backgroundColor: "var(--bg-surface)",
                borderRadius: "24px",
                width: "100%",
                maxWidth: "500px",
                padding: isMobile ? "32px 24px" : "48px 40px",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--border)",
                textAlign: "center",
                animation: "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                position: "relative"
            }}>

                {/* Progress Bar */}
                <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "32px" }}>
                    {slides.map((_, idx) => (
                        <div key={idx} style={{
                            height: "4px",
                            flex: 1,
                            borderRadius: "2px",
                            backgroundColor: idx <= step ? "var(--brand-teal)" : "var(--border)",
                            transition: "all 0.3s ease"
                        }} />
                    ))}
                </div>

                <div style={{
                    fontSize: "64px",
                    marginBottom: "24px",
                    display: "inline-block",
                    animation: "float 3s ease-in-out infinite"
                }}>
                    {slides[step].icon}
                </div>

                <h2 style={{
                    fontSize: isMobile ? "24px" : "28px",
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    marginBottom: "16px",
                    letterSpacing: "-0.02em"
                }}>
                    {slides[step].title}
                </h2>

                <p style={{
                    fontSize: "16px",
                    lineHeight: "1.6",
                    color: "var(--text-secondary)",
                    marginBottom: "40px"
                }}>
                    {slides[step].description}
                </p>

                <button
                    onClick={() => {
                        if (step < slides.length - 1) {
                            setStep(s => s + 1);
                        } else {
                            handleClose();
                        }
                    }}
                    style={{
                        width: "100%",
                        padding: "16px",
                        backgroundColor: "var(--brand-teal)",
                        color: "white",
                        border: "none",
                        borderRadius: "16px",
                        fontSize: "16px",
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        boxShadow: "0 8px 16px rgba(20, 184, 166, 0.25)"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                    onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
                >
                    {slides[step].action}
                </button>

                {/* Skip button for early exits */}
                {step < slides.length - 1 && (
                    <button
                        onClick={handleClose}
                        style={{
                            marginTop: "16px",
                            background: "none",
                            border: "none",
                            color: "var(--text-muted)",
                            fontSize: "14px",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "color 0.2s"
                        }}
                        onMouseOver={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                        onMouseOut={(e) => e.currentTarget.style.color = "var(--text-muted)"}
                    >
                        Turu Geç
                    </button>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
      `}} />
        </div>
    );
}
