"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { InterviewCategory, InterviewQuestion } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type FullCategory = InterviewCategory & { questions: InterviewQuestion[] };

type Props = { categories: FullCategory[] };

export default function RoportajKategoriYonetim({ categories }: Props) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newQuestion, setNewQuestion] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function createCategory() {
    if (!newCatName.trim()) return;
    setIsSaving(true);
    const res = await fetch("/api/admin/roportaj/kategoriler", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCatName.trim(), description: newCatDesc.trim() || null }),
    });
    const json = await res.json();
    if (json.success) { setNewCatName(""); setNewCatDesc(""); router.refresh(); }
    else setError(json.error || "Hata.");
    setIsSaving(false);
  }

  async function addQuestion(categoryId: string) {
    const body = newQuestion[categoryId];
    if (!body?.trim()) return;
    const res = await fetch("/api/admin/roportaj/sorular", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId, body: body.trim() }),
    });
    const json = await res.json();
    if (json.success) {
      setNewQuestion((p) => ({ ...p, [categoryId]: "" }));
      router.refresh();
    }
  }

  async function toggleCategory(id: string, isActive: boolean) {
    await fetch(`/api/admin/roportaj/kategoriler/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    router.refresh();
  }

  return (
    <div>
      {/* Yeni kategori */}
      <div className="admin-card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#64748b", marginBottom: "0.875rem", textTransform: "uppercase" }}>
          Yeni Kategori
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: "440px" }}>
          <div><Label>Kategori Adı</Label><Input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} style={{ marginTop: "0.25rem" }} /></div>
          <div><Label>Açıklama</Label><Input value={newCatDesc} onChange={(e) => setNewCatDesc(e.target.value)} style={{ marginTop: "0.25rem" }} /></div>
          {error && <p style={{ fontSize: "0.8125rem", color: "#dc2626" }}>{error}</p>}
          <Button onClick={createCategory} disabled={isSaving} style={{ alignSelf: "flex-start" }}>Ekle</Button>
        </div>
      </div>

      {/* Kategoriler */}
      {categories.map((cat) => (
        <div key={cat.id} className="admin-card" style={{ marginBottom: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <div>
              <span style={{ fontWeight: 600, color: "#0f172a" }}>{cat.name}</span>
              <span className={cat.isActive ? "badge-active" : "badge-expired"} style={{ marginLeft: "0.75rem" }}>
                {cat.isActive ? "Aktif" : "Pasif"}
              </span>
              <span style={{ fontSize: "0.75rem", color: "#94a3b8", marginLeft: "0.75rem" }}>
                {cat.questions.length} soru
              </span>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => toggleCategory(cat.id, cat.isActive)}
                style={{ fontSize: "0.8125rem", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                {cat.isActive ? "Pasif Yap" : "Aktif Et"}
              </button>
              <button
                onClick={() => setExpanded(expanded === cat.id ? null : cat.id)}
                style={{ fontSize: "0.8125rem", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", color: "#0f172a" }}
              >
                {expanded === cat.id ? "Kapat" : "Soruları Düzenle"}
              </button>
            </div>
          </div>

          {expanded === cat.id && (
            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "1rem", marginTop: "0.5rem" }}>
              {cat.questions.map((q, i) => (
                <div key={q.id} style={{ padding: "0.5rem 0", borderBottom: "1px solid #f1f5f9", fontSize: "0.875rem", color: "#374151" }}>
                  <strong style={{ color: "#94a3b8", marginRight: "0.5rem" }}>{i + 1}.</strong>
                  {q.body}
                </div>
              ))}
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                <Input
                  value={newQuestion[cat.id] || ""}
                  onChange={(e) => setNewQuestion((p) => ({ ...p, [cat.id]: e.target.value }))}
                  placeholder="Yeni soru..."
                  style={{ flex: 1 }}
                />
                <Button onClick={() => addQuestion(cat.id)} size="sm">Ekle</Button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
