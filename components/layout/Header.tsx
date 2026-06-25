"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import MobileMenu from "./MobileMenu";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import "@/styles/header.css";

type Props = { isLoggedIn?: boolean };

export default function Header({ isLoggedIn = false }: Props) {
  const pathname = usePathname();
  const { t } = useTranslation("common");

  const isActive = (href: string) => pathname === href;

  return (
    <header className="hdr-root">
      <div className="hdr-inner">
        <nav className="hdr-nav-left">
          <Link href="/" className={`hdr-nav-link ${isActive("/") ? "hdr-active" : ""}`}>{t("nav.home")}</Link>
          <Link href="/hakkimizda" className={`hdr-nav-link ${isActive("/hakkimizda") ? "hdr-active" : ""}`}>{t("nav.about")}</Link>
          <Link href="/abonelik" className={`hdr-nav-link ${isActive("/abonelik") ? "hdr-active" : ""}`}>{t("nav.subscription")}</Link>
          <Link href="/nasil-calisir" className={`hdr-nav-link ${isActive("/nasil-calisir") ? "hdr-active" : ""}`}>{t("nav.howItWorks")}</Link>
          <Link href="/iletisim" className={`hdr-nav-link ${isActive("/iletisim") ? "hdr-active" : ""}`}>{t("nav.contact")}</Link>
          <div className="hdr-dropdown-wrap">
            <span className={`hdr-nav-link hdr-dropdown-trigger ${pathname.startsWith("/amedspor") ? "hdr-active" : ""}`}>
              {t("nav.partnerships")} <span className="hdr-dropdown-arrow">▾</span>
            </span>
            <div className="hdr-dropdown-panel hdr-dropdown-panel--wide">
              {["Amedspor","Fenerbahçe","Galatasaray","Beşiktaş","National Geographic","Fortune","Marie Claire","Elele","Bebeğimle","HeyGirl","Formante","InStyle","Atlas","Weddings","Evim","Men's Health","Women's Health","Runners"].map(name => (
                <Link key={name} href="/#referanslar" className="hdr-dropdown-item">{name}</Link>
              ))}
            </div>
          </div>
        </nav>

        <Link href="/" className="hdr-logo">
          <Image src="/logo6.png" alt="Hatıra Dergi" height={48} width={240} style={{ objectFit: "contain", height: "48px", width: "auto" }} priority />
          <span className="hdr-logo-text">HATIRA DERGİ</span>
        </Link>

        <div className="hdr-actions">
          <LanguageSwitcher />
          {isLoggedIn ? (
            <Link href="/panel" className={`hdr-nav-link ${isActive("/panel") ? "hdr-active" : ""}`}>{t("nav.myPanel")}</Link>
          ) : (
            <Link href="/auth/giris" className={`hdr-nav-link ${isActive("/auth/giris") ? "hdr-active" : ""}`}>{t("footer.linkLogin")}</Link>
          )}
          <Link href="/kapak-tasarla" className="hdr-btn-primary">{t("nav.designCover")}</Link>
        </div>

        <MobileMenu isLoggedIn={isLoggedIn} />
      </div>
    </header>
  );
}
