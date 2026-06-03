"use client";

import { useState } from "react";

export default function TopluMailForm({ toplamKullanici }: { toplamKullanici: number }) {
  const [konu, setKonu] = useState("");
  const [icerik, setIcerik] = useState("");
  const [durum, setDurum] = useState<{ basarili: number; basarisiz: number; toplam: number } | null>(null);
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [onay, setOnay] = useState(false);

  async function gonder() {
    if (!konu.trim() || !icerik.trim()) { setHata("Konu ve içerik boş olamaz."); return; }
    if (!onay) { setHata("Onay kutusunu işaretleyin."); return; }
    setHata(""); setYukleniyor(true); setDurum(null);
    try {
      const res = await fetch("/api/admin/toplu-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ konu, icerik }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) { setHata(json.error || "Gönderim başarısız."); return; }
      setDurum(json.data);
      setKonu(""); setIcerik(""); setOnay(false);
    } catch {
      setHata("Sunucu hatası.");
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <div style={{ maxWidth: 640 }}>
      {durum && (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "16px 20px", marginBottom: 24 }}>
          <strong style={{ color: "#166534" }}>✓ Gönderim tamamlandı</strong>
          <p style={{ margin: "8px 0 0", color: "#166534", fontSize: 14 }}>
            {durum.toplam} kullanıcıya gönderildi — {durum.basarili} başarılı, {durum.basarisiz} başarısız.
          </p>
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Konu</label>
        <input
          value={konu}
          onChange={e => setKonu(e.target.value)}
          maxLength={200}
          placeholder="Mail konusu..."
          style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14, boxSizing: "border-box" }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 14 }}>İçerik</label>
        <textarea
          value={icerik}
          onChange={e => setIcerik(e.target.value)}
          maxLength={10000}
          rows={10}
          placeholder="Mail içeriği... (düz metin, satır sonları korunur)"
          style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
        />
        <p style={{ fontSize: 12, color: "#9ca3af", margin: "4px 0 0" }}>{icerik.length} / 10.000 karakter</p>
      </div>

      <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "12px 16px", marginBottom: 16 }}>
        <p style={{ margin: 0, fontSize: 13, color: "#92400e" }}>
          ⚠ Bu mail <strong>{toplamKullanici} kayıtlı kullanıcıya</strong> gönderilecek. Bu işlem geri alınamaz.
        </p>
        <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontSize: 13, color: "#92400e", cursor: "pointer" }}>
          <input type="checkbox" checked={onay} onChange={e => setOnay(e.target.checked)} />
          Evet, {toplamKullanici} kişiye toplu mail göndermek istiyorum.
        </label>
      </div>

      {hata && (
        <p style={{ color: "#dc2626", fontSize: 14, marginBottom: 12 }}>{hata}</p>
      )}

      <button
        onClick={gonder}
        disabled={yukleniyor || !konu.trim() || !icerik.trim()}
        style={{
          padding: "10px 28px", background: yukleniyor ? "#6b7280" : "#1a1a1a",
          color: "#fff", border: "none", borderRadius: 6, fontSize: 14,
          fontWeight: 600, cursor: yukleniyor ? "not-allowed" : "pointer",
        }}
      >
        {yukleniyor ? "Gönderiliyor..." : "Toplu Mail Gönder"}
      </button>
    </div>
  );
}
