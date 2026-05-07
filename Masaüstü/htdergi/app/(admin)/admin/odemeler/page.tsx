import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = { title: "Ödemeler | Admin" };

export default async function OdemelerPage() {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      userId: true,
      amount: true,
      currency: true,
      status: true,
      provider: true,
      createdAt: true,
      verifiedAt: true,
      // providerResponse ve ipAddress hassas — gösterilmez
      user: { select: { email: true, firstName: true, lastName: true } },
    },
  });

  return (
    <div>
      <h1 className="admin-section-title">Ödemeler</h1>

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Kullanıcı</th>
                <th>Tutar</th>
                <th>Sağlayıcı</th>
                <th>Durum</th>
                <th>Tarih</th>
                <th>Doğrulama</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/admin/kullanicilar/${p.userId}`} style={{ color: "#0f172a", fontWeight: 500, fontSize: "0.875rem" }}>
                      {p.user.firstName} {p.user.lastName}
                    </Link>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{p.user.email}</div>
                  </td>
                  <td style={{ fontWeight: 600 }}>₺{Number(p.amount).toLocaleString("tr-TR")} {p.currency}</td>
                  <td style={{ fontSize: "0.8125rem", color: "#64748b" }}>{p.provider}</td>
                  <td>
                    <span className={
                      p.status === "COMPLETED" ? "badge-active" :
                      p.status === "PENDING" ? "badge-free" : "badge-expired"
                    }>
                      {p.status === "COMPLETED" ? "Tamamlandı" : p.status === "PENDING" ? "Beklemede" : p.status === "FAILED" ? "Başarısız" : "İade"}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>
                    {new Date(p.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                    {p.verifiedAt ? new Date(p.verifiedAt).toLocaleDateString("tr-TR") : "—"}
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: "center", color: "#94a3b8", padding: "2rem" }}>Kayıt yok.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
