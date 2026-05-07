"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Props = {
  userId: string;
  currentRole: string;
  currentStatus: string;
};

export default function KullaniciDetayActions({ userId, currentRole, currentStatus }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState<"ACTIVE" | "SUSPENDED" | null>(null);

  async function handleStatusChange(newStatus: "ACTIVE" | "SUSPENDED") {
    if (!confirm) {
      setConfirm(newStatus);
      return;
    }
    setError("");
    setIsLoading(true);
    const res = await fetch(`/api/admin/kullanicilar/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    const json = await res.json();
    setIsLoading(false);
    setConfirm(null);
    if (json.success) {
      router.refresh();
    } else {
      setError(json.error || "Hata oluştu.");
    }
  }

  return (
    <div>
      {error && (
        <div style={{ fontSize: "0.8125rem", color: "#dc2626", marginBottom: "0.5rem" }}>
          {error}
        </div>
      )}

      {confirm && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            padding: "0.75rem",
            marginBottom: "0.75rem",
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
      )}

      {!confirm && (
        <div style={{ display: "flex", gap: "0.625rem" }}>
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
