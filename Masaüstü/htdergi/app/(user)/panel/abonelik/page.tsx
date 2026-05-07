import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = { title: "Aboneliğim | Hatıra Dergi" };

export default async function AbonelikPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const subscriptions = await prisma.subscription.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { plan: true },
  });

  return (
    <div>
      <h1 className="panel-section-title">Aboneliğim</h1>

      {subscriptions.length === 0 ? (
        <div className="panel-card">
          <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
            Henüz aboneliğiniz bulunmuyor.{" "}
            <Link href="/abonelik" style={{ color: "#1a1a1a", textDecoration: "underline" }}>
              Abonelik paketlerine göz atın
            </Link>
            .
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {subscriptions.map((sub) => (
            <div key={sub.id} className="panel-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <div style={{ fontWeight: 600, color: "#1a1a1a", marginBottom: "0.25rem" }}>
                    {sub.plan?.name || (sub.type === "SERIAL" ? "Seri Numaralı Abonelik" : "Kapak Erişimi")}
                  </div>
                  <div style={{ fontSize: "0.8125rem", color: "#6b7280" }}>
                    Tür: {sub.type === "NORMAL" ? "Normal Abonelik" : sub.type === "SERIAL" ? "Seri Numaralı" : "Kapak Satın Alımı"}
                  </div>
                </div>
                <span className={sub.status === "ACTIVE" ? "badge-active" : "badge-expired"}>
                  {sub.status === "ACTIVE" ? "Aktif" : sub.status === "EXPIRED" ? "Süresi Doldu" : "İptal"}
                </span>
              </div>

              <div style={{ marginTop: "0.75rem", fontSize: "0.8125rem", color: "#6b7280", display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                {sub.startedAt && (
                  <span>Başlangıç: {new Date(sub.startedAt).toLocaleDateString("tr-TR")}</span>
                )}
                {sub.expiresAt && (
                  <span>Bitiş: {new Date(sub.expiresAt).toLocaleDateString("tr-TR")}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
