"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

type Props = {
  isLoggedIn: boolean;
};

export default function MobileMenu({ isLoggedIn }: Props) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation("common");

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="hdr-mobile">
      <button
        className="hdr-hamburger"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? t("nav.menuClose") : t("nav.menuOpen")}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 8h18M3 16h18" />
          </svg>
        )}
      </button>

      {open && (
        <>
          <div className="hdr-overlay" onClick={close} />
          <div className="hdr-mobile-menu">
            <nav className="hdr-mobile-nav">
              <Link href="/" className="hdr-mobile-link" onClick={close}>{t("nav.home")}</Link>
              <Link href="/hakkimizda" className="hdr-mobile-link" onClick={close}>{t("nav.about")}</Link>
              <Link href="/abonelik" className="hdr-mobile-link" onClick={close}>{t("nav.subscription")}</Link>
              <Link href="/nasil-calisir" className="hdr-mobile-link" onClick={close}>{t("nav.howItWorks")}</Link>
              <Link href="/iletisim" className="hdr-mobile-link" onClick={close}>{t("nav.contact")}</Link>
            </nav>
            <div className="hdr-mobile-actions">
              {isLoggedIn ? (
                <>
                  <Link href="/panel" className="hdr-mobile-secondary" onClick={close}>{t("nav.myPanel")}</Link>
                  <Link href="/kapak-tasarla" className="hdr-mobile-primary" onClick={close}>{t("nav.designCover")}</Link>
                </>
              ) : (
                <>
                  <Link href="/auth/giris" className="hdr-mobile-secondary" onClick={close}>{t("footer.linkLogin")}</Link>
                  <Link href="/kapak-tasarla" className="hdr-mobile-primary" onClick={close}>{t("nav.designCover")}</Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
