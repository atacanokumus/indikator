"use client";

import { useState } from "react";

type PolicyType = "kvkk" | "privacy" | "spk";

interface ComplianceModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: PolicyType;
}

const tabLabels: Record<PolicyType, string> = {
    spk: "SPK Uyarısı",
    kvkk: "KVKK",
    privacy: "Kullanım Koşulları",
};

export const ComplianceModal = ({ isOpen, onClose, initialTab = "spk" }: ComplianceModalProps) => {
    const [activeTab, setActiveTab] = useState<PolicyType>(initialTab);

    if (!isOpen) return null;

    const content = {
        spk: {
            title: "Yasal Uyarı (SPK Mevzuatı)",
            text: (
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>
                    <p>
                        Bu platformda sunulan tüm veriler, yorumlar ve "Sinyal" (AL/SAT/TUT) ifadeleri
                        6362 sayılı Sermaye Piyasası Kanunu ve ilgili mevzuat çerçevesinde{" "}
                        <strong>yatırım danışmanlığı faaliyeti kapsamında değildir.</strong>
                    </p>
                    <div style={{
                        background: "var(--signal-bekle-bg)",
                        borderLeft: "3px solid var(--signal-bekle)",
                        padding: 16,
                        borderRadius: 8,
                        fontStyle: "italic",
                        lineHeight: 1.7,
                    }}>
                        "Yatırım danışmanlığı hizmeti; aracı kurumlar, portföy yönetim şirketleri,
                        mevduat kabul etmeyen bankalar ile müşteri arasında imzalanacak yatırım
                        danışmanlığı sözleşmesi çerçevesinde sunulmaktadır."
                    </div>
                    <p>
                        <strong>ECOTUBE</strong>, YouTube üzerindeki halka açık içerikleri Yapay Zeka
                        (AI) ile analiz eder. Bu analizler:
                    </p>
                    <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                        <li>Kişisel görüşlere dayanır ve mali durumunuza uygun olmayabilir.</li>
                        <li>AI modelinin transkript yorumlama hataları içerebilir.</li>
                        <li>Gecikmeli veriler veya eksik bağlam içerebilir.</li>
                    </ul>
                    <p>
                        Buradaki bilgilere dayanarak verilen yatırım kararları beklentilerinize uygun
                        sonuçlar doğurmayabilir. SPK lisanslı profesyonel destek almanız tavsiye edilir.
                    </p>
                </div>
            ),
        },
        kvkk: {
            title: "KVKK Aydınlatma Metni",
            text: (
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>
                    <p>
                        6698 Sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca,{" "}
                        <strong>ECOTUBE</strong> platformu üzerinden toplanan verileriniz hakkında
                        bilgilendirme:
                    </p>
                    <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                        <li>
                            <strong>Veri Sorumlusu:</strong> ECOTUBE Platform Yönetimi.
                        </li>
                        <li>
                            <strong>İşlenen Veriler:</strong> Sadece platformun stabil çalışması için
                            gerekli olan teknik loglar (IP adresi, tarayıcı bilgisi vb.) geçici olarak
                            tutulabilir.
                        </li>
                        <li>
                            <strong>Amaç:</strong> Teknik güvenliğin sağlanması ve sistem performansının
                            ölçülmesi.
                        </li>
                    </ul>
                    <p>
                        Platformumuz üyelik gerektirmediği sürece ad, soyad gibi doğrudan kimlikleyici
                        kişisel verileri işlemez.
                    </p>
                </div>
            ),
        },
        privacy: {
            title: "Kullanım Koşulları ve Gizlilik",
            text: (
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>
                    <p>
                        <strong>ECOTUBE</strong> platformunu kullanarak aşağıdaki şartları kabul etmiş
                        sayılırsınız:
                    </p>
                    <p>1. Sunulan içerikler "olduğu gibi" sunulur, doğruluk garantisi verilmez.</p>
                    <p>
                        2. Platformda yer alan YouTube içeriklerinin telif hakları ilgili kanal sahiplerine
                        aittir. ECOTUBE sadece kamuya açık verileri özetleyen bir araçtır.
                    </p>
                    <p>
                        3. Verilerin manipüle edilmesi veya ticari amaçla izinsiz kopyalanması yasaktır.
                    </p>
                    <p>
                        4. Bu platform kar amacı gütmeyen/deneme amaçlı bir finansal teknoloji projesidir.
                    </p>
                </div>
            ),
        },
    };

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
                background: "rgba(0,0,0,0.4)",
                backdropFilter: "blur(4px)",
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="animate-fade-in-up"
                style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)",
                    width: "100%",
                    maxWidth: 640,
                    maxHeight: "85vh",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "var(--shadow-xl)",
                    overflow: "hidden",
                }}
            >
                {/* Header */}
                <div style={{
                    padding: "20px 24px",
                    borderBottom: "1px solid var(--border)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                    }}>
                        <span style={{ fontSize: 20 }}>⚖️</span>
                        <h2 style={{
                            fontSize: 16,
                            fontWeight: 700,
                            color: "var(--text-primary)",
                            margin: 0,
                        }}>
                            Yasal Bilgiler
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            border: "1px solid var(--border)",
                            background: "transparent",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--text-muted)",
                            fontSize: 16,
                            transition: "all 0.2s",
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Tabs */}
                <div style={{
                    display: "flex",
                    borderBottom: "1px solid var(--border)",
                }}>
                    {(["spk", "kvkk", "privacy"] as PolicyType[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                flex: 1,
                                padding: "12px 16px",
                                fontSize: 13,
                                fontWeight: activeTab === tab ? 700 : 500,
                                color: activeTab === tab ? "var(--brand-teal)" : "var(--text-muted)",
                                background: "transparent",
                                border: "none",
                                borderBottom: activeTab === tab ? "2px solid var(--brand-teal)" : "2px solid transparent",
                                cursor: "pointer",
                                transition: "all 0.2s",
                            }}
                        >
                            {tabLabels[tab]}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "24px 28px",
                    fontSize: 14,
                    color: "var(--text-secondary)",
                    lineHeight: 1.7,
                }}>
                    <h3 style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        marginBottom: 16,
                    }}>
                        {content[activeTab].title}
                    </h3>
                    {content[activeTab].text}
                </div>

                {/* Footer */}
                <div style={{
                    padding: "16px 24px",
                    borderTop: "1px solid var(--border)",
                    display: "flex",
                    justifyContent: "flex-end",
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: "10px 24px",
                            background: "var(--brand-teal)",
                            color: "white",
                            border: "none",
                            borderRadius: 8,
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "background 0.2s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--brand-teal-light)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--brand-teal)")}
                    >
                        Anladım
                    </button>
                </div>
            </div>
        </div>
    );
};
