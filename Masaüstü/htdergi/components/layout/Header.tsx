"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MobileMenu from "./MobileMenu";
import "@/styles/header.css";

export default function Header() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <header className="hdr-root">
      <div className="hdr-inner">
        <nav className="hdr-nav-left">
          <Link href="/" className={`hdr-nav-link ${isActive("/") ? "hdr-active" : ""}`}>Anasayfa</Link>
          <Link href="/hakkimizda" className={`hdr-nav-link ${isActive("/hakkimizda") ? "hdr-active" : ""}`}>Hakkımızda</Link>
          <Link href="/abonelik" className={`hdr-nav-link ${isActive("/abonelik") ? "hdr-active" : ""}`}>Abonelik</Link>
          <Link href="/nasil-calisir" className={`hdr-nav-link ${isActive("/nasil-calisir") ? "hdr-active" : ""}`}>Nasıl Çalışır</Link>
          <Link href="/iletisim" className={`hdr-nav-link ${isActive("/iletisim") ? "hdr-active" : ""}`}>İletişim</Link>
        </nav>

        <Link href="/" className="hdr-logo">HATIRA DERGİ</Link>

        <div className="hdr-actions">
          <Link href="/panel" className={`hdr-nav-link ${isActive("/panel") ? "hdr-active" : ""}`}>Panelim</Link>
          <Link href="/kapak-tasarla" className="hdr-btn-primary">Kapak Tasarla</Link>
        </div>

        <MobileMenu isLoggedIn={true} />
      </div>
    </header>
  );
}