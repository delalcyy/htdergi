"use client";

import { useTranslation } from "react-i18next";
import { LANGUAGES } from "@/lib/i18n/settings";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language?.slice(0, 2) || "tr";

  function change(code: string) {
    i18n.changeLanguage(code);
    localStorage.setItem("hatira_lang", code);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      {LANGUAGES.map((lang, idx) => (
        <span key={lang.code} style={{ display: "flex", alignItems: "center" }}>
          {idx > 0 && (
            <span style={{ color: "#c8c0b8", fontSize: 10, margin: "0 2px" }}>|</span>
          )}
          <button
            onClick={() => change(lang.code)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "2px 4px",
              fontSize: 10,
              fontFamily: "var(--font-inter, Inter, sans-serif)",
              fontWeight: 600,
              letterSpacing: "0.12em",
              color: current === lang.code ? "#b08d3c" : "#6b6b6b",
              transition: "color 0.2s",
            }}
            title={lang.name}
          >
            {lang.label}
          </button>
        </span>
      ))}
    </div>
  );
}
