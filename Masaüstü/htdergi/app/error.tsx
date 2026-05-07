"use client";

import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "#f9fafb",
        fontFamily: "inherit",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "420px" }}>
        <div style={{ fontSize: "3rem", fontWeight: 800, color: "#dc2626", lineHeight: 1 }}>
          !
        </div>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#374151", margin: "1rem 0 0.5rem" }}>
          Bir Hata Oluştu
        </h1>
        <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "2rem", lineHeight: 1.6 }}>
          Beklenmedik bir hata meydana geldi. Sayfayı yenilemeyi veya ana sayfaya dönmeyi deneyebilirsiniz.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <button
            onClick={reset}
            style={{
              padding: "0.625rem 1.5rem",
              background: "#1a1a1a",
              color: "white",
              borderRadius: "8px",
              border: "none",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Tekrar Dene
          </button>
          <a
            href="/"
            style={{
              display: "inline-block",
              padding: "0.625rem 1.5rem",
              background: "white",
              color: "#1a1a1a",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            Ana Sayfa
          </a>
        </div>
      </div>
    </div>
  );
}
