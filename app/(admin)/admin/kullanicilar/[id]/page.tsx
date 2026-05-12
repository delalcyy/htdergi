import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import KullaniciDetayActions from "@/components/admin/KullaniciDetayActions";

export const metadata = { title: "Kullanıcı Detayı | Admin" };

type Props = {
  params: Promise<{ id: string }>;
};

export default async function KullaniciDetayPage({ params }: Props) {
  const { id } = await params;
  const admin = await getSessionUser();

  const user = await prisma.user.findUnique({
    where: { id, deletedAt: null },
    include: {
      subscriptions: { include: { plan: true }, orderBy: { createdAt: "desc" } },
      payments: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, amount: true, currency: true, status: true, createdAt: true },
        // providerResponse hariç
      },
      coverDrafts: { orderBy: { updatedAt: "desc" }, take: 5 },
      addresses: { where: { isPrimary: true }, take: 1 },
    },
  });

  if (!user) notFound();

  // Audit log: admin bu kullanıcıyı görüntüledi
  if (admin) {
    await writeAuditLog({
      actorId: admin.id,
      action: "admin_viewed_user",
      targetId: user.id,
      targetType: "User",
    });
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 className="admin-section-title" style={{ marginBottom: "0.25rem" }}>
            {user.firstName} {user.lastName}
          </h1>
          <div style={{ fontSize: "0.875rem", color: "#64748b" }}>{user.email}</div>
        </div>
        {admin && <KullaniciDetayActions userId={user.id} currentRole={user.role} currentStatus={user.status} emailVerified={user.emailVerified} />}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
        {/* Kişisel Bilgiler */}
        <div className="admin-card">
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b", marginBottom: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Kişisel Bilgiler
          </div>
          <div style={{ fontSize: "0.875rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div><strong>Ad Soyad:</strong> {user.firstName} {user.lastName}</div>
            <div><strong>E-posta:</strong> {user.email}</div>
            <div><strong>Telefon:</strong> {user.phone || "—"}</div>
            <div><strong>Yaş:</strong> {user.age ?? "—"}</div>
            <div><strong>İl / İlçe:</strong> {user.city ? `${user.city} / ${user.district ?? "—"}` : "—"}</div>
            <div><strong>Tuttuğu Takım:</strong> {user.supportedTeam || "—"}</div>
          </div>
        </div>

        {/* Hesap Bilgileri */}
        <div className="admin-card">
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b", marginBottom: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Hesap Bilgileri
          </div>
          <div style={{ fontSize: "0.875rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div><strong>Rol:</strong> {roleLabels[user.role]}</div>
            <div><strong>Durum:</strong> {user.status}</div>
            <div><strong>E-posta Doğrulandı:</strong> {user.emailVerified ? "Evet" : "Hayır"}</div>
            <div><strong>Kayıt Tarihi:</strong> {new Date(user.createdAt).toLocaleDateString("tr-TR")}</div>
          </div>
        </div>
      </div>

      {/* Abonelikler */}
      <div className="admin-card" style={{ marginBottom: "1rem" }}>
        <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b", marginBottom: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Abonelikler ({user.subscriptions.length})
        </div>
        {user.subscriptions.length === 0 ? (
          <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>Abonelik yok</p>
        ) : (
          user.subscriptions.map((s) => (
            <div key={s.id} style={{ padding: "0.5rem 0", borderBottom: "1px solid #f1f5f9", fontSize: "0.875rem" }}>
              <span style={{ fontWeight: 500, color: "#0f172a" }}>{s.plan?.name || s.type}</span>
              {" · "}
              <span className={s.status === "ACTIVE" ? "badge-active" : "badge-expired"}>
                {s.status}
              </span>
              {s.expiresAt && <span style={{ color: "#94a3b8", marginLeft: "0.5rem" }}>{new Date(s.expiresAt).toLocaleDateString("tr-TR")}</span>}
            </div>
          ))
        )}
      </div>

      {/* Son Ödemeler */}
      <div className="admin-card" style={{ marginBottom: "1rem" }}>
        <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b", marginBottom: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Son Ödemeler
        </div>
        {user.payments.length === 0 ? (
          <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>Ödeme yok</p>
        ) : (
          user.payments.map((p) => (
            <div key={p.id} style={{ padding: "0.5rem 0", borderBottom: "1px solid #f1f5f9", fontSize: "0.875rem", display: "flex", justifyContent: "space-between" }}>
              <span>₺{Number(p.amount).toLocaleString("tr-TR")} — {new Date(p.createdAt).toLocaleDateString("tr-TR")}</span>
              <span className={p.status === "COMPLETED" ? "badge-active" : "badge-expired"}>{p.status}</span>
            </div>
          ))
        )}
      </div>

      {/* Kapak Tasarımları */}
      <div className="admin-card">
        <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b", marginBottom: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Son Tasarımlar ({user.coverDrafts.length})
        </div>
        {user.coverDrafts.length === 0 ? (
          <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>Tasarım yok</p>
        ) : (
          user.coverDrafts.map((d) => (
            <div key={d.id} style={{ padding: "0.375rem 0", borderBottom: "1px solid #f1f5f9", fontSize: "0.875rem" }}>
              <span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#94a3b8" }}>{d.coverSerial}</span>
              {" · "}
              <span>{d.title || "İsimsiz"}</span>
              {" · "}
              <span style={{ color: "#64748b" }}>{d.status}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
