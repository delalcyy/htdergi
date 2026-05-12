"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { SessionUser } from "@/types";

const navItems = [
  { href: "/panel", label: "Genel Bakış" },
  { href: "/panel/profil", label: "Profilim" },
  { href: "/panel/sifre-degistir", label: "Şifre Değiştir" },
  { href: "/panel/abonelik", label: "Aboneliğim" },
  { href: "/panel/siparislerim", label: "Siparişlerim" },
  { href: "/panel/satin-alimlarim", label: "Ödemelerim" },
  { href: "/panel/tasarimlarim", label: "Tasarımlarım" },
  { href: "/panel/roportajlarim", label: "Röportajlarım" },
];

type Props = {
  user: SessionUser;
};

export default function PanelSidebar({ user }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/cikis", { method: "POST" });
    router.push("/auth/giris");
    router.refresh();
  }

  return (
    <aside className="panel-sidebar">
      <div className="panel-sidebar-logo">
        <Link href="/">Hatıra Dergi</Link>
      </div>

      <nav className="panel-nav">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`panel-nav-item ${pathname === item.href ? "active" : ""}`}
          >
            {item.label}
          </Link>
        ))}
        <Link
          href="/kapak-tasarla"
          className="panel-nav-item"
          style={{ marginTop: "auto", borderTop: "1px solid #e5e7eb", paddingTop: "0.75rem" }}
        >
          Kapak Tasarla
        </Link>
      </nav>

      <div className="panel-sidebar-footer">
        <div style={{ fontSize: "0.8125rem", color: "#6b7280", marginBottom: "0.5rem" }}>
          {user.firstName} {user.lastName}
        </div>
        <button
          onClick={handleLogout}
          style={{
            fontSize: "0.8125rem",
            color: "#dc2626",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
