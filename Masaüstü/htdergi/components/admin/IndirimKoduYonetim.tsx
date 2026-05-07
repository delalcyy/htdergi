"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DiscountCode } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CodeWithCount = DiscountCode & { _count: { usages: number } };
type Plan = { id: string; name: string };

type Props = {
  codes: CodeWithCount[];
  plans: Plan[];
};

export default function IndirimKoduYonetim({ codes, plans }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: "",
    discountType: "PERCENT",
    discountValue: "",
    validFor: "ALL",
    maxUsage: "",
    validUntil: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleCreate() {
    setError("");
    if (!form.code.trim() || !form.discountValue) { setError("Tüm zorunlu alanları doldurun."); return; }
    setIsSubmitting(true);
    const res = await fetch("/api/admin/indirim-kodlari", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code.trim().toUpperCase(),
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        validFor: form.validFor,
        maxUsage: form.maxUsage ? parseInt(form.maxUsage) : null,
        validUntil: form.validUntil ? new Date(form.validUntil).toISOString() : null,
      }),
    });
    const json = await res.json();
    if (json.success) {
      setShowForm(false);
      setForm({ code: "", discountType: "PERCENT", discountValue: "", validFor: "ALL", maxUsage: "", validUntil: "" });
      router.refresh();
    } else {
      setError(json.error || "Hata.");
    }
    setIsSubmitting(false);
  }

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/admin/indirim-kodlari/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    router.refresh();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.25rem" }}>
        <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"}>
          {showForm ? "İptal" : "+ Yeni Kod"}
        </Button>
      </div>

      {showForm && (
        <div className="admin-card" style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem", maxWidth: "560px" }}>
            <div>
              <Label>Kod</Label>
              <Input name="code" value={form.code} onChange={handleChange} placeholder="YENI20" style={{ marginTop: "0.25rem", textTransform: "uppercase" }} />
            </div>
            <div>
              <Label>İndirim Tipi</Label>
              <select name="discountType" value={form.discountType} onChange={handleChange}
                style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                <option value="PERCENT">Yüzde (%)</option>
                <option value="FIXED">Sabit (₺)</option>
              </select>
            </div>
            <div>
              <Label>İndirim Değeri</Label>
              <Input name="discountValue" type="number" value={form.discountValue} onChange={handleChange} style={{ marginTop: "0.25rem" }} />
            </div>
            <div>
              <Label>Geçerli Olduğu Alan</Label>
              <select name="validFor" value={form.validFor} onChange={handleChange}
                style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                <option value="ALL">Tümü</option>
                <option value="SUBSCRIPTION">Sadece Abonelik</option>
                <option value="COVER_ONLY">Sadece Kapak</option>
              </select>
            </div>
            <div>
              <Label>Max Kullanım (opsiyonel)</Label>
              <Input name="maxUsage" type="number" value={form.maxUsage} onChange={handleChange} style={{ marginTop: "0.25rem" }} />
            </div>
            <div>
              <Label>Bitiş Tarihi (opsiyonel)</Label>
              <Input name="validUntil" type="date" value={form.validUntil} onChange={handleChange} style={{ marginTop: "0.25rem" }} />
            </div>
          </div>
          {error && <p style={{ fontSize: "0.8125rem", color: "#dc2626", marginTop: "0.75rem" }}>{error}</p>}
          <Button onClick={handleCreate} disabled={isSubmitting} style={{ marginTop: "1rem" }}>
            {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Kod</th>
                <th>İndirim</th>
                <th>Kapsam</th>
                <th>Kullanım</th>
                <th>Bitiş</th>
                <th>Durum</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontFamily: "monospace", fontWeight: 600 }}>{c.code}</td>
                  <td>
                    {c.discountType === "PERCENT"
                      ? `%${Number(c.discountValue)}`
                      : `₺${Number(c.discountValue)}`}
                  </td>
                  <td style={{ fontSize: "0.8125rem", color: "#64748b" }}>{c.validFor}</td>
                  <td style={{ fontSize: "0.8125rem" }}>
                    {c._count.usages}{c.maxUsage ? `/${c.maxUsage}` : ""}
                  </td>
                  <td style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>
                    {c.validUntil ? new Date(c.validUntil).toLocaleDateString("tr-TR") : "—"}
                  </td>
                  <td>
                    <span className={c.isActive ? "badge-active" : "badge-expired"}>
                      {c.isActive ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => toggleActive(c.id, c.isActive)}
                      style={{ fontSize: "0.8125rem", color: "#64748b", textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}
                    >
                      {c.isActive ? "Pasif Yap" : "Aktif Et"}
                    </button>
                  </td>
                </tr>
              ))}
              {codes.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: "center", color: "#94a3b8", padding: "2rem" }}>Kod yok.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
