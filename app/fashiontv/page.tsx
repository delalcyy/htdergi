import type { Metadata } from "next";
import Link from "next/link";
import "@/styles/fashiontv.css";

export const metadata: Metadata = {
  title: "FashionTV × Hatıra Dergi — Kendi Kapağında Yıldız Ol",
  description: "FashionTV ve Hatıra Dergi işbirliğiyle kendi kişisel moda dergini tasarla. Profesyonel tasarım, hızlı teslimat.",
};

export default function FashionTVPage() {
  return (
    <div className="ftv-page">

      {/* ── DUYURU BANDI ── */}
      <div className="ftv-topbar">
        FashionTV × Hatıra Dergi — Özel İşbirliği
      </div>

      {/* ── NAV ── */}
      <nav className="ftv-nav">
        <div className="ftv-nav-inner">
          <div className="ftv-logo-group">
            {/* FashionTV logosu */}
            <div style={{ width: 120, height: 44, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>
              FashionTV Logo
            </div>
            <span className="ftv-nav-sep">×</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo6.png" alt="Hatıra Dergi" className="ftv-logo-img" />
          </div>
          <Link href="/kapak-tasarla" className="ftv-nav-cta">
            Derginizi Oluşturun
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="ftv-hero">
        <div className="ftv-hero-bg">
          {/* Hero arka plan görseli buraya gelecek */}
          <div className="ftv-hero-placeholder">Hero Görseli</div>
          <div className="ftv-hero-overlay" />
        </div>
        <div className="ftv-hero-content">
          <div className="ftv-hero-badge">FashionTV × Hatıra Dergi Özel İşbirliği</div>
          <h1 className="ftv-hero-h1">
            Kendi Kapağında<br />
            <em>Yıldız Ol</em>
          </h1>
          <p className="ftv-hero-sub">
            FashionTV'nin dünyasında yerini al. Kişisel moda dergini tasarla,
            kendi hikâyeni en prestijli sayfalarda anlat.
          </p>
          <div className="ftv-hero-btns">
            <Link href="/kapak-tasarla" className="ftv-btn-primary">
              Hemen Başla <span>→</span>
            </Link>
            <a href="#nasil-calisir" className="ftv-btn-ghost">
              Nasıl Çalışır?
            </a>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="ftv-stats">
        <div className="ftv-stats-inner">
          {[
            { n: "1.000+", label: "Basılan Dergi" },
            { n: "4.8★",   label: "Müşteri Memnuniyeti" },
            { n: "24 Saat", label: "Tasarım & Teslim" },
            { n: "100%",   label: "Kişiselleştirilmiş" },
          ].map((s) => (
            <div key={s.label} className="ftv-stat">
              <span className="ftv-stat-n">{s.n}</span>
              <span className="ftv-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── NASIL ÇALIŞIR ── */}
      <section className="ftv-section ftv-steps" id="nasil-calisir">
        <div className="ftv-section-inner">
          <p className="ftv-section-tag">Süreç</p>
          <h2 className="ftv-section-h2">Üç Adımda<br />Kendi Dergini Yarat</h2>
          <p className="ftv-section-desc">
            FashionTV estetiğiyle tasarlanmış şablonları kullan, fotoğraflarını yükle,
            dergini kapat — biz hallederiz.
          </p>
          <div className="ftv-steps-grid">
            {[
              {
                n: "01",
                title: "Şablonunu Seç",
                desc: "FashionTV'ye özel hazırlanmış premium tasarım şablonları arasından beğenini seç. Her şablon moda dünyasının ruhunu taşır.",
              },
              {
                n: "02",
                title: "Kişiselleştir",
                desc: "Fotoğraflarını yükle, başlıklarını yaz, tarzını ekle. Kolay arayüzümüzle dakikalar içinde profesyonel bir kapak oluştur.",
              },
              {
                n: "03",
                title: "Teslim Al",
                desc: "24 saat içinde baskıya giden dergini kısa sürede kapıda bulursun. Kaliteli kâğıt, profesyonel baskı, özenle paketlenmiş.",
              },
            ].map((step) => (
              <div key={step.n} className="ftv-step">
                <div className="ftv-step-num">{step.n}</div>
                <div className="ftv-step-title">{step.title}</div>
                <p className="ftv-step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── KAPAK ÖRNEKLERİ ── */}
      <section className="ftv-section ftv-covers" id="ornekler">
        <div className="ftv-section-inner">
          <p className="ftv-section-tag">Örnekler</p>
          <h2 className="ftv-section-h2">İlham Veren<br />Kapaklar</h2>
          <p className="ftv-section-desc">
            Daha önce tasarlanan dergilerden örnekler. Seninkini de buraya taşıyalım.
          </p>
          <div className="ftv-covers-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="ftv-cover-card">
                {/* Kapak görselleri buraya gelecek */}
                <div className="ftv-cover-placeholder">
                  <div className="ftv-cover-placeholder-icon">✦</div>
                  <span>Kapak {i}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="ftv-cta">
        <div className="ftv-cta-inner">
          <h2>Senin Dergini<br />Tasarlamaya Hazırız</h2>
          <p>
            FashionTV'nin ikonik estetiğiyle birleşen Hatıra Dergi kalitesi —
            bu fırsatı kaçırmayın.
          </p>
          <Link href="/kapak-tasarla" className="ftv-cta-btn">
            Şimdi Tasarla <span>→</span>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="ftv-footer">
        <p>
          © {new Date().getFullYear()} FashionTV × <a href="https://hatiradergi.com">Hatıra Dergi</a>. Tüm hakları saklıdır.
        </p>
      </footer>

    </div>
  );
}
