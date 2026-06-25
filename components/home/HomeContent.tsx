"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import GaleriSlider from "@/components/anasayfa/GaleriSlider";
import "@/styles/anasayfa.css";

type Testimonial = { name: string; title: string; text: string };

export default function HomeContent() {
  const { t } = useTranslation("common");

  const steps = t("home.steps.items", { returnObjects: true }) as { n: string; title: string; desc: string }[];
  const categories = t("home.categories.items", { returnObjects: true }) as string[];
  const testimonials = t("home.testimonials.items", { returnObjects: true }) as Testimonial[];

  return (
    <main className="hp">

      {/* ── Hero ── */}
      <section className="hp-hero">
        <div className="hp-hero-wrap">
          <div className="hp-hero-left">
            <h1 className="hp-h1">
              {t("home.hero.quote")}<br />
              <em>{t("home.hero.quoteEm")}</em>
              <span className="hp-h1-rule" />
              <span className="hp-h1-author">{t("home.hero.author")}</span>
            </h1>
            <p className="hp-lede">{t("home.hero.lede")}</p>
            <div className="hp-hero-btns">
              <Link href="/auth/kayit" className="hp-btn-primary">
                {t("home.hero.ctaPrimary")} <span className="hp-arr">→</span>
              </Link>
              <Link href="/abonelik" className="hp-btn-ghost">{t("home.hero.ctaSecondary")}</Link>
            </div>
          </div>

          <div className="hp-hero-right">
            <div className="hp-cover-stage">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/kapak.png" alt="Örnek Kapak" className="hp-cover-img" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee ── */}
      <div className="hp-marquee">
        <div className="hp-marquee-inner">
          {[0, 1, 2, 3].map((rep) => (
            <div key={rep} className="hp-marquee-track" aria-hidden={rep > 0 ? "true" : undefined}>
              {categories.map((c, i) => (
                <span key={i}>{c} <span className="hp-sep">✦</span></span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Nasıl Çalışır ── */}
      <section className="hp-section" id="nasil-calisir">
        <div className="hp-section-wrap">
          <div className="hp-section-head">
            <div>
              <span className="hp-eyebrow">{t("home.steps.eyebrow")}</span>
              <h2 className="hp-section-title">{t("home.steps.title")} <em>{t("home.steps.titleEm")}</em></h2>
            </div>
            <p className="hp-section-lede">{t("home.steps.lede")}</p>
          </div>
          <div className="hp-steps-grid">
            {steps.map((s) => (
              <div key={s.n} className="hp-step">
                <span className="hp-step-n">{s.n}</span>
                <h3 className="hp-step-title">{s.title}</h3>
                <p className="hp-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Kategoriler ── */}
      <section className="hp-section hp-section-cats-dark">
        <div className="hp-section-wrap">
          <div className="hp-section-head">
            <div>
              <span className="hp-eyebrow">{t("home.categories.eyebrow")}</span>
              <h2 className="hp-section-title">{t("home.categories.title")} <em>{t("home.categories.titleEm")}</em></h2>
            </div>
          </div>
          <div className="hp-cats">
            {categories.map((c, i) => (
              <Link key={c} href="/kapak-tasarla" className="hp-cat-card">
                <span className="hp-cat-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="hp-cat-name">{c}</span>
                <span className="hp-cat-arr">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Galeri ── */}
      <section className="hp-section">
        <div className="hp-section-wrap">
          <div className="hp-section-head">
            <div>
              <span className="hp-eyebrow">{t("home.gallery.eyebrow")}</span>
              <h2 className="hp-section-title">{t("home.gallery.title")} <em>{t("home.gallery.titleEm")}</em></h2>
            </div>
          </div>
          <GaleriSlider />
        </div>
      </section>

      {/* ── Biz Kimiz ── */}
      <section className="hp-section hp-section-bizkimiz">
        <div className="hp-section-wrap">
          <div className="hp-bk-inner">
            <div className="hp-bk-header">
              <span className="hp-eyebrow">{t("home.bizKimiz.eyebrow")}</span>
              <h2 className="hp-section-title">
                {t("home.bizKimiz.title")} <em>{t("home.bizKimiz.titleEm")}</em>
              </h2>
            </div>
            <div className="hp-bk-body">
              <p className="hp-bk-intro">{t("home.bizKimiz.intro")}</p>
              <p className="hp-bk-p">{t("home.bizKimiz.p1")}</p>
              <p className="hp-bk-p">{t("home.bizKimiz.p2")}</p>
              <p className="hp-bk-p">{t("home.bizKimiz.p3")}</p>
              <p className="hp-bk-tagline">{t("home.bizKimiz.tagline")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Yorumlar ── */}
      <section className="hp-section hp-section-warm">
        <div className="hp-section-wrap">
          <div className="hp-section-head">
            <div>
              <span className="hp-eyebrow">{t("home.testimonials.eyebrow")}</span>
              <h2 className="hp-section-title">{t("home.testimonials.title")} <em>{t("home.testimonials.titleEm")}</em></h2>
            </div>
          </div>
          <div className="hp-testimonials-grid">
            {testimonials.map((item) => (
              <div key={item.name} className="hp-testimonial-card">
                <div className="hp-testimonial-quote">"</div>
                <p className="hp-testimonial-text">{item.text}</p>
                <div className="hp-testimonial-footer">
                  <span className="hp-testimonial-name">{item.name}</span>
                  <span className="hp-testimonial-title">{item.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Referanslarımız ── */}
      <section className="hp-section hp-section-referanslar">
        <div className="hp-section-wrap">
          <div className="hp-section-head" style={{ marginBottom: "48px" }}>
            <div>
              <span className="hp-eyebrow">Güven &amp; İşbirliği</span>
              <h2 className="hp-section-title">Referanslarımız</h2>
            </div>
          </div>
          <div className="hp-ref-grid">
            {[
              { file: "fenerbahce.jpeg",          label: "Fenerbahçe" },
              { file: "galatasaray.jpeg",         label: "Galatasaray" },
              { file: "besiktas.jpeg",            label: "Beşiktaş" },
              { file: "national-geographic.webp", label: "National Geographic" },
              { file: "fortune.jpg",              label: "Fortune" },
              { file: "marie-claire.jpg",         label: "Marie Claire" },
              { file: "elele.jpeg",               label: "Elele" },
              { file: "bebegimle.png",            label: "Bebeğimle" },
              { file: "heygirl.jpg",              label: "HeyGirl" },
              { file: "formsante.webp",           label: "Formsante" },
              { file: "atlas.webp",               label: "Atlas" },
              { file: "menshealth.jpg",           label: "Men's Health" },
              { file: "womenshealth.png",         label: "Women's Health" },
              { file: "runners.jpeg",             label: "Runners" },
            ].map((r) => (
              <div key={r.file} className="hp-ref-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/referanslar/${r.file}`}
                  alt={r.label}
                  className="hp-ref-img"
                />
                <span className="hp-ref-label">{r.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="hp-cta">
        <div className="hp-section-wrap hp-cta-inner">
          <h2 className="hp-cta-title">{t("home.cta.title")} <em>{t("home.cta.titleEm")}</em></h2>
          <p className="hp-cta-sub">{t("home.cta.subtitle")}</p>
          <Link href="/auth/kayit" className="hp-btn-primary hp-btn-lg">
            {t("home.cta.button")} <span className="hp-arr">→</span>
          </Link>
        </div>
      </section>

    </main>
  );
}
