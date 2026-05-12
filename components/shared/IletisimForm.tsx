"use client";

import { useState, FormEvent } from "react";

type Status = "idle" | "sending" | "success" | "error";

export default function IletisimForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState({
    ad: "",
    soyad: "",
    email: "",
    telefon: "",
    konu: "",
    mesaj: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/iletisim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      setStatus(json.success ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "error") {
    return (
      <div style={{
        border: "1px solid #fecaca",
        padding: "32px 24px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        alignItems: "center",
      }}>
        <div style={{ fontSize: 13, color: "#dc2626" }}>
          Mesaj gönderilemedi. Lütfen tekrar deneyin veya{" "}
          <a href="mailto:info@hatiradergi.com" style={{ color: "#dc2626" }}>info@hatiradergi.com</a>{" "}
          adresine e-posta gönderin.
        </div>
        <button
          onClick={() => setStatus("idle")}
          style={{
            padding: "10px 20px",
            background: "transparent",
            border: "1px solid #dc2626",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            cursor: "pointer",
            color: "#dc2626",
          }}
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div style={{
        border: "1px solid #e8e6e1",
        padding: "48px 36px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        alignItems: "center",
      }}>
        <div style={{
          width: 48, height: 48,
          border: "1px solid #b08d3c",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#b08d3c", fontSize: "1.4rem",
        }}>✓</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 400 }}>
          Mesajınız İletildi
        </div>
        <p style={{ fontSize: 13, color: "#6b6b6b", lineHeight: 1.7, maxWidth: "38ch" }}>
          En geç 24 saat içinde size geri dönüş sağlayacağız.
          Teşekkür ederiz.
        </p>
        <button
          onClick={() => { setStatus("idle"); setForm({ ad: "", soyad: "", email: "", telefon: "", konu: "", mesaj: "" }); }}
          style={{
            marginTop: 8,
            padding: "12px 24px",
            background: "transparent",
            border: "1px solid #0a0a0a",
            fontFamily: "'Inter', sans-serif",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            cursor: "pointer",
            color: "#0a0a0a",
          }}
        >
          Yeni Mesaj Gönder
        </button>
      </div>
    );
  }

  return (
    <form className="il-form" onSubmit={handleSubmit}>
      <div className="il-form-row">
        <div className="il-field">
          <label className="il-label" htmlFor="ad">Ad</label>
          <input
            id="ad" name="ad" type="text"
            className="il-input" placeholder="Adınız"
            value={form.ad} onChange={handleChange} required
          />
        </div>
        <div className="il-field">
          <label className="il-label" htmlFor="soyad">Soyad</label>
          <input
            id="soyad" name="soyad" type="text"
            className="il-input" placeholder="Soyadınız"
            value={form.soyad} onChange={handleChange} required
          />
        </div>
      </div>

      <div className="il-form-row">
        <div className="il-field">
          <label className="il-label" htmlFor="email">E-posta</label>
          <input
            id="email" name="email" type="email"
            className="il-input" placeholder="ornek@email.com"
            value={form.email} onChange={handleChange} required
          />
        </div>
        <div className="il-field">
          <label className="il-label" htmlFor="telefon">Telefon (Opsiyonel)</label>
          <input
            id="telefon" name="telefon" type="tel"
            className="il-input" placeholder="+90 5__ ___ __ __"
            value={form.telefon} onChange={handleChange}
          />
        </div>
      </div>

      <div className="il-field">
        <label className="il-label" htmlFor="konu">Konu</label>
        <div className="il-select-wrap">
          <select
            id="konu" name="konu"
            className="il-select"
            value={form.konu} onChange={handleChange} required
          >
            <option value="" disabled>Konuyu seçin</option>
            <option value="genel">Genel Bilgi</option>
            <option value="teknik">Teknik Destek</option>
            <option value="odeme">Ödeme & Fatura</option>
            <option value="iade">İade Talebi</option>
            <option value="kurumsal">Kurumsal & Toplu Sipariş</option>
            <option value="diger">Diğer</option>
          </select>
        </div>
      </div>

      <div className="il-field">
        <label className="il-label" htmlFor="mesaj">Mesajınız</label>
        <textarea
          id="mesaj" name="mesaj"
          className="il-textarea"
          placeholder="Mesajınızı buraya yazın…"
          value={form.mesaj} onChange={handleChange} required
        />
      </div>

      <button type="submit" className="il-submit-btn" disabled={status === "sending"}>
        {status === "sending" ? "Gönderiliyor…" : (
          <> Mesaj Gönder <span className="il-arr">→</span> </>
        )}
      </button>
      <p className="il-form-note">
        Bilgileriniz yalnızca iletişim amacıyla kullanılır ve üçüncü taraflarla paylaşılmaz.
      </p>
    </form>
  );
}
