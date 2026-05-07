import { prisma } from "@/lib/prisma";

export const metadata = { title: "Dashboard | Admin" };

export default async function AdminDashboard() {
  let totalUsers = 0, activeSubscriptions = 0, totalPayments = 0, unusedSerials = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let usersByRole: any[] = [];
  let recentUsers: { id: string; email: string; firstName: string | null; lastName: string | null; role: string; createdAt: Date }[] = [];
  let isDemo = false;

  try {
    [totalUsers, activeSubscriptions, totalPayments, unusedSerials] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null, role: { not: "ADMIN" } } }),
      prisma.subscription.count({ where: { status: "ACTIVE", expiresAt: { gt: new Date() } } }),
      prisma.payment.count({ where: { status: "COMPLETED" } }),
      prisma.serialCode.count({ where: { status: "UNUSED" } }),
    ]);

    usersByRole = await (prisma.user.groupBy as Function)({
      by: ["role"],
      where: { deletedAt: null },
      _count: true,
    });

    recentUsers = await prisma.user.findMany({
      where: { deletedAt: null, role: { not: "ADMIN" } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true },
    });
  } catch {
    isDemo = true;
  }

  const roleLabels: Record<string, string> = {
    FREE: "Ücretsiz",
    SUBSCRIBER: "Abonelikli",
    SERIAL_USER: "Seri Numaralı",
    COVER_BUYER: "Kapak",
    ADMIN: "Admin",
  };

  return (
    <div>
      <h1 className="admin-section-title">Dashboard</h1>

      {isDemo && (
        <div style={{ background: "#fef9c3", border: "1px solid #fde047", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1.25rem", color: "#713f12", fontSize: "0.8125rem" }}>
          Veritabanı bağlantısı kurulamadı. Backend servisinin çalıştığından emin olun.
        </div>
      )}

      <div className="admin-stat-grid">
        <div className="admin-stat">
          <div className="admin-stat-label">Toplam Kullanıcı</div>
          <div className="admin-stat-value">{totalUsers}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-label">Aktif Abonelik</div>
          <div className="admin-stat-value">{activeSubscriptions}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-label">Tamamlanan Ödeme</div>
          <div className="admin-stat-value">{totalPayments}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-label">Kullanılmayan Seri</div>
          <div className="admin-stat-value">{unusedSerials}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
        <div className="admin-card">
          <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#64748b", marginBottom: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Rol Dağılımı
          </div>
          {usersByRole.map((r) => (
            <div key={r.role} style={{ display: "flex", justifyContent: "space-between", padding: "0.375rem 0", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: "0.875rem", color: "#374151" }}>{roleLabels[r.role] || r.role}</span>
              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#0f172a" }}>{r._count}</span>
            </div>
          ))}
        </div>

        <div className="admin-card">
          <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#64748b", marginBottom: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Son Kayıt Olan Kullanıcılar
          </div>
          {recentUsers.map((u) => (
            <div key={u.id} style={{ padding: "0.375rem 0", borderBottom: "1px solid #f1f5f9" }}>
              <a href={`/admin/kullanicilar/${u.id}`} style={{ fontSize: "0.875rem", color: "#0f172a", fontWeight: 500 }}>
                {u.firstName} {u.lastName}
              </a>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                {u.email} · {new Date(u.createdAt).toLocaleDateString("tr-TR")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
