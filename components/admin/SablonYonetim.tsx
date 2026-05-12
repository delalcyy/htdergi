"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { CoverTemplate } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  templates: CoverTemplate[];
};

export default function SablonYonetim({ templates }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [orderIndex, setOrderIndex] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    setError("");
    if (!name.trim() || !previewUrl.trim()) { setError("Ad ve önizleme URL'si zorunludur."); return; }

    setIsSubmitting(true);
    const res = await fetch("/api/admin/sablonlar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), previewUrl: previewUrl.trim(), orderIndex: parseInt(orderIndex) }),
    });
    const json = await res.json();
    if (json.success) {
      setShowForm(false);
      setName(""); setPreviewUrl(""); setOrderIndex("0");
      router.refresh();
    } else {
      setError(json.error || "Hata oluştu.");
    }
    setIsSubmitting(false);
  }

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/admin/sablonlar/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    router.refresh();
  }

  return (
    <div>
      <div style={{ marginBottom: "1.25rem", display: "flex", justifyContent: "flex-end" }}>
        <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"}>
          {showForm ? "İptal" : "+ Yeni Şablon"}
        </Button>
      </div>

      {showForm && (
        <div className="admin-card" style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", maxWidth: "480px" }}>
            <div>
              <Label>Şablon Adı</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Klasik, Modern..." style={{ marginTop: "0.25rem" }} />
            </div>
            <div>
              <Label>Önizleme Görseli URL</Label>
              <Input value={previewUrl} onChange={(e) => setPreviewUrl(e.target.value)} placeholder="https://..." style={{ marginTop: "0.25rem" }} />
            </div>
            <div>
              <Label>Sıra</Label>
              <Input type="number" value={orderIndex} onChange={(e) => setOrderIndex(e.target.value)} style={{ width: "100px", marginTop: "0.25rem" }} />
            </div>
            {error && <p style={{ fontSize: "0.8125rem", color: "#dc2626" }}>{error}</p>}
            <Button onClick={handleCreate} disabled={isSubmitting} style={{ alignSelf: "flex-start" }}>
              {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Önizleme</th>
                <th>Ad</th>
                <th>Sıra</th>
                <th>Durum</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => (
                <tr key={t.id}>
                  <td>
                    <div style={{ width: "48px", height: "64px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
                      {t.previewUrl && (
                        <Image src={t.previewUrl} alt={t.name} width={48} height={64} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                      )}
                    </div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{t.name}</td>
                  <td>{t.orderIndex}</td>
                  <td>
                    <span className={t.isActive ? "badge-active" : "badge-expired"}>
                      {t.isActive ? "Aktif" : "Devre Dışı"}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => toggleActive(t.id, t.isActive)}
                      style={{ fontSize: "0.8125rem", color: "#374151", textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}
                    >
                      {t.isActive ? "Devre Dışı Bırak" : "Aktif Et"}
                    </button>
                  </td>
                </tr>
              ))}
              {templates.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: "center", color: "#94a3b8", padding: "2rem" }}>Şablon yok.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
