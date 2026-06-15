"use client";

import { useState } from "react";

export default function EpostaIzniPopup() {
  const [kapandi, setKapandi] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);

  async function cevapla(izin: boolean) {
    setYukleniyor(true);
    try {
      await fetch("/api/user/eposta-izni", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ izin }),
      });
    } finally {
      setYukleniyor(false);
      setKapandi(true);
    }
  }

  if (kapandi) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "#1a1a1a",
        color: "#fff",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        flexWrap: "wrap",
        boxShadow: "0 -2px 12px rgba(0,0,0,0.3)",
      }}
    >
      <p style={{ flex: 1, minWidth: 260, margin: 0, fontSize: "14px", lineHeight: "1.5", color: "#e5e7eb" }}>
        Hatıra Dergi&apos;nin kampanya, duyuru ve özel tekliflerinden e-posta ile haberdar olmak ister misiniz?
      </p>
      <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
        <button
          disabled={yukleniyor}
          onClick={() => cevapla(false)}
          style={{
            padding: "8px 18px",
            borderRadius: "6px",
            border: "1px solid #4b5563",
            background: "transparent",
            color: "#9ca3af",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          Hayır, teşekkürler
        </button>
        <button
          disabled={yukleniyor}
          onClick={() => cevapla(true)}
          style={{
            padding: "8px 18px",
            borderRadius: "6px",
            border: "none",
            background: "#fff",
            color: "#1a1a1a",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Evet, haberdar olmak istiyorum
        </button>
      </div>
    </div>
  );
}
