"use client";

import { useTranslation } from "react-i18next";
import IletisimForm from "@/components/shared/IletisimForm";
import "@/styles/iletisim.css";

type Faq = { q: string; a: string };

export default function IletisimContent() {
  const { t } = useTranslation("common");

  const faqs = t("contact.faqs", { returnObjects: true }) as Faq[];

  return (
    <div className="il">

      {/* ── Hero ── */}
      <section className="il-hero">
        <div className="il-wrap">
          <div className="il-hero-inner">
            <div>
              <div className="il-hero-eyebrow">{t("contact.eyebrow")}</div>
              <h1 className="il-hero-title">
                {t("contact.heroTitle")} <em>{t("contact.heroTitleEm")}</em> {t("contact.heroTitleRest")}
              </h1>
              <p className="il-hero-desc">{t("contact.heroDesc")}</p>
            </div>

            <div className="il-hero-contacts">
              <div className="il-hero-contact-item">
                <div className="il-contact-icon">@</div>
                <div>
                  <div className="il-contact-label">{t("contact.emailLabel")}</div>
                  <div className="il-contact-value">info@hatiradergi.com</div>
                </div>
              </div>
              <div className="il-hero-contact-item">
                <div className="il-contact-icon">◎</div>
                <div>
                  <div className="il-contact-label">{t("contact.locationLabel")}</div>
                  <div className="il-contact-value">{t("contact.location")}</div>
                </div>
              </div>
              <div className="il-hero-contact-item">
                <div className="il-contact-icon">◷</div>
                <div>
                  <div className="il-contact-label">{t("contact.responseLabel")}</div>
                  <div className="il-contact-value">{t("contact.responseTime")}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Form + Bilgi ── */}
      <section className="il-main">
        <div className="il-wrap">
          <div className="il-main-grid">

            {/* Form */}
            <div>
              <div className="il-eyebrow">{t("contact.formEyebrow")}</div>
              <h2 className="il-form-title">
                {t("contact.formTitle")} <em>{t("contact.formTitleEm")}</em>
              </h2>
              <IletisimForm />
            </div>

            {/* Sağ bilgi paneli */}
            <div className="il-info-panel">
              <div className="il-info-section">
                <div className="il-info-section-title">{t("contact.infoTitle")}</div>
                <div className="il-info-list">
                  <div className="il-info-row">
                    <span className="il-info-dot" />
                    <div className="il-info-text">
                      <span className="il-info-key">{t("contact.emailLabel")}</span>
                      <span className="il-info-val">{t("contact.supportEmail")}</span>
                    </div>
                  </div>
                  <div className="il-info-row">
                    <span className="il-info-dot" />
                    <div className="il-info-text">
                      <span className="il-info-key">{t("contact.locationLabel")}</span>
                      <span className="il-info-val">{t("contact.location")}</span>
                    </div>
                  </div>
                  <div className="il-info-row">
                    <span className="il-info-dot" />
                    <div className="il-info-text">
                      <span className="il-info-key">{t("contact.workHoursLabel")}</span>
                      <span className="il-info-val">{t("contact.workHours")}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="il-response-box">
                <span className="il-response-icon">◷</span>
                <div>
                  <div className="il-response-label">{t("contact.responseBoxLabel")}</div>
                  <div className="il-response-val">{t("contact.responseBoxText")}</div>
                </div>
              </div>

              <div className="il-info-section">
                <div className="il-info-section-title">{t("contact.socialTitle")}</div>
                <div className="il-info-list">
                  <div className="il-info-row">
                    <span className="il-info-dot" />
                    <div className="il-info-text">
                      <span className="il-info-key">Instagram</span>
                      <span className="il-info-val">@hatiradergi</span>
                    </div>
                  </div>
                  <div className="il-info-row">
                    <span className="il-info-dot" />
                    <div className="il-info-text">
                      <span className="il-info-key">Twitter / X</span>
                      <span className="il-info-val">@hatiradergi</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── SSS ── */}
      <section className="il-faq">
        <div className="il-wrap">
          <div className="il-faq-head">
            <div>
              <div className="il-eyebrow">{t("contact.faqEyebrow")}</div>
              <h2 className="il-section-title">
                {t("contact.faqTitle")} <em>{t("contact.faqTitleEm")}</em>
              </h2>
            </div>
            <p className="il-faq-lede">{t("contact.faqLede")}</p>
          </div>
          <div className="il-faq-grid">
            {faqs.map((faq) => (
              <div key={faq.q} className="il-faq-item">
                <div className="il-faq-q">{faq.q}</div>
                <p className="il-faq-a">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
