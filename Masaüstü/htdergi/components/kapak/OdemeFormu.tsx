"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Props = {
  planId: string | null;
  purchaseType: "subscription" | "cover";
  planPrice: number | null;
};

const COVER_PRICE = 299; // Tek kapak fiyatı

export default function OdemeFormu({ planId, purchaseType, planPrice }: Props) {
  const router = useRouter();
  const [discountCode, setDiscountCode] = useState("");
  const [discountInfo, setDiscountInfo] = useState<{
    id: string;
    discountType: string;
    discountValue: number;
  } | null>(null);
  const [discountError, setDiscountError] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const basePrice = planPrice ?? COVER_PRICE;
  const discount = discountInfo
    ? discountInfo.discountType === "PERCENT"
      ? (basePrice * discountInfo.discountValue) / 100
      : discountInfo.discountValue
    : 0;
  const finalPrice = Math.max(0, basePrice - discount);

  async function applyDiscount() {
    setDiscountError("");
    setIsApplying(true);
    try {
      const res = await fetch("/api/indirim-kodu/dogrula", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: discountCode.trim().toUpperCase(),
          type: purchaseType === "subscription" ? "SUBSCRIPTION" : "COVER_ONLY",
          planId,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setDiscountError(json.error || "Geçersiz kod.");
        setDiscountInfo(null);
      } else {
        setDiscountInfo(json.data);
      }
    } catch {
      setDiscountError("Bağlantı hatası.");
    } finally {
      setIsApplying(false);
    }
  }

  async function handlePayment() {
    setServerError("");
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/odeme/baslat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          purchaseType,
          discountCodeId: discountInfo?.id || null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setServerError(json.error || "Ödeme başlatılamadı.");
        return;
      }
      // Ödeme sağlayıcısına yönlendirme (iyzico checkout url)
      if (json.data?.checkoutUrl) {
        window.location.href = json.data.checkoutUrl;
      }
    } catch {
      setServerError("Bağlantı hatası.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="kapak-form-card">
      {serverError && (
        <Alert variant="destructive" style={{ marginBottom: "1.25rem" }}>
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      {/* Fiyat özeti */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
          <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>Tutar</span>
          <span style={{ fontWeight: 600, color: "#1a1a1a" }}>₺{basePrice.toLocaleString("tr-TR")}</span>
        </div>
        {discountInfo && (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ color: "#059669", fontSize: "0.875rem" }}>İndirim</span>
            <span style={{ fontWeight: 600, color: "#059669" }}>-₺{discount.toLocaleString("tr-TR")}</span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e5e7eb", paddingTop: "0.75rem" }}>
          <span style={{ fontWeight: 700, color: "#1a1a1a" }}>Toplam</span>
          <span style={{ fontWeight: 700, fontSize: "1.125rem", color: "#1a1a1a" }}>₺{finalPrice.toLocaleString("tr-TR")}</span>
        </div>
      </div>

      {/* İndirim kodu */}
      <div className="kapak-form-section">
        <div className="kapak-form-section-title">İndirim Kodu</div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Input
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
            placeholder="İNDİRİM KODUNU GİRİN"
            style={{ fontFamily: "monospace", letterSpacing: "0.05em", flex: 1 }}
            disabled={!!discountInfo}
          />
          {discountInfo ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => { setDiscountInfo(null); setDiscountCode(""); }}
            >
              Kaldır
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={applyDiscount}
              disabled={!discountCode || isApplying}
            >
              {isApplying ? "..." : "Uygula"}
            </Button>
          )}
        </div>
        {discountError && <div className="kapak-field-error">{discountError}</div>}
        {discountInfo && (
          <div style={{ fontSize: "0.8125rem", color: "#059669", marginTop: "0.375rem" }}>
            İndirim uygulandı!
          </div>
        )}
      </div>

      <div style={{ marginTop: "1.5rem" }}>
        <Button onClick={handlePayment} disabled={isSubmitting} className="w-full" size="lg">
          {isSubmitting ? "Yönlendiriliyor..." : `₺${finalPrice.toLocaleString("tr-TR")} Öde`}
        </Button>
        <p style={{ fontSize: "0.75rem", color: "#9ca3af", textAlign: "center", marginTop: "0.75rem" }}>
          Güvenli ödeme. Bilgileriniz şifrelenerek işlenir.
        </p>
      </div>
    </div>
  );
}
