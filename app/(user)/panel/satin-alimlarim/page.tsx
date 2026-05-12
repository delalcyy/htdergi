import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Satın Alımlarım | Hatıra Dergi" };

export default async function SatinAlimlarimPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const payments = await prisma.payment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      amount: true,
      currency: true,
      status: true,
      provider: true,
      createdAt: true,
      verifiedAt: true,
      // providerResponse hariç tutulur — hassas alan
    },
  });

  return (
    <div>
      <h1 className="panel-section-title">Satın Alımlarım</h1>

      {payments.length === 0 ? (
        <div className="panel-card">
          <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>Henüz satın alım işleminiz bulunmuyor.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {payments.map((p) => (
            <div key={p.id} className="panel-card">
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <div style={{ fontWeight: 600, color: "#1a1a1a" }}>
                    {Number(p.amount).toLocaleString("tr-TR")} {p.currency}
                  </div>
                  <div style={{ fontSize: "0.8125rem", color: "#6b7280", marginTop: "0.25rem" }}>
                    {new Date(p.createdAt).toLocaleDateString("tr-TR")}
                  </div>
                </div>
                <span
                  className={
                    p.status === "COMPLETED"
                      ? "badge-active"
                      : p.status === "PENDING"
                      ? "badge-free"
                      : "badge-expired"
                  }
                >
                  {p.status === "COMPLETED" ? "Tamamlandı" : p.status === "PENDING" ? "Beklemede" : p.status === "FAILED" ? "Başarısız" : "İade"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
