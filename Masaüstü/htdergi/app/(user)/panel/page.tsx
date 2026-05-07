import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = { title: "Panel | Hatıra Dergi" };

type Props = {
  searchParams: Promise<{ odeme?: string }>;
};

export default async function PanelPage({ searchParams }: Props) {
  const user = await getSessionUser();
  if (!user) return null;

  const params = await searchParams;
  const odeme = params.odeme;

  let subscription = null;
  let coverDraftCount = 0;
  let interviewDraftCount = 0;

  try {
    [subscription, coverDraftCount, interviewDraftCount] = await Promise.all([
      prisma.subscription.findFirst({
        where: { userId: user.id, status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        include: { plan: true },
      }),
      prisma.coverDraft.count({ where: { userId: user.id } }),
      prisma.interviewDraft.count({ where: { userId: user.id } }),
    ]);
  } catch {
    // DB bağlantısı yok, demo değerler kullanılacak
  }

  const roleLabels: Record<string, string> = {
    FREE: "Ücretsiz",
    SUBSCRIBER: "Abonelikli",
    SERIAL_USER: "Seri Numaralı",
    COVER_BUYER: "Kapak Kullanıcısı",
    ADMIN: "Admin",
  };

  return (
    <div>
      {odeme === "hata" && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "0.875rem 1rem", marginBottom: "1.25rem", color: "#991b1b", fontSize: "0.875rem" }}>
          Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin veya destek ekibiyle iletişime geçin.
        </div>
      )}
      {odeme === "basarisiz" && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "0.875rem 1rem", marginBottom: "1.25rem", color: "#991b1b", fontSize: "0.875rem" }}>
          Ödeme tamamlanamadı. Kart bilgilerinizi kontrol edip tekrar deneyebilirsiniz.
        </div>
      )}

      <h1 className="panel-section-title">
        Merhaba, {user.firstName || "Kullanıcı"}
      </h1>

      <div className="panel-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="panel-stat-card">
          <div className="panel-stat-label">Hesap Türü</div>
          <div className="panel-stat-value" style={{ fontSize: "1rem" }}>
            {roleLabels[user.role] || user.role}
          </div>
        </div>

        <div className="panel-stat-card">
          <div className="panel-stat-label">Tasarımlarım</div>
          <div className="panel-stat-value">{coverDraftCount}</div>
        </div>

        <div className="panel-stat-card">
          <div className="panel-stat-label">Röportajlarım</div>
          <div className="panel-stat-value">{interviewDraftCount}</div>
        </div>
      </div>

      {/* Abonelik durumu */}
      <div className="panel-card">
        <div className="panel-card-title">Abonelik Durumu</div>
        {subscription ? (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <span className="badge-active">Aktif</span>
              <span style={{ fontSize: "0.875rem", color: "#374151" }}>
                {subscription.plan?.name || "Seri Numaralı Abonelik"}
              </span>
            </div>
            {subscription.expiresAt && (
              <p style={{ fontSize: "0.8125rem", color: "#6b7280" }}>
                Bitiş: {new Date(subscription.expiresAt).toLocaleDateString("tr-TR")}
              </p>
            )}
          </div>
        ) : (
          <div>
            <span className="badge-free" style={{ marginBottom: "0.75rem", display: "inline-block" }}>
              Abonelik Yok
            </span>
            <p style={{ fontSize: "0.8125rem", color: "#6b7280", marginTop: "0.5rem" }}>
              Kapak tasarlamaya başlamak için{" "}
              <Link href="/abonelik" style={{ color: "#1a1a1a", textDecoration: "underline" }}>
                abonelik alın
              </Link>{" "}
              veya{" "}
              <Link href="/kapak-tasarla" style={{ color: "#1a1a1a", textDecoration: "underline" }}>
                tek kapak satın alın
              </Link>
              .
            </p>
          </div>
        )}
      </div>

      {/* Hızlı bağlantılar */}
      <div className="panel-card">
        <div className="panel-card-title">Hızlı Erişim</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
          <Link href="/kapak-tasarla" style={{ fontSize: "0.875rem", color: "#1a1a1a", textDecoration: "underline" }}>
            Kapak Tasarla →
          </Link>
          <Link href="/panel/tasarimlarim" style={{ fontSize: "0.875rem", color: "#1a1a1a", textDecoration: "underline" }}>
            Tasarımlarım →
          </Link>
          <Link href="/panel/profil" style={{ fontSize: "0.875rem", color: "#1a1a1a", textDecoration: "underline" }}>
            Profili Düzenle →
          </Link>
        </div>
      </div>
    </div>
  );
}
