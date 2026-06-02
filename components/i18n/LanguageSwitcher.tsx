"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LANGUAGES } from "@/lib/i18n/settings";

const FLAGS: Record<string, string> = {
  tr: "🇹🇷",
  en: "🇬🇧",
  de: "🇩🇪",
  ru: "🇷🇺",
};

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language?.slice(0, 2) || "tr";
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function change(code: string) {
    i18n.changeLanguage(code);
    localStorage.setItem("hatira_lang", code);
    setOpen(false);
  }

  const currentLang = LANGUAGES.find((l) => l.code === current) || LANGUAGES[0];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex", alignItems: "center", gap: 5,
          background: "none", border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 6, cursor: "pointer", padding: "4px 8px",
          fontSize: 12, fontWeight: 600, letterSpacing: "0.08em",
          color: "#3a3530", transition: "border-color 0.2s",
        }}
      >
        <span style={{ fontSize: 16 }}>{FLAGS[currentLang.code]}</span>
        <span>{currentLang.label}</span>
        <span style={{ fontSize: 8, opacity: 0.5, marginLeft: 1 }}>▼</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", right: 0,
          background: "#fff", border: "1px solid rgba(0,0,0,0.1)",
          borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          overflow: "hidden", zIndex: 999, minWidth: 130,
        }}>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => change(lang.code)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                width: "100%", padding: "9px 14px",
                background: current === lang.code ? "#faf8f5" : "none",
                border: "none", cursor: "pointer", textAlign: "left",
                fontSize: 13, fontWeight: current === lang.code ? 700 : 400,
                color: current === lang.code ? "#b08d3c" : "#3a3530",
              }}
            >
              <span style={{ fontSize: 18 }}>{FLAGS[lang.code]}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
