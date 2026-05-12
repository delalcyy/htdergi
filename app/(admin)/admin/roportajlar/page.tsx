import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = { title: "Röportaj Formları | Admin — Hatıra Dergi" };

export default async function AdminRoportajlarPage() {
  let drafts: {
    id: string;
    status: string;
    createdAt: Date;
    category: { name: string };
    user: { email: string; firstName: string | null; lastName: string | null };
    answers: { id: string }[];
  }[] = [];
  let isDemo = false;

  try {
    drafts = await prisma.interviewDraft.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true } },
        user: { select: { email: true, firstName: true, lastName: true } },
        answers: { select: { id: true } },
      },
    });
  } catch { isDemo = true; }

  const statusLabel: Record<string, string> = {
    DRAFT: "Taslak", COMPLETED: "Tamamlandı", ARCHIVED: "Arşiv",
  };
  const statusClass: Record<string, string> = {
    DRAFT: "ad-badge order-pending",
    COMPLETED: "ad-badge order-confirmed",
    ARCHIVED: "ad-badge order-cancelled",
  };

  return (
    <div>
      <h1 className="admin-section-title">Röportaj Formları</h1>

      {isDemo && (
        <div style={{ background: "rgba(176,141,60,0.06)", border: "1px solid rgba(176,141,60,0.25)",
          padding: "12px 16px", marginBottom: "20px", color: "#8a6d2c", fontSize: "12px" }}>
          Veritabanı bağlantısı kurulamadı.
        </div>
      )}

      <div className="admin-card" style={{ padding: 0 }}>
        {drafts.length === 0 ? (
          <div style={{ padding: "2rem", color: "var(--ad-muted)", fontSize: 14, textAlign: "center" }}>
            Henüz röportaj formu gönderilmemiş.
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Kullanıcı</th>
                <th>Kategori</th>
                <th>Cevap Sayısı</th>
                <th>Durum</th>
                <th>Tarih</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {drafts.map(d => (
                <tr key={d.id}>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>
                      {d.user.firstName} {d.user.lastName}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--ad-muted)" }}>{d.user.email}</div>
                  </td>
                  <td style={{ fontSize: 13 }}>{d.category.name}</td>
                  <td style={{ fontSize: 13 }}>{d.answers.length} / 10</td>
                  <td>
                    <span className={statusClass[d.status] ?? "ad-badge"}>
                      {statusLabel[d.status] ?? d.status}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: "var(--ad-muted)", whiteSpace: "nowrap" }}>
                    {new Date(d.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td>
                    <Link href={`/admin/roportajlar/${d.id}`} className="admin-btn ghost"
                      style={{ fontSize: 11, padding: "4px 10px" }}>
                      Detay →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
