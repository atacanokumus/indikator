"use client";

import { useState, useEffect } from "react";
import { getLatestAnalysesFiltered, VideoAnalysis, Channel } from "@/lib/firestore";
import { SignalCards } from "@/components/SignalCards";
import { ComplianceModal } from "@/components/ComplianceModal";
import { OnboardingModal } from "@/components/OnboardingModal";
import { NewsTicker } from "@/components/NewsTicker";
import { normalizeAsset } from "@/lib/asset-utils";
import Link from "next/link";
import { useSyncTimer } from "@/hooks/useSyncTimer";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Dashboard() {
  const [analyses, setAnalyses] = useState<VideoAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState<Record<string, { price: number; currency: string }>>({});
  const [isComplianceOpen, setIsComplianceOpen] = useState(false);
  const [news, setNews] = useState<any[]>([]);
  const [syncStatus, setSyncStatus] = useState<any>(null);

  const { minutesSinceLastSync, minutesUntilNextSync, isInitializing } = useSyncTimer(() => {
    console.log("Timer expired! Reloading live data...");
    loadData();
    fetchNewsData();
  });

  useEffect(() => {
    loadData();
    fetchNewsData();

    // Sync status listener
    if (db) {
      const unsub = onSnapshot(doc(db, "system_status", "sync_state"), (docSnap) => {
        if (docSnap.exists()) {
          setSyncStatus(docSnap.data());
        }
      });
      return () => unsub();
    }
  }, []);

  const fetchNewsData = async () => {
    try {
      const res = await fetch('/api/news');
      const data = await res.json();
      setNews(data);
    } catch (err) {
      console.error("Haber yükleme hatası:", err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // Load analyses and stored prices in parallel
      const [data, storedPrices] = await Promise.all([
        getLatestAnalysesFiltered(),
        import('@/lib/firestore').then(m => m.getStoredPrices())
      ]);

      setAnalyses(data);
      setPrices(storedPrices);

      if (data.length > 0) {
        // Still fetch live prices to refresh the data
        const originalAssets = data.flatMap((v) => v.results.map((r) => r.asset));
        const normalizedAssets = originalAssets.map((a) => normalizeAsset(a));
        const uniqueAssets = Array.from(new Set([...originalAssets, ...normalizedAssets]));
        fetchPrices(uniqueAssets);
      }
    } catch (err) {
      console.error("Veri yükleme hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrices = async (assets: string[]) => {
    if (assets.length === 0) return;
    try {
      const resp = await fetch("/api/prices", {
        method: "POST",
        body: JSON.stringify({ assets }),
      });
      const data = await resp.json();
      if (data.success) {
        setPrices(prev => ({ ...prev, ...data.prices }));
      }
    } catch (err) {
      console.error("Fiyat yükleme hatası:", err);
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* Navigation */}
      <nav className="navbar">
        <Link href="/" className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <img
            src="/logo-main.png"
            alt="Ecotube Logo"
            style={{
              height: 40,
              width: "auto",
              objectFit: "contain"
            }}
          />
        </Link>

        <div className="nav-links">
          <Link href="/" className="nav-link active">Sinyaller</Link>
          <Link href="/forecasts" className="nav-link">Konsensüs</Link>
          <Link href="/economists" className="nav-link">Analistler</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: "60px 24px 40px",
        textAlign: "center",
        maxWidth: 720,
        margin: "0 auto",
      }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: syncStatus?.isAnalyzing ? "var(--signal-bekle-bg)" : "var(--signal-al-bg)",
          color: syncStatus?.isAnalyzing ? "var(--signal-bekle)" : "var(--signal-al)",
          padding: "6px 14px",
          borderRadius: "var(--radius-full)",
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 20,
          border: syncStatus?.isAnalyzing ? "1px solid var(--signal-bekle-border)" : "1px solid var(--signal-al-border)",
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: "50%", 
            background: syncStatus?.isAnalyzing ? "var(--signal-bekle)" : "var(--signal-al)",
            display: "inline-block",
            boxShadow: syncStatus?.isAnalyzing ? "0 0 8px var(--signal-bekle)" : "0 0 8px var(--signal-al)",
            animation: "pulse 2s infinite"
          }} />
          {syncStatus?.isAnalyzing ? (
            `Şu an aktif analizlenen: ${syncStatus.currentChannel} - ${syncStatus.currentVideo}`
          ) : isInitializing ? (
            "Canlı veriler güncelleniyor..."
          ) : (
            `Şu an aktif analizlenen bir kanal bulunmamaktadır. Sonraki tarama ${minutesUntilNextSync} dk içinde.`
          )}
        </div>

        <h1 style={{
          fontSize: "clamp(2rem, 5vw, 2.75rem)",
          fontWeight: 900,
          color: "var(--text-primary)",
          lineHeight: 1.15,
          letterSpacing: "-0.03em",
          margin: "0 0 16px",
        }}>
          Ekonomistler<br />
          <span style={{ color: "var(--brand-teal)" }}>Ne Diyor?</span>
        </h1>

        <p style={{
          fontSize: 17,
          color: "var(--text-secondary)",
          lineHeight: 1.6,
          maxWidth: 520,
          margin: "0 auto",
        }}>
          YouTube ekonomistlerinin son videolarını yapay zeka ile analiz ediyor,
          size <strong>AL</strong>, <strong>SAT</strong> ve <strong>BEKLE</strong> sinyallerini sunuyoruz.
        </p>
      </section>

      {/* News Ticker Section */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <NewsTicker />
      </section>

      {/* Signal Cards */}
      <section style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "0 24px 40px",
      }}>
        {loading && analyses.length === 0 ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: 16,
            width: "100%",
            paddingTop: 48
          }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card" style={{ padding: "24px", height: "180px", display: "flex", flexDirection: "column", justifyContent: "space-between", borderColor: "var(--border-light)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ width: "40%", height: "24px", background: "var(--bg-surface)", borderRadius: "4px", animation: "pulse 1.5s infinite" }} />
                  <div style={{ width: "20%", height: "36px", background: "var(--bg-surface)", borderRadius: "8px", animation: "pulse 1.5s infinite" }} />
                </div>
                <div style={{ width: "100%", height: "8px", background: "var(--bg-surface)", borderRadius: "4px", animation: "pulse 1.5s infinite" }} />
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid var(--border-light)" }}>
                  <div style={{ width: "30%", height: "16px", background: "var(--bg-surface)", borderRadius: "4px", animation: "pulse 1.5s infinite" }} />
                  <div style={{ width: "20%", height: "16px", background: "var(--bg-surface)", borderRadius: "4px", animation: "pulse 1.5s infinite" }} />
                </div>
              </div>
            ))}
            <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
          </div>
        ) : (
          <>
            <SignalCards data={analyses} prices={prices} news={news} />
            {analyses.length === 0 && !loading && (
              <div style={{
                textAlign: "center",
                padding: "60px 24px",
                color: "var(--text-secondary)",
                fontSize: 16,
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
                  Son 7 günde sinyal bulunamadı
                </div>
                <div>Analistlerin yeni videoları yayınlanınca sinyaller otomatik olarak güncellenecektir.</div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Disclaimer */}
      <section style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "0 24px 60px",
      }}>
        <div style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "24px 28px",
          display: "flex",
          flexDirection: "column" as const,
          gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--signal-bekle)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--signal-bekle)" }}>Yasal Uyarı</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>
            Bu platformda yer alan bilgiler <strong>yatırım danışmanlığı</strong> kapsamında değildir.
            ECOTUBE, YouTube üzerindeki finansal içerikleri yapay zeka ile özetleyen bir araştırma aracıdır.
            Gösterilen sinyaller kesinlik ifade etmez. Yatırım kararlarınızı profesyonel danışmanlık alarak veriniz.
          </p>
          <button
            onClick={() => setIsComplianceOpen(true)}
            style={{
              alignSelf: "flex-start",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--brand-teal)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            Detaylı Yasal Bilgi →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid var(--border)",
        padding: "24px",
        textAlign: "center",
        color: "var(--text-muted)",
        fontSize: 13,
      }}>
        © 2026 ECOTUBE · Akıllı Analiz & Sinyal Üretimi · <Link href="/privacy" style={{ color: "var(--text-muted)", textDecoration: "underline" }}>Gizlilik Politikası</Link>
      </footer>

      <ComplianceModal
        isOpen={isComplianceOpen}
        onClose={() => setIsComplianceOpen(false)}
        initialTab="spk"
      />

      {/* Welcome Guide for First Time Users */}
      <OnboardingModal />
    </main>
  );
}
