import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export const metadata = { title: "Röportaj Detay | Admin — Hatıra Dergi" };

type Props = { params: Promise<{ id: string }> };

export default async function AdminRoportajDetayPage({ params }: Props) {
  const { id } = await params;

  const draft = await prisma.interviewDraft.findUnique({
    where: { id },
    include: {
      category: {
        include: {
          questions: { where: { isActive: true }, orderBy: { orderIndex: "asc" } },
        },
      },
      user: { select: { email: true, firstName: true, lastName: true } },
      answers: true,
    },
  }).catch(() => null);

  if (!draft) notFound();

  const answerMap = Object.fromEntries(draft.answers.map(a => [a.questionId, a.answerText]));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href="/admin/roportajlar" className="admin-btn ghost" style={{ fontSize: 11 }}>← Geri</Link>
        <h1 className="admin-section-title" style={{ margin: 0 }}>Röportaj Detayı</h1>
        <a href={`/api/admin/roportaj/${id}/yazdir`} target="_blank"
          className="admin-btn ghost" style={{ fontSize: 11, marginLeft: "auto" }}>
          🖨 PDF Yazdır
        </a>
      </div>

      {/* Üst bilgi */}
      <div className="admin-card" style={{ marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--ad-muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Kullanıcı</div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{draft.user.firstName} {draft.user.lastName}</div>
            <div style={{ fontSize: 12, color: "var(--ad-muted)" }}>{draft.user.email}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--ad-muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Kategori</div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{draft.category.name}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--ad-muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Durum</div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{draft.status}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--ad-muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Tarih</div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>
              {new Date(draft.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--ad-muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Cevap</div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{draft.answers.length} / {draft.category.questions.length}</div>
          </div>
        </div>
      </div>

      {/* Sorular ve cevaplar */}
      <div className="admin-card" style={{ padding: 0 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--ad-border)", fontWeight: 600, fontSize: 13 }}>
          Sorular & Cevaplar
        </div>
        <div style={{ padding: "8px 0" }}>
          {draft.category.questions.map((q, idx) => {
            const answer = answerMap[q.id];
            return (
              <div key={q.id} style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--ad-border)",
              }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#a98947", flexShrink: 0, marginTop: 1 }}>
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{q.body}</div>
                </div>
                {answer ? (
                  <div style={{
                    marginLeft: 26, fontSize: 13, color: "#1a1a1a",
                    background: "#f9f7f4", padding: "10px 12px", borderRadius: 2,
                    lineHeight: 1.6, whiteSpace: "pre-wrap",
                  }}>
                    {answer}
                  </div>
                ) : (
                  <div style={{ marginLeft: 26, fontSize: 12, color: "var(--ad-muted)", fontStyle: "italic" }}>
                    Cevaplanmadı
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
