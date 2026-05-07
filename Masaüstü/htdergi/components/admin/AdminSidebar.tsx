"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navGroups = [
  {
    section: "Genel",
    items: [
      { href: "/admin", label: "Dashboard" },
    ],
  },
  {
    section: "Kullanıcılar",
    items: [
      { href: "/admin/kullanicilar", label: "Tüm Kullanıcılar" },
      { href: "/admin/abonelikler", label: "Abonelikler" },
      { href: "/admin/odemeler", label: "Ödemeler" },
    ],
  },
  {
    section: "Satış Araçları",
    items: [
      { href: "/admin/seri-numaralari", label: "Seri Numaraları" },
      { href: "/admin/indirim-kodlari", label: "İndirim Kodları" },
    ],
  },
  {
    section: "İçerik",
    items: [
      { href: "/admin/sablonlar", label: "Kapak Şablonları" },
      { href: "/admin/roportaj-kategorileri", label: "Röportaj Kategorileri" },
    ],
  },
  {
    section: "Güvenlik",
    items: [
      { href: "/admin/audit-log", label: "Audit Log" },
    ],
  },
  {
    section: "Editör",
    items: [
      { href: "/kapak-tasarla", label: "Kapak Tasarla (Test)" },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/cikis", { method: "POST" });
    router.push("/auth/giris");
    router.refresh();
  }

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-logo">
        <span>Hatıra Dergi</span>
        <small>Admin Panel</small>
      </div>

      <nav className="admin-nav">
        {navGroups.map((group) => (
          <div key={group.section}>
            <div className="admin-nav-section">{group.section}</div>
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-item ${pathname === item.href ? "active" : ""}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <button onClick={handleLogout}>Çıkış Yap</button>
      </div>
    </aside>
  );
}
