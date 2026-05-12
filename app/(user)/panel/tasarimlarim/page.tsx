import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = { title: "Tasarımlarım | Hatıra Dergi" };

export default async function TasarimlarimPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const drafts = await prisma.coverDraft.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { template: true },
  });

  return (
    <div>
      <h1 className="panel-section-title">Tasarımlarım</h1>

      {drafts.length === 0 ? (
        <div className="panel-card">
          <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
            Henüz tasarımınız yok.{" "}
            <Link href="/kapak-tasarla" style={{ color: "#1a1a1a", textDecoration: "underline" }}>
              İlk kapağınızı oluşturun
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="panel-grid">
          {drafts.map((draft) => (
            <Link
              key={draft.id}
              href={`/kapak-tasarla/editor/${draft.id}`}
              style={{ textDecoration: "none" }}
            >
              <div
                className="panel-card"
                style={{ cursor: "pointer", transition: "box-shadow 0.15s" }}
              >
                <div style={{ fontWeight: 600, color: "#1a1a1a", marginBottom: "0.25rem", fontSize: "0.9375rem" }}>
                  {draft.title || "İsimsiz Tasarım"}
                </div>
                <div style={{ fontSize: "0.8125rem", color: "#6b7280", marginBottom: "0.5rem" }}>
                  {draft.template.name}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                  Seri: {draft.coverSerial}
                </div>
                <div style={{ marginTop: "0.75rem" }}>
                  <span className={draft.status === "COMPLETED" ? "badge-active" : "badge-free"}>
                    {draft.status === "DRAFT" ? "Taslak" : draft.status === "COMPLETED" ? "Tamamlandı" : "Dışa Aktarıldı"}
                  </span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.5rem" }}>
                  {new Date(draft.updatedAt).toLocaleDateString("tr-TR")}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
