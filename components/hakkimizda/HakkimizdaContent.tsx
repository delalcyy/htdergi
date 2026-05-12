"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import "@/styles/hakkimizda.css";

export default function HakkimizdaContent() {
  const { t } = useTranslation("common");

  const values = t("about.values", { returnObjects: true }) as { num: string; title: string; text: string }[];
  const stats = t("about.stats", { returnObjects: true }) as { num: string; label: string }[];
  const timeline = t("about.timeline", { returnObjects: true }) as { year: string; title: string; desc: string }[];

  return (
    <div className="hk">

      {/* ── Hero ── */}
      <section className="hk-hero">
        <div className="hk-wrap">
          <div className="hk-hero-inner">
            <div className="hk-hero-eyebrow">{t("about.eyebrow")}</div>
            <h1 className="hk-hero-title">
              {t("about.heroTitle")} <em>{t("about.heroTitleEm")}</em>
            </h1>
            <p className="hk-hero-desc">{t("about.heroDesc")}</p>
            <div className="hk-hero-rule" />
          </div>
        </div>
      </section>

      {/* ── Biz Kimiz ── */}
      <section className="hk-kimiz">
        <div className="hk-wrap">
          <div className="hk-kimiz-grid">
            <div className="hk-kimiz-left">
              <div className="hk-eyebrow">{t("about.storyEyebrow")}</div>
              <h2 className="hk-section-title">
                {t("about.storyTitle")} <em>{t("about.storyTitleEm")}</em>
              </h2>
              <div className="hk-kimiz-text">
                <p>{t("about.storyP1")}</p>
                <p>{t("about.storyP2")}</p>
                <p>{t("about.storyP3")}</p>
              </div>
            </div>

            <div className="hk-kimiz-right">
              <div className="hk-kimiz-quote-box">
                <div className="hk-big-quote">"</div>
                <p className="hk-quote-text">{t("about.quoteText")}</p>
                <div className="hk-quote-author">
                  <span className="hk-quote-author-name">{t("about.quoteAuthor")}</span>
                  <span className="hk-quote-author-title">{t("about.quoteAuthorTitle")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Misyon & Vizyon ── */}
      <section className="hk-mv">
        <div className="hk-wrap">
          <div className="hk-eyebrow">{t("about.mvEyebrow")}</div>
          <h2 className="hk-section-title">
            {t("about.mvTitle")} <em>{t("about.mvTitleEm")}</em>
          </h2>
          <div className="hk-mv-grid">
            <div className="hk-mv-card">
              <div className="hk-mv-icon">{t("about.missionIcon")}</div>
              <h3 className="hk-mv-card-title">{t("about.missionTitle")}</h3>
              <p className="hk-mv-card-text">{t("about.missionText")}</p>
            </div>
            <div className="hk-mv-card">
              <div className="hk-mv-icon">{t("about.visionIcon")}</div>
              <h3 className="hk-mv-card-title">{t("about.visionTitle")}</h3>
              <p className="hk-mv-card-text">{t("about.visionText")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Değerlerimiz ── */}
      <section className="hk-degerler">
        <div className="hk-wrap">
          <div className="hk-degerler-head">
            <div>
              <div className="hk-eyebrow">{t("about.valuesEyebrow")}</div>
              <h2 className="hk-section-title">
                {t("about.valuesTitle")} <em>{t("about.valuesTitleEm")}</em>
              </h2>
            </div>
            <p className="hk-degerler-lede">{t("about.valuesLede")}</p>
          </div>
          <div className="hk-degerler-grid">
            {values.map((d) => (
              <div key={d.num} className="hk-deger-item">
                <div className="hk-deger-num">{d.num}</div>
                <h3 className="hk-deger-title">{d.title}</h3>
                <p className="hk-deger-text">{d.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Rakamlar ── */}
      <section className="hk-stats">
        <div className="hk-wrap">
          <div className="hk-stats-grid">
            {stats.map((s) => (
              <div key={s.label} className="hk-stat-item">
                <div className="hk-stat-num">{s.num}</div>
                <div className="hk-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Hikayemiz (Timeline) ── */}
      <section className="hk-hikaye">
        <div className="hk-wrap">
          <div className="hk-hikaye-grid">
            <div>
              <div className="hk-eyebrow">{t("about.timelineEyebrow")}</div>
              <h2 className="hk-section-title">
                {t("about.timelineTitle")} <em>{t("about.timelineTitleEm")}</em>
              </h2>
              <div className="hk-hikaye-text">
                <p>{t("about.timelineP1")}</p>
                <p>{t("about.timelineP2")}</p>
              </div>
            </div>

            <div className="hk-hikaye-timeline">
              {timeline.map((item) => (
                <div key={item.year} className="hk-timeline-item">
                  <div className="hk-timeline-year">{item.year}</div>
                  <div className="hk-timeline-title">{item.title}</div>
                  <div className="hk-timeline-desc">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="hk-cta">
        <div className="hk-wrap">
          <div className="hk-cta-inner">
            <h2 className="hk-cta-title">
              {t("about.ctaTitle")} <em>{t("about.ctaTitleEm")}</em>
            </h2>
            <p className="hk-cta-sub">{t("about.ctaSub")}</p>
            <div className="hk-cta-btns">
              <Link href="/auth/kayit" className="hk-btn-primary">
                {t("about.ctaPrimary")} <span className="hk-arr">→</span>
              </Link>
              <Link href="/abonelik" className="hk-btn-ghost">
                {t("about.ctaSecondary")} <span className="hk-arr">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
