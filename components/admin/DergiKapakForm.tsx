"use client";

import { useRef, useState } from "react";
import Image from "next/image";

export default function DergiKapakForm({
  mevcutArkaKapak,
  mevcutUnluGorsel,
  mevcutUnluAdi,
}: {
  mevcutArkaKapak: string | null;
  mevcutUnluGorsel: string | null;
  mevcutUnluAdi: string | null;
}) {
  const [arkaKapakOnizleme, setArkaKapakOnizleme] = useState<string | null>(mevcutArkaKapak);
  const [unluOnizleme, setUnluOnizleme] = useState<string | null>(mevcutUnluGorsel);
  const [unluAdi, setUnluAdi] = useState(mevcutUnluAdi ?? "");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [mesaj, setMesaj] = useState<{ tip: "basari" | "hata"; metin: string } | null>(null);

  const arkaKapakRef = useRef<HTMLInputElement>(null);
  const unluRef = useRef<HTMLInputElement>(null);

  async function kaydet() {
    const arkaKapakDosya = arkaKapakRef.current?.files?.[0];
    const unluDosya = unluRef.current?.files?.[0];

    if (!arkaKapakDosya && !unluDosya && unluAdi === (mevcutUnluAdi ?? "")) {
      setMesaj({ tip: "hata", metin: "Değiştirilecek bir şey seçin." });
      return;
    }

    setYukleniyor(true);
    setMesaj(null);

    const form = new FormData();
    if (arkaKapakDosya) form.append("arkaKapak", arkaKapakDosya);
    if (unluDosya) form.append("unluGorsel", unluDosya);
    form.append("unluAdi", unluAdi);

    try {
      const res = await fetch("/api/admin/dergi-ayar", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setMesaj({ tip: "hata", metin: json.error || "Yükleme başarısız." });
        return;
      }
      if (json.data.arkaKapakUrl) setArkaKapakOnizleme(json.data.arkaKapakUrl);
      if (json.data.unluGorselUrl) setUnluOnizleme(json.data.unluGorselUrl);
      if (arkaKapakRef.current) arkaKapakRef.current.value = "";
      if (unluRef.current) unluRef.current.value = "";
      setMesaj({ tip: "basari", metin: "Kaydedildi." });
    } catch {
      setMesaj({ tip: "hata", metin: "Sunucu hatası." });
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <div style={{ maxWidth: 360 }}>
      {mesaj && (
        <div style={{
          padding: "12px 16px",
          borderRadius: 8,
          marginBottom: 24,
          background: mesaj.tip === "basari" ? "#f0fdf4" : "#fef2f2",
          border: `1px solid ${mesaj.tip === "basari" ? "#bbf7d0" : "#fecaca"}`,
          color: mesaj.tip === "basari" ? "#166534" : "#dc2626",
          fontSize: 14,
        }}>
          {mesaj.metin}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Arka Kapak Görseli</div>
        <div style={{
          border: "2px dashed #d1d5db",
          borderRadius: 8,
          overflow: "hidden",
          background: "#f9fafb",
          aspectRatio: "215/285",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 10,
          position: "relative",
        }}>
          {arkaKapakOnizleme ? (
            <Image
              src={arkaKapakOnizleme}
              alt="Arka Kapak"
              fill
              style={{ objectFit: "cover" }}
              unoptimized
            />
          ) : (
            <span style={{ color: "#9ca3af", fontSize: 13 }}>Görsel yüklenmedi</span>
          )}
        </div>
        <input
          ref={arkaKapakRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const dosya = e.target.files?.[0];
            if (!dosya) return;
            const reader = new FileReader();
            reader.onload = (ev) => setArkaKapakOnizleme(ev.target?.result as string);
            reader.readAsDataURL(dosya);
          }}
        />
        <button
          onClick={() => arkaKapakRef.current?.click()}
          style={{
            width: "100%", padding: "8px 0", border: "1px solid #d1d5db",
            borderRadius: 6, background: "#fff", fontSize: 13,
            cursor: "pointer", fontFamily: "inherit",
          }}
        >
          Görsel Seç
        </button>
        <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 6 }}>215 × 285 mm önerilir</p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Bu Ayın Ünlüsü (Kapak Editöründe Kullanılır)</div>
        <div style={{
          border: "2px dashed #d1d5db",
          borderRadius: 8,
          overflow: "hidden",
          background: "#f9fafb",
          aspectRatio: "1/1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 10,
          position: "relative",
        }}>
          {unluOnizleme ? (
            <Image
              src={unluOnizleme}
              alt="Ünlü Görseli"
              fill
              style={{ objectFit: "contain" }}
              unoptimized
            />
          ) : (
            <span style={{ color: "#9ca3af", fontSize: 13 }}>Görsel yüklenmedi</span>
          )}
        </div>
        <input
          ref={unluRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const dosya = e.target.files?.[0];
            if (!dosya) return;
            const reader = new FileReader();
            reader.onload = (ev) => setUnluOnizleme(ev.target?.result as string);
            reader.readAsDataURL(dosya);
          }}
        />
        <button
          onClick={() => unluRef.current?.click()}
          style={{
            width: "100%", padding: "8px 0", border: "1px solid #d1d5db",
            borderRadius: 6, background: "#fff", fontSize: 13,
            cursor: "pointer", fontFamily: "inherit", marginBottom: 8,
          }}
        >
          Görsel Seç
        </button>
        <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 0, marginBottom: 8 }}>
          PNG (şeffaf arka plan) önerilir — kullanıcı kapağına ön katman olarak eklenir
        </p>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 4 }}>Kişi Adı</label>
          <input
            type="text"
            value={unluAdi}
            onChange={e => setUnluAdi(e.target.value)}
            placeholder="Örn: Zendaya"
            style={{
              width: "100%", padding: "8px 10px", border: "1px solid #d1d5db",
              borderRadius: 6, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      <button
        onClick={kaydet}
        disabled={yukleniyor}
        style={{
          padding: "10px 32px",
          background: yukleniyor ? "#6b7280" : "#1a1a1a",
          color: "#fff", border: "none", borderRadius: 6,
          fontSize: 14, fontWeight: 600,
          cursor: yukleniyor ? "not-allowed" : "pointer",
        }}
      >
        {yukleniyor ? "Kaydediliyor..." : "Kaydet"}
      </button>
    </div>
  );
}
