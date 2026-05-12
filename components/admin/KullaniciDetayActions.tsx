"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Props = {
  userId: string;
  currentRole: string;
  currentStatus: string;
  emailVerified?: boolean;
};

const ROLES = [
  { value: "FREE",        label: "Ücretsiz" },
  { value: "SUBSCRIBER",  label: "Abonelikli" },
  { value: "SERIAL_USER", label: "Seri Numaralı" },
  { value: "COVER_BUYER", label: "Kapak" },
];

export default function KullaniciDetayActions({ userId, currentRole, currentStatus, emailVerified = false }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState<"ACTIVE" | "SUSPENDED" | null>(null);
  const [selectedRole, setSelectedRole] = useState(currentRole);

  async function patch(body: Record<string, unknown>) {
    setError("");
    setIsLoading(true);
    const res = await fetch(`/api/admin/kullanicilar/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    setIsLoading(false);
    if (json.success) {
      router.refresh();
    } else {
      setError(json.error || "Hata oluştu.");
    }
  }

  async function handleStatusChange(newStatus: "ACTIVE" | "SUSPENDED") {
    if (!confirm) { setConfirm(newStatus); return; }
    setConfirm(null);
    await patch({ status: newStatus });
  }

  async function handleRoleChange() {
    if (selectedRole === currentRole) return;
    await patch({ role: selectedRole });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {error && (
        <div style={{ fontSize: "0.8125rem", color: "#dc2626" }}>{error}</div>
      )}

      {/* Rol değiştirme */}
      {currentRole !== "ADMIN" && (
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            disabled={isLoading}
            style={{
              fontSize: "0.8125rem",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              padding: "6px 10px",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRoleChange}
            disabled={isLoading || selectedRole === currentRole}
          >
            Rolü Güncelle
          </Button>
        </div>
      )}

      {/* Durum + email doğrulama butonları */}
      {confirm ? (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            padding: "0.75rem",
            fontSize: "0.875rem",
            color: "#991b1b",
          }}
        >
          {confirm === "SUSPENDED" ? "Kullanıcıyı askıya almak istediğinize emin misiniz?" : "Kullanıcıyı aktif yapmak istediğinize emin misiniz?"}
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.625rem" }}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange(confirm)}
              disabled={isLoading}
              style={{ borderColor: "#fca5a5", color: "#dc2626" }}
            >
              {isLoading ? "İşleniyor..." : "Evet, Devam Et"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setConfirm(null)} disabled={isLoading}>
              İptal
            </Button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap" }}>
          {!emailVerified && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => patch({ emailVerified: true })}
              disabled={isLoading}
              style={{ borderColor: "#16a34a", color: "#16a34a" }}
            >
              E-posta Doğrula
            </Button>
          )}
          {currentStatus === "ACTIVE" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirm("SUSPENDED")}
              style={{ borderColor: "#fca5a5", color: "#dc2626" }}
            >
              Askıya Al
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirm("ACTIVE")}
            >
              Aktif Yap
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
