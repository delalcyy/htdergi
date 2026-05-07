"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CargoData = {
  carrier?: string | null;
  trackingNumber?: string | null;
  status?: string;
  currentLocation?: string | null;
  estimatedDate?: Date | null;
  notes?: string | null;
};

type Props = {
  orderId: string;
  current?: CargoData;
  orderStatus: string;
};

const CARGO_STATUSES = [
  { value: "PENDING",    label: "Hazırlanıyor" },
  { value: "PICKED_UP", label: "Kargoya Verildi" },
  { value: "IN_TRANSIT", label: "Yolda" },
  { value: "DELIVERED",  label: "Teslim Edildi" },
  { value: "FAILED",     label: "Teslim Başarısız" },
  { value: "RETURNED",   label: "İade Edildi" },
];

const ORDER_STATUSES = [
  { value: "PENDING",       label: "Beklemede" },
  { value: "CONFIRMED",     label: "Onaylandı" },
  { value: "IN_PRODUCTION", label: "Üretimde" },
  { value: "SHIPPED",       label: "Kargoda" },
  { value: "DELIVERED",     label: "Teslim Edildi" },
  { value: "CANCELLED",     label: "İptal Edildi" },
  { value: "REFUNDED",      label: "İade Edildi" },
];

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function KargoGuncelle({ orderId, current, orderStatus }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");
  const [ok, setOk]         = useState(false);

  const [form, setForm] = useState({
    carrier:         current?.carrier        || "",
    trackingNumber:  current?.trackingNumber || "",
    status:          current?.status         || "PENDING",
    currentLocation: current?.currentLocation || "",
    estimatedDate:   current?.estimatedDate
      ? new Date(current.estimatedDate).toISOString().split("T")[0]
      : "",
    notes:           current?.notes          || "",
  });

  const [newOrderStatus, setNewOrderStatus] = useState(orderStatus);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSaving(true); setOk(false);

    try {
      // Sipariş durumunu güncelle
      if (newOrderStatus !== orderStatus) {
        const r = await fetch(`${BACKEND}/api/admin/orders/${orderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status: newOrderStatus }),
        });
        if (!r.ok) throw new Error("Sipariş durumu güncellenemedi.");
      }

      // Kargo bilgilerini güncelle
      const body: Record<string, string> = {};
      if (form.carrier)         body["carrier"]         = form.carrier;
      if (form.trackingNumber)  body["trackingNumber"]  = form.trackingNumber;
      if (form.status)          body["status"]          = form.status;
      if (form.currentLocation) body["currentLocation"] = form.currentLocation;
      if (form.estimatedDate)   body["estimatedDate"]   = new Date(form.estimatedDate).toISOString();
      body["notes"] = form.notes;

      const r2 = await fetch(`${BACKEND}/api/admin/orders/${orderId}/cargo`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!r2.ok) throw new Error("Kargo bilgileri güncellenemedi.");

      setOk(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      {/* Sipariş Durumu */}
      <div className="admin-field">
        <label className="admin-label">Sipariş Durumu</label>
        <div className="admin-select-wrap">
          <select
            className="admin-select"
            value={newOrderStatus}
            onChange={(e) => setNewOrderStatus(e.target.value)}
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--ad-line)", paddingTop: 16, marginTop: 4 }}>
        <div className="admin-label" style={{ marginBottom: 12 }}>Kargo Bilgileri</div>
      </div>

      {/* Kargo firması + takip no */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="admin-field">
          <label className="admin-label">Kargo Firması</label>
          <input
            name="carrier"
            className="admin-input"
            placeholder="MNG, Yurtiçi, Aras…"
            value={form.carrier}
            onChange={handleChange}
          />
        </div>
        <div className="admin-field">
          <label className="admin-label">Takip Numarası</label>
          <input
            name="trackingNumber"
            className="admin-input"
            placeholder="123456789"
            value={form.trackingNumber}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Kargo durumu + konum */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="admin-field">
          <label className="admin-label">Kargo Durumu</label>
          <div className="admin-select-wrap">
            <select name="status" className="admin-select" value={form.status} onChange={handleChange}>
              {CARGO_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="admin-field">
          <label className="admin-label">Güncel Konum</label>
          <input
            name="currentLocation"
            className="admin-input"
            placeholder="İstanbul dağıtım merkezi"
            value={form.currentLocation}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Tahmini tarih */}
      <div className="admin-field">
        <label className="admin-label">Tahmini Teslim Tarihi</label>
        <input
          name="estimatedDate"
          type="date"
          className="admin-input"
          value={form.estimatedDate}
          onChange={handleChange}
        />
      </div>

      {/* Notlar */}
      <div className="admin-field">
        <label className="admin-label">Notlar</label>
        <textarea
          name="notes"
          className="admin-textarea"
          placeholder="Kargoya ilişkin notlar…"
          value={form.notes}
          onChange={handleChange}
        />
      </div>

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca",
          padding: "10px 14px", color: "#991b1b", fontSize: 12 }}>
          {error}
        </div>
      )}
      {ok && (
        <div style={{ background: "rgba(176,141,60,0.06)", border: "1px solid rgba(176,141,60,0.3)",
          padding: "10px 14px", color: "var(--ad-gold-deep)", fontSize: 12 }}>
          ✓ Bilgiler güncellendi.
        </div>
      )}

      <button type="submit" className="admin-btn" disabled={saving}>
        {saving ? "Kaydediliyor…" : "Kaydet"}
      </button>
    </form>
  );
}
