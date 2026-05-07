"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Code = {
  id: string;
  code: string;
  status: string;
  durationDays: number;
  batchLabel: string | null;
  createdAt: Date;
  usedAt: Date | null;
  usedIp: string | null;
  usedByUser: { email: string; firstName: string | null; lastName: string | null } | null;
  createdBy: { email: string };
};

type Props = {
  codes: Code[];
  currentFilter: string;
};

export default function SeriNumarasiYonetim({ codes, currentFilter }: Props) {
  const router = useRouter();
  const [count, setCount] = useState("10");
  const [batchLabel, setBatchLabel] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  const filters = [
    { key: "ALL", label: "Tümü" },
    { key: "UNUSED", label: "Kullanılmamış" },
    { key: "USED", label: "Kullanılmış" },
    { key: "CANCELLED", label: "İptal" },
  ];

  async function handleCreate() {
    setCreateError("");
    setCreateSuccess("");
    const n = parseInt(count, 10);
    if (!batchLabel.trim()) { setCreateError("Batch etiketi zorunludur."); return; }
    if (isNaN(n) || n < 1 || n > 500) { setCreateError("1-500 arası bir sayı girin."); return; }

    setIsCreating(true);
    const res = await fetch("/api/admin/seri-numaralari", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count: n, batchLabel: batchLabel.trim(), durationDays: 365 }),
    });
    const json = await res.json();
    if (json.success) {
      setCreateSuccess(`${n} adet seri numarası oluşturuldu.`);
      setBatchLabel("");
      setCount("10");
      router.refresh();
    } else {
      setCreateError(json.error || "Hata oluştu.");
    }
    setIsCreating(false);
  }

  return (
    <div>
      {/* Toplu oluşturma */}
      <div className="admin-card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#64748b", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Toplu Seri Numarası Oluştur
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <Label htmlFor="batchLabel" style={{ fontSize: "0.8125rem" }}>Batch Etiketi</Label>
            <Input
              id="batchLabel"
              value={batchLabel}
              onChange={(e) => setBatchLabel(e.target.value)}
              placeholder="Örn: Fuar-2025"
              style={{ width: "200px", marginTop: "0.25rem" }}
            />
          </div>
          <div>
            <Label htmlFor="count" style={{ fontSize: "0.8125rem" }}>Adet</Label>
            <Input
              id="count"
              type="number"
              min="1"
              max="500"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              style={{ width: "100px", marginTop: "0.25rem" }}
            />
          </div>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? "Oluşturuluyor..." : "Oluştur"}
          </Button>
        </div>
        {createError && <p style={{ fontSize: "0.8125rem", color: "#dc2626", marginTop: "0.5rem" }}>{createError}</p>}
        {createSuccess && <p style={{ fontSize: "0.8125rem", color: "#059669", marginTop: "0.5rem" }}>{createSuccess}</p>}
      </div>

      {/* Filtreler */}
      <div className="admin-filters">
        {filters.map((f) => (
          <Link
            key={f.key}
            href={`/admin/seri-numaralari?durum=${f.key}`}
            className={`admin-filter-btn ${currentFilter === f.key ? "active" : ""}`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Kod</th>
                <th>Batch</th>
                <th>Durum</th>
                <th>Kullanan</th>
                <th>Kullanım Tarihi</th>
                <th>Oluşturan</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontFamily: "monospace", fontSize: "0.8125rem" }}>{c.code}</td>
                  <td style={{ color: "#64748b" }}>{c.batchLabel || "—"}</td>
                  <td>
                    <span
                      className={
                        c.status === "UNUSED" ? "badge-free" :
                        c.status === "USED" ? "badge-active" : "badge-expired"
                      }
                    >
                      {c.status === "UNUSED" ? "Kullanılmamış" : c.status === "USED" ? "Kullanılmış" : "İptal"}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.8125rem" }}>
                    {c.usedByUser ? `${c.usedByUser.firstName} ${c.usedByUser.lastName} (${c.usedByUser.email})` : "—"}
                  </td>
                  <td style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>
                    {c.usedAt ? new Date(c.usedAt).toLocaleDateString("tr-TR") : "—"}
                  </td>
                  <td style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{c.createdBy.email}</td>
                </tr>
              ))}
              {codes.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "#94a3b8", padding: "2rem" }}>Kayıt yok.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
