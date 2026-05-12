"use client";

import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[AdminError]", error);
  }, [error]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "4rem 2rem",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "1.125rem", fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>
        Bir hata oluştu
      </div>
      <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1.5rem" }}>
        Bu sayfa yüklenirken beklenmedik bir sorun oluştu.
      </p>
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
    </div>
  );
}
