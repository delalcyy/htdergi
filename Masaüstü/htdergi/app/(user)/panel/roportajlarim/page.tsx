import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = { title: "Röportajlarım | Hatıra Dergi" };

export default async function RoportajlarimPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const interviews = await prisma.interviewDraft.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { category: true },
  });

  return (
    <div>
      <h1 className="panel-section-title">Röportajlarım</h1>

      {interviews.length === 0 ? (
        <div className="panel-card">
          <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
            Henüz röportajınız yok. Kapak tasarlarken röportaj oluşturabilirsiniz.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {interviews.map((interview) => (
            <Link
              key={interview.id}
              href={`/kapak-tasarla/roportaj/${interview.id}`}
              style={{ textDecoration: "none" }}
            >
              <div className="panel-card" style={{ cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div>
                    <div style={{ fontWeight: 600, color: "#1a1a1a", marginBottom: "0.25rem" }}>
                      {interview.category.name}
                    </div>
                    <div style={{ fontSize: "0.8125rem", color: "#9ca3af" }}>
                      {new Date(interview.updatedAt).toLocaleDateString("tr-TR")}
                    </div>
                  </div>
                  <span className={interview.status === "COMPLETED" ? "badge-active" : "badge-free"}>
                    {interview.status === "DRAFT" ? "Taslak" : "Tamamlandı"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
