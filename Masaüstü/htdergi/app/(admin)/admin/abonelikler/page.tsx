import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = { title: "Abonelikler | Admin" };

type Props = {
  searchParams: Promise<{ tur?: string }>;
};

export default async function AboneliklerPage({ searchParams }: Props) {
  const params = await searchParams;
  const tur = params.tur || "ALL";

  const where = tur !== "ALL" ? { type: tur as "NORMAL" | "SERIAL" | "COVER_ONLY" } : {};

  const subscriptions = await prisma.subscription.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { email: true, firstName: true, lastName: true } },
      plan: true,
    },
  });

  const filters = [
    { key: "ALL", label: "Tümü" },
    { key: "NORMAL", label: "Normal" },
    { key: "SERIAL", label: "Seri Numaralı" },
    { key: "COVER_ONLY", label: "Kapak" },
  ];

  return (
    <div>
      <h1 className="admin-section-title">Abonelikler</h1>

      <div className="admin-filters">
        {filters.map((f) => (
          <Link key={f.key} href={`/admin/abonelikler?tur=${f.key}`} className={`admin-filter-btn ${tur === f.key ? "active" : ""}`}>
            {f.label}
          </Link>
        ))}
      </div>

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Kullanıcı</th>
                <th>Plan</th>
                <th>Tür</th>
                <th>Durum</th>
                <th>Başlangıç</th>
                <th>Bitiş</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((s) => (
                <tr key={s.id}>
                  <td>
                    <Link href={`/admin/kullanicilar/${s.userId}`} style={{ color: "#0f172a", fontWeight: 500, fontSize: "0.875rem" }}>
                      {s.user.firstName} {s.user.lastName}
                    </Link>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{s.user.email}</div>
                  </td>
                  <td style={{ fontSize: "0.875rem" }}>{s.plan?.name || "—"}</td>
                  <td style={{ fontSize: "0.8125rem", color: "#64748b" }}>
                    {s.type === "NORMAL" ? "Normal" : s.type === "SERIAL" ? "Seri" : "Kapak"}
                  </td>
                  <td>
                    <span className={s.status === "ACTIVE" ? "badge-active" : "badge-expired"}>
                      {s.status}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>
                    {s.startedAt ? new Date(s.startedAt).toLocaleDateString("tr-TR") : "—"}
                  </td>
                  <td style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>
                    {s.expiresAt ? new Date(s.expiresAt).toLocaleDateString("tr-TR") : "—"}
                  </td>
                </tr>
              ))}
              {subscriptions.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: "center", color: "#94a3b8", padding: "2rem" }}>Kayıt yok.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
