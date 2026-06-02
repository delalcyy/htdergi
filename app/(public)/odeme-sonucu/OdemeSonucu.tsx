"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function OdemeSonucu() {
  const searchParams = useSearchParams();
  const durum = searchParams.get("durum");
  const tip = searchParams.get("tip");

  if (durum === "basarili") {
    const abonelik = tip === "subscription";
    return (
      <div style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}>
        <div style={{
          maxWidth: "460px",
          width: "100%",
          textAlign: "center",
          padding: "2.5rem",
          border: "1px solid #d1fae5",
          borderRadius: "12px",
          background: "#f0fdf4",
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✓</div>
          <h1 style={{ fontSize: "1.375rem", fontWeight: 700, color: "#065f46", marginBottom: "0.75rem" }}>
            Ödemeniz Başarıyla Alındı!
          </h1>
          <p style={{ color: "#374151", fontSize: "0.9375rem", lineHeight: 1.6, marginBottom: "2rem" }}>
            {abonelik
              ? "Aboneliğiniz aktif edildi. Artık kapak tasarımına başlayabilirsiniz."
              : "Kapak tasarım hakkınız tanımlandı. Hemen tasarlamaya başlayabilirsiniz."}
          </p>
          <Link
            href="/kapak-tasarla/editor"
            style={{
              display: "inline-block",
              padding: "0.75rem 2rem",
              background: "#1a1a1a",
              color: "#fff",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "0.9375rem",
              fontWeight: 600,
            }}
          >
            Kapak Tasarlamaya Başla
          </Link>
        </div>
      </div>
    );
  }

  const basarisiz = durum === "basarisiz";

  return (
    <div style={{
      minHeight: "60vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
    }}>
      <div style={{
        maxWidth: "460px",
        width: "100%",
        textAlign: "center",
        padding: "2.5rem",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        background: "#fff",
      }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
          {basarisiz ? "✗" : "⚠"}
        </div>
        <h1 style={{ fontSize: "1.375rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.75rem" }}>
          {basarisiz ? "Ödeme Başarısız" : "Bir Hata Oluştu"}
        </h1>
        <p style={{ color: "#6b7280", fontSize: "0.9375rem", lineHeight: 1.6, marginBottom: "2rem" }}>
          {basarisiz
            ? "Kartınızdan ödeme alınamadı. Kart bakiyenizi veya bilgilerinizi kontrol edip tekrar deneyebilirsiniz."
            : "Ödeme işlemi sırasında beklenmeyen bir hata oluştu. Lütfen tekrar deneyin."}
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/abonelik"
            style={{
              display: "inline-block",
              padding: "0.625rem 1.5rem",
              background: "#1a1a1a",
              color: "#fff",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "0.9375rem",
              fontWeight: 600,
            }}
          >
            Tekrar Dene
          </Link>
          <Link
            href="/"
            style={{
              display: "inline-block",
              padding: "0.625rem 1.5rem",
              border: "1px solid #e5e7eb",
              color: "#374151",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "0.9375rem",
            }}
          >
            Ana Sayfa
          </Link>
        </div>
      </div>
    </div>
  );
}
