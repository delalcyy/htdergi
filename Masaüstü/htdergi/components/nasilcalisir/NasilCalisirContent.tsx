"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import "@/styles/nasilcalisir.css";

type Step = {
  num: string;
  tag: string;
  cardTitle: string;
  cardDesc: string;
  title: string;
  titleEm: string;
  desc: string;
  bullets: string[];
  chips: string[];
};

type Tip = {
  num: string;
  title: string;
  text: string;
};

export default function NasilCalisirContent() {
  const { t } = useTranslation("common");

  const steps = t("howItWorks.steps", { returnObjects: true }) as Step[];
  const tips = t("howItWorks.tips", { returnObjects: true }) as Tip[];

  return (
    <div className="nc">

      {/* ── Hero ── */}
      <section className="nc-hero">
        <div className="nc-wrap">
          <div className="nc-hero-inner">
            <div className="nc-hero-eyebrow">{t("howItWorks.eyebrow")}</div>
            <h1 className="nc-hero-title">
              {t("howItWorks.heroTitle")} <em>{t("howItWorks.heroTitleEm")}</em>
            </h1>
            <p className="nc-hero-desc">{t("howItWorks.heroDesc")}</p>
            <div className="nc-hero-steps-row">
              {steps.map((s, i) => (
                <div key={s.num} className="nc-hero-step">
                  <span className="nc-hero-step-num">{s.num}</span>
                  <span className="nc-hero-step-label">{s.cardTitle}</span>
                  {i < steps.length - 1 && <span className="nc-hero-step-arrow">→</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Özet Grid ── */}
      <section className="nc-overview">
        <div className="nc-wrap">
          <div className="nc-overview-grid">
            {steps.map((s) => (
              <div key={s.num} className="nc-overview-item">
                <div className="nc-ov-num">{s.num}</div>
                <div className="nc-ov-title">{s.cardTitle}</div>
                <div className="nc-ov-desc">{s.cardDesc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Adım Adım Detaylar ── */}
      {steps.map((step, i) => (
        <section key={step.num} className="nc-step-section">
          <div className="nc-wrap">
            <div className={`nc-step-grid${i % 2 === 1 ? " nc-reverse" : ""}`}>

              <div className="nc-step-visual">
                <div className="nc-step-card">
                  <div className="nc-step-card-num">{step.num}</div>
                  <div className="nc-step-card-inner">
                    <span className="nc-step-card-tag">{step.tag}</span>
                    <h3 className="nc-step-card-title">{step.cardTitle}</h3>
                    <p className="nc-step-card-desc">{step.cardDesc}</p>
                  </div>
                </div>
              </div>

              <div className="nc-step-content">
                <div className="nc-eyebrow">{step.tag}</div>
                <h2 className="nc-step-title">
                  {step.title} <em>{step.titleEm}</em>
                </h2>
                <p className="nc-step-desc">{step.desc}</p>
                <ul className="nc-step-bullets">
                  {step.bullets.map((b) => (
                    <li key={b}>
                      <span className="nc-bullet-dot">✓</span>
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="nc-step-chips">
                  {step.chips.map((c) => (
                    <span key={c} className="nc-chip">{c}</span>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>
      ))}

      {/* ── İpuçları ── */}
      <section className="nc-tips">
        <div className="nc-wrap">
          <div className="nc-tips-head">
            <div className="nc-tips-eyebrow">{t("howItWorks.tipsEyebrow")}</div>
            <h2 className="nc-tips-title">
              {t("howItWorks.tipsTitle")} <em>{t("howItWorks.tipsTitleEm")}</em>
            </h2>
          </div>
          <div className="nc-tips-grid">
            {tips.map((tip) => (
              <div key={tip.num} className="nc-tip-card">
                <div className="nc-tip-num">{tip.num}</div>
                <h3 className="nc-tip-title">{tip.title}</h3>
                <p className="nc-tip-text">{tip.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="nc-cta">
        <div className="nc-wrap">
          <div className="nc-cta-inner">
            <h2 className="nc-cta-title">
              {t("howItWorks.ctaTitle")} <em>{t("howItWorks.ctaTitleEm")}</em>
            </h2>
            <p className="nc-cta-sub">{t("howItWorks.ctaSub")}</p>
            <div className="nc-cta-btns">
              <Link href="/kapak-tasarla" className="nc-btn-primary">
                {t("howItWorks.ctaPrimary")} <span className="nc-arr">→</span>
              </Link>
              <Link href="/abonelik" className="nc-btn-ghost">
                {t("howItWorks.ctaSecondary")} <span className="nc-arr">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
