"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import "@/styles/footer.css";

export default function Footer() {
  const { t } = useTranslation("common");

  return (
    <footer className="ftr-root">
      <div className="ftr-inner">
        <div className="ftr-top">
          {/* Marka */}
          <div className="ftr-brand">
            <Link href="/" className="ftr-logo">Hatıra Dergi</Link>
            <p className="ftr-tagline">{t("footer.tagline")}</p>
            <div className="ftr-social">
              <a href="#" className="ftr-social-link" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                </svg>
              </a>
              <a href="#" className="ftr-social-link" aria-label="Twitter/X">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="#" className="ftr-social-link" aria-label="YouTube">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z" />
                  <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none" />
                </svg>
              </a>
            </div>
          </div>

          {/* Linkler */}
          <div className="ftr-col">
            <div className="ftr-col-title">{t("footer.colProduct")}</div>
            <Link href="/kapak-tasarla" className="ftr-link">{t("footer.linkDesign")}</Link>
            <Link href="/abonelik" className="ftr-link">{t("footer.linkPlans")}</Link>
            <Link href="/nasil-calisir" className="ftr-link">{t("footer.linkHowItWorks")}</Link>
          </div>

          <div className="ftr-col">
            <div className="ftr-col-title">{t("footer.colCompany")}</div>
            <Link href="/hakkimizda" className="ftr-link">{t("footer.linkAbout")}</Link>
            <Link href="/sss" className="ftr-link">{t("footer.linkFaq")}</Link>
            <Link href="/iletisim" className="ftr-link">{t("footer.linkContact")}</Link>
          </div>

          <div className="ftr-col">
            <div className="ftr-col-title">{t("footer.colAccount")}</div>
            <Link href="/auth/giris" className="ftr-link">{t("footer.linkLogin")}</Link>
            <Link href="/auth/kayit" className="ftr-link">{t("footer.linkRegister")}</Link>
            <Link href="/panel" className="ftr-link">{t("footer.linkPanel")}</Link>
          </div>

          <div className="ftr-col">
            <div className="ftr-col-title">{t("footer.colContact")}</div>
            <span className="ftr-info">info@hatiradergi.com</span>
            <span className="ftr-info">{t("footer.city")}</span>
          </div>
        </div>

        {/* Ödeme & güven logoları */}
        <div className="ftr-payment">
          <div className="ftr-payment-logos">
            {/* Visa */}
            <div className="ftr-pay-badge">
              <svg viewBox="0 0 60 20" width="48" height="16" aria-label="Visa">
                <text x="0" y="16" fontFamily="Arial,sans-serif" fontWeight="900" fontSize="17" fill="#1a1f71" letterSpacing="-0.5">VISA</text>
              </svg>
            </div>
            {/* Mastercard */}
            <div className="ftr-pay-badge">
              <svg viewBox="0 0 38 24" width="38" height="24" aria-label="Mastercard">
                <circle cx="14" cy="12" r="10" fill="#eb001b" />
                <circle cx="24" cy="12" r="10" fill="#f79e1b" />
                <path d="M19 5.3a10 10 0 0 1 0 13.4A10 10 0 0 1 19 5.3z" fill="#ff5f00" />
              </svg>
            </div>
            {/* iyzico */}
            <div className="ftr-pay-badge ftr-pay-badge--iyzico">
              <span>iyzico</span>
              <span className="ftr-pay-ile">ile Öde</span>
            </div>
            {/* Güvenli Ödeme */}
            <div className="ftr-pay-badge ftr-pay-badge--ssl">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span>Güvenli Ödeme</span>
            </div>
          </div>
        </div>

        <div className="ftr-bottom">
          <span>© {new Date().getFullYear()} Hatıra Dergi. {t("footer.copyright")}</span>
          <div className="ftr-legal">
            <Link href="/gizlilik" className="ftr-legal-link">Gizlilik</Link>
            <Link href="/teslimat-iade" className="ftr-legal-link">Teslimat &amp; İade</Link>
            <Link href="/mesafeli-satis-sozlesmesi" className="ftr-legal-link">Mesafeli Satış</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
