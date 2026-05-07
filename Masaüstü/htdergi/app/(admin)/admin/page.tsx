import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = { title: "Dashboard | Admin — Hatıra Dergi" };

export default async function AdminDashboard() {
  const now = new Date();
  let stats = { totalUsers: 0, activeSubscriptions: 0, completedPayments: 0,
    unusedSerials: 0, totalOrders: 0, pendingOrders: 0, newUsersThisMonth: 0 };
  let recentUsers: { id: string; email: string; firstName: string | null; lastName: string | null; role: string; createdAt: Date }[] = [];
  let recentOrders: { id: string; status: string; totalPrice: unknown; createdAt: Date;
    user: { email: string; firstName: string | null; lastName: string | null } }[] = [];
  let isDemo = false;

  try {
    const [totalUsers, activeSubscriptions, completedPayments, unusedSerials,
      totalOrders, pendingOrders, newUsersThisMonth] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null, role: { not: "ADMIN" } } }),
      prisma.subscription.count({ where: { status: "ACTIVE", expiresAt: { gt: now } } }),
      prisma.payment.count({ where: { status: "COMPLETED" } }),
      prisma.serialCode.count({ where: { status: "UNUSED" } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: { in: ["PENDING", "CONFIRMED", "IN_PRODUCTION"] } } }),
      prisma.user.count({ where: {
        deletedAt: null,
        createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) },
      }}),
    ]);

    stats = { totalUsers, activeSubscriptions, completedPayments, unusedSerials,
      totalOrders, pendingOrders, newUsersThisMonth };

    [recentUsers, recentOrders] = await Promise.all([
      prisma.user.findMany({
        where: { deletedAt: null, role: { not: "ADMIN" } },
        orderBy: { createdAt: "desc" }, take: 6,
        select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" }, take: 6,
        select: {
          id: true, status: true, totalPrice: true, createdAt: true,
          user: { select: { email: true, firstName: true, lastName: true } },
        },
      }),
    ]);
  } catch { isDemo = true; }

  const roleLabel: Record<string, string> = {
    FREE: "Ücretsiz", SUBSCRIBER: "Abonelikli", SERIAL_USER: "Seri",
    COVER_BUYER: "Kapak", ADMIN: "Admin",
  };
  const roleClass: Record<string, string> = {
    FREE: "role-badge role-free", SUBSCRIBER: "role-badge role-subscriber",
    SERIAL_USER: "role-badge role-serial", COVER_BUYER: "role-badge role-cover",
    ADMIN: "role-badge role-admin",
  };
  const orderStatusLabel: Record<string, string> = {
    PENDING: "Beklemede", CONFIRMED: "Onaylandı", IN_PRODUCTION: "Üretimde",
    SHIPPED: "Kargoda", DELIVERED: "Teslim", CANCELLED: "İptal", REFUNDED: "İade",
  };
  const orderStatusClass: Record<string, string> = {
    PENDING: "ad-badge order-pending", CONFIRMED: "ad-badge order-confirmed",
    IN_PRODUCTION: "ad-badge order-in-production", SHIPPED: "ad-badge order-shipped",
    DELIVERED: "ad-badge order-delivered", CANCELLED: "ad-badge order-cancelled",
    REFUNDED: "ad-badge order-refunded",
  };

  return (
    <div>
      <h1 className="admin-section-title">Dashboard</h1>

      {isDemo && (
        <div style={{ background: "rgba(176,141,60,0.06)", border: "1px solid rgba(176,141,60,0.25)",
          padding: "12px 16px", marginBottom: "20px", color: "#8a6d2c", fontSize: "12px" }}>
          Veritabanı bağlantısı kurulamadı. Backend servisinin çalıştığından emin olun.
        </div>
      )}

      {/* İstatistik Kartları */}
      <div className="admin-stat-grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))" }}>
        <div className="admin-stat">
          <div className="admin-stat-label">Kullanıcılar</div>
          <div className="admin-stat-value">{stats.totalUsers}</div>
          <div className="admin-stat-sub">Bu ay +{stats.newUsersThisMonth}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-label">Aktif Abonelik</div>
          <div className="admin-stat-value gold">{stats.activeSubscriptions}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-label">Toplam Sipariş</div>
          <div className="admin-stat-value">{stats.totalOrders}</div>
          <div className="admin-stat-sub">{stats.pendingOrders} beklemede</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-label">Tamamlanan Ödeme</div>
          <div className="admin-stat-value">{stats.completedPayments}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-label">Kullanılmayan Seri</div>
          <div className="admin-stat-value">{stats.unusedSerials}</div>
        </div>
      </div>

      {/* İki sütun */}
      <div className="admin-detail-grid">
        {/* Son Kullanıcılar */}
        <div className="admin-card">
          <div className="admin-card-title">Son Kayıt Olan Kullanıcılar</div>
          <div className="admin-mini-list">
            {recentUsers.length === 0 && (
              <div style={{ color: "var(--ad-muted)", fontSize: 13, padding: "12px 0" }}>Henüz kullanıcı yok.</div>
            )}
            {recentUsers.map((u) => (
              <div key={u.id} className="admin-mini-item">
                <div>
                  <Link href={`/admin/kullanicilar/${u.id}`} style={{ fontWeight: 500, fontSize: 13 }}>
                    {u.firstName} {u.lastName}
                  </Link>
                  <div className="admin-mini-label">{u.email}</div>
                </div>
                <span className={roleClass[u.role] || "role-badge role-free"}>
                  {roleLabel[u.role] || u.role}
                </span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16 }}>
            <Link href="/admin/kullanicilar" className="admin-btn ghost" style={{ fontSize: 10 }}>
              Tümünü Gör →
            </Link>
          </div>
        </div>

        {/* Son Siparişler */}
        <div className="admin-card">
          <div className="admin-card-title">Son Siparişler</div>
          <div className="admin-mini-list">
            {recentOrders.length === 0 && (
              <div style={{ color: "var(--ad-muted)", fontSize: 13, padding: "12px 0" }}>Henüz sipariş yok.</div>
            )}
            {recentOrders.map((o) => (
              <div key={o.id} className="admin-mini-item">
                <div>
                  <Link href={`/admin/siparisler/${o.id}`} style={{ fontWeight: 500, fontSize: 13 }}>
                    {o.user.firstName} {o.user.lastName}
                  </Link>
                  <div className="admin-mini-label">
                    ₺{Number(o.totalPrice).toLocaleString("tr-TR")} ·{" "}
                    {new Date(o.createdAt).toLocaleDateString("tr-TR")}
                  </div>
                </div>
                <span className={orderStatusClass[o.status] || "ad-badge"}>
                  {orderStatusLabel[o.status] || o.status}
                </span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16 }}>
            <Link href="/admin/siparisler" className="admin-btn ghost" style={{ fontSize: 10 }}>
              Tümünü Gör →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
