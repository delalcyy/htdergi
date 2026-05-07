"use client";

import { useTranslation } from "react-i18next";

export default function KapakLoading() {
  const { t } = useTranslation("common");

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: "36px", height: "36px",
          border: "3px solid #e5e7eb", borderTopColor: "#1a1a1a",
          borderRadius: "50%", margin: "0 auto 1rem",
          animation: "spin 0.8s linear infinite",
        }} />
        <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>{t("cover.loading")}</div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
