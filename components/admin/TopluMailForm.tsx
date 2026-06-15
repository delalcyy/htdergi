"use client";

import { useState } from "react";

interface Props {
  toplamKullanici: number;
  sehirler: string[];
  takimlar: string[];
}

export default function TopluMailForm({ toplamKullanici, sehirler, takimlar }: Props) {
  console.log("TopluMailForm yüklendi:", { sehirler, takimlar });
  const [konu, setKonu] = useState("");
  const [icerik, setIcerik] = useState("");
  const [sehir, setSehir] = useState("");
  const [takim, setTakim] = useState("");
  const [hedefSayi, setHedefSayi] = useState(toplamKullanici);
  const [durum, setDurum] = useState<{ basarili: number; basarisiz: number; toplam: number } | null>(null);
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [onay, setOnay] = useState(false);

  async function filtreDegisti(yeniSehir: string, yeniTakim: string) {
    const params = new URLSearchParams();
    if (yeniSehir) params.set("sehir", yeniSehir);
    if (yeniTakim) params.set("takim", yeniTakim);
    try {
      const res = await fetch(`/api/admin/toplu-mail?${params}`);
      const json = await res.json();
      if (json.success) setHedefSayi(json.data.sayi);
    } catch { /* sessizce geç */ }
    setOnay(false);
  }

  async function gonder() {
    if (!konu.trim() || !icerik.trim()) { setHata("Konu ve içerik boş olamaz."); return; }
    if (!onay) { setHata("Onay kutusunu işaretleyin."); return; }
    setHata(""); setYukleniyor(true); setDurum(null);
    try {
      const res = await fetch("/api/admin/toplu-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ konu, icerik, sehir: sehir || undefined, takim: takim || undefined }),
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

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", border: "1px solid #d1d5db",
    borderRadius: 6, fontSize: 14, boxSizing: "border-box", background: "#fff",
  };

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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        <div>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Şehir</label>
          <select
            value={sehir}
            style={inputStyle}
            onChange={e => { setSehir(e.target.value); filtreDegisti(e.target.value, takim); }}
          >
            <option value="">Tüm şehirler ({sehirler.length})</option>
            {sehirler.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Takım</label>
          <select
            value={takim}
            style={inputStyle}
            onChange={e => { setTakim(e.target.value); filtreDegisti(sehir, e.target.value); }}
          >
            <option value="">Tüm takımlar ({takimlar.length})</option>
            {takimlar.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Konu</label>
        <input value={konu} onChange={e => setKonu(e.target.value)} maxLength={200} placeholder="Mail konusu..." style={inputStyle} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 14 }}>İçerik</label>
        <textarea value={icerik} onChange={e => setIcerik(e.target.value)} maxLength={10000} rows={10}
          placeholder="Mail içeriği... (düz metin, satır sonları korunur)"
          style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
        />
        <p style={{ fontSize: 12, color: "#9ca3af", margin: "4px 0 0" }}>{icerik.length} / 10.000 karakter</p>
      </div>

      <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "12px 16px", marginBottom: 16 }}>
        <p style={{ margin: 0, fontSize: 13, color: "#92400e" }}>
          ⚠ Bu mail{sehir || takim ? ` (${[sehir, takim].filter(Boolean).join(", ")})` : ""}{" "}
          <strong>{hedefSayi} kullanıcıya</strong> gönderilecek. Bu işlem geri alınamaz.
        </p>
        <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontSize: 13, color: "#92400e", cursor: "pointer" }}>
          <input type="checkbox" checked={onay} onChange={e => setOnay(e.target.checked)} />
          Evet, {hedefSayi} kişiye toplu mail göndermek istiyorum.
        </label>
      </div>

      {hata && <p style={{ color: "#dc2626", fontSize: 14, marginBottom: 12 }}>{hata}</p>}

      <button onClick={gonder} disabled={yukleniyor || !konu.trim() || !icerik.trim()}
        style={{ padding: "10px 28px", background: yukleniyor ? "#6b7280" : "#1a1a1a", color: "#fff", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: yukleniyor ? "not-allowed" : "pointer" }}>
        {yukleniyor ? "Gönderiliyor..." : "Toplu Mail Gönder"}
      </button>
    </div>
  );
}
