"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function KapakError({ error, reset }: Props) {
  const { t } = useTranslation("common");

  useEffect(() => {
    console.error("[KapakError]", error.name, error.message);
  }, [error]);

  return (
    <div style={{
      minHeight: "60vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "2rem", fontFamily: "inherit",
    }}>
      <div style={{ textAlign: "center", maxWidth: "480px" }}>
        <div style={{
          width: "48px", height: "48px", borderRadius: "50%",
          background: "#fef2f2", display: "flex", alignItems: "center",
          justifyContent: "center", margin: "0 auto 1.25rem", fontSize: "1.5rem",
        }}>
          🔌
        </div>

        <h1 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111827", marginBottom: "0.5rem" }}>
          {t("cover.error.title")}
        </h1>

        <p style={{ fontSize: "0.875rem", color: "#6b7280", lineHeight: 1.6, marginBottom: "1.5rem" }}>
          {t("cover.error.desc")}
        </p>

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={reset} style={{
            padding: "0.625rem 1.25rem", background: "#1a1a1a", color: "white",
            borderRadius: "8px", border: "none", fontSize: "0.875rem",
            fontWeight: 500, cursor: "pointer",
          }}>
            {t("cover.error.retry")}
          </button>

          <Link href="/" style={{
            display: "inline-block", padding: "0.625rem 1.25rem",
            background: "white", color: "#374151", border: "1px solid #e5e7eb",
            borderRadius: "8px", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500,
          }}>
            {t("cover.error.home")}
          </Link>
        </div>
      </div>
    </div>
  );
}
