"use client";

import { useTranslation } from "react-i18next";
import AbonelikPlanlar from "@/components/shared/AbonelikPlanlar";
import type { SubscriptionPlan } from "@prisma/client";

type InfoItem = { icon: string; title: string; text: string };
type Faq = { q: string; a: string };

type Props = {
  plans: SubscriptionPlan[];
};

export default function AbonelikStaticContent({ plans }: Props) {
  const { t } = useTranslation("common");

  const infoItems = t("subscription.infoItems", { returnObjects: true }) as InfoItem[];
  const faqs = t("subscription.faqs", { returnObjects: true }) as Faq[];

  return (
    <div className="ab">

      {/* ── Hero ── */}
      <section className="ab-hero">
        <div className="ab-wrap">
          <div className="ab-hero-inner">
            <div className="ab-hero-eyebrow">{t("subscription.heroEyebrow")}</div>
            <h1 className="ab-hero-title">
              {t("subscription.heroTitle")} <em>{t("subscription.heroTitleEm")}</em>
            </h1>
            <p className="ab-hero-desc">{t("subscription.heroDesc")}</p>
          </div>
        </div>
      </section>

      {/* ── Plans ── */}
      <section className="ab-plans-section">
        <div className="ab-wrap">
          <div className="ab-plans-head">
            <div className="ab-eyebrow">{t("subscription.plansEyebrow")}</div>
            <h2 className="ab-section-title">
              {t("subscription.plansTitle")} <em>{t("subscription.plansTitleEm")}</em>
            </h2>
            <p className="ab-section-lede">{t("subscription.plansLede")}</p>
          </div>
          <AbonelikPlanlar plans={plans} />
          <p className="ab-compare-note">{t("subscription.compareNote")}</p>
        </div>
      </section>

      {/* ── Bilgilendirme ── */}
      <section className="ab-info">
        <div className="ab-wrap">
          <div className="ab-info-head">
            <div>
              <div className="ab-eyebrow">{t("subscription.infoEyebrow")}</div>
              <h2 className="ab-section-title">
                {t("subscription.infoTitle")} <em>{t("subscription.infoTitleEm")}</em>
              </h2>
            </div>
            <p className="ab-info-lede">{t("subscription.infoLede")}</p>
          </div>
          <div className="ab-info-grid">
            {infoItems.map((item) => (
              <div key={item.title} className="ab-info-item">
                <div className="ab-info-icon">{item.icon}</div>
                <h3 className="ab-info-title">{item.title}</h3>
                <p className="ab-info-text">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SSS ── */}
      <section className="ab-faq">
        <div className="ab-wrap">
          <div className="ab-eyebrow">{t("subscription.faqEyebrow")}</div>
          <h2 className="ab-section-title">
            {t("subscription.faqTitle")} <em>{t("subscription.faqTitleEm")}</em>
          </h2>
          <div className="ab-faq-grid">
            {faqs.map((faq) => (
              <div key={faq.q} className="ab-faq-item">
                <div className="ab-faq-q">{faq.q}</div>
                <p className="ab-faq-a">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Güvence ── */}
      <section className="ab-guarantee">
        <div className="ab-wrap">
          <div className="ab-guarantee-inner">
            <div className="ab-guarantee-text-side">
              <div className="ab-eyebrow">{t("subscription.guaranteeEyebrow")}</div>
              <h2 className="ab-guarantee-title">
                {t("subscription.guaranteeTitle")} <em>{t("subscription.guaranteeTitleEm")}</em>
              </h2>
              <p className="ab-guarantee-desc">{t("subscription.guaranteeDesc")}</p>
            </div>

            <div className="ab-guarantee-badges">
              <div className="ab-guarantee-badge">
                <span className="ab-badge-icon">◈</span>
                <div className="ab-badge-text">
                  <span className="ab-badge-label">{t("subscription.badge1Label")}</span>
                  <span className="ab-badge-sub">{t("subscription.badge1Sub")}</span>
                </div>
              </div>
              <div className="ab-guarantee-badge">
                <span className="ab-badge-icon">◇</span>
                <div className="ab-badge-text">
                  <span className="ab-badge-label">{t("subscription.badge2Label")}</span>
                  <span className="ab-badge-sub">{t("subscription.badge2Sub")}</span>
                </div>
              </div>
              <div className="ab-guarantee-badge">
                <span className="ab-badge-icon">◉</span>
                <div className="ab-badge-text">
                  <span className="ab-badge-label">{t("subscription.badge3Label")}</span>
                  <span className="ab-badge-sub">{t("subscription.badge3Sub")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
