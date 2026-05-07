"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { infoFormSchema, type InfoFormInput } from "@/lib/validation/kapak";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { z } from "zod";

const formWithSerialSchema = infoFormSchema.extend({
  serialCode: z.string().max(50).optional().nullable(),
});

type FormInput = z.infer<typeof formWithSerialSchema>;

export default function BilgiFormu() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation("common");
  const planId = searchParams.get("planId");
  const [serverError, setServerError] = useState("");
  const [showSerial, setShowSerial] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInput>({
    resolver: zodResolver(formWithSerialSchema),
  });

  async function onSubmit(data: FormInput) {
    setServerError("");
    const { serialCode, ...addressData } = data;

    // Seri numarası girilmişse önce onu dene
    if (serialCode && serialCode.trim()) {
      const res = await fetch("/api/seri-numarasi/aktive-et", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: serialCode.trim(), ...addressData }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setServerError(json.error || t("cover.bilgiFormu.serialInvalid"));
        return;
      }
      router.push("/kapak-tasarla/editor");
      router.refresh();
      return;
    }

    // Adres kaydet ve ödeme sayfasına yönlendir
    const res = await fetch("/api/user/adres", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addressData),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      setServerError(json.error || t("cover.bilgiFormu.genericError"));
      return;
    }

    const params = new URLSearchParams();
    if (planId) params.set("planId", planId);
    params.set("type", planId ? "subscription" : "cover");
    router.push(`/kapak-tasarla/odeme?${params.toString()}`);
  }

  return (
    <div className="kapak-form-card">
      {serverError && (
        <Alert variant="destructive" style={{ marginBottom: "1.25rem" }}>
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="kapak-field">
          <label htmlFor="fullName">{t("cover.bilgiFormu.fullName")}</label>
          <Input id="fullName" {...register("fullName")} />
          {errors.fullName && <div className="kapak-field-error">{errors.fullName.message}</div>}
        </div>

        <div className="kapak-field">
          <label htmlFor="phone">{t("cover.bilgiFormu.phone")}</label>
          <Input id="phone" {...register("phone")} placeholder="05XX XXX XX XX" />
          {errors.phone && <div className="kapak-field-error">{errors.phone.message}</div>}
        </div>

        <div className="kapak-form-section">
          <div className="kapak-form-section-title">{t("cover.bilgiFormu.addressSection")}</div>

          <div className="kapak-field">
            <label htmlFor="addressLine">{t("cover.bilgiFormu.address")}</label>
            <Input id="addressLine" {...register("addressLine")} />
            {errors.addressLine && <div className="kapak-field-error">{errors.addressLine.message}</div>}
          </div>

          <div className="kapak-grid-2">
            <div className="kapak-field">
              <label htmlFor="city">{t("cover.bilgiFormu.city")}</label>
              <Input id="city" {...register("city")} />
              {errors.city && <div className="kapak-field-error">{errors.city.message}</div>}
            </div>
            <div className="kapak-field">
              <label htmlFor="district">{t("cover.bilgiFormu.district")}</label>
              <Input id="district" {...register("district")} />
              {errors.district && <div className="kapak-field-error">{errors.district.message}</div>}
            </div>
          </div>

          <div className="kapak-field">
            <label htmlFor="postalCode">{t("cover.bilgiFormu.postalCode")}</label>
            <Input id="postalCode" {...register("postalCode")} placeholder="34000" />
          </div>
        </div>

        {/* Seri numarası bölümü */}
        <div className="kapak-form-section">
          <div className="kapak-form-section-title">{t("cover.bilgiFormu.serialSection")}</div>
          <button
            type="button"
            onClick={() => setShowSerial(!showSerial)}
            style={{
              fontSize: "0.875rem",
              color: "#374151",
              textDecoration: "underline",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              marginBottom: "0.75rem",
            }}
          >
            {showSerial ? t("cover.bilgiFormu.serialToggleOff") : t("cover.bilgiFormu.serialToggleOn")}
          </button>

          {showSerial && (
            <div className="kapak-field">
              <label htmlFor="serialCode">{t("cover.bilgiFormu.serialCode")}</label>
              <Input
                id="serialCode"
                {...register("serialCode")}
                placeholder="HD-XXXX-XXXXXX"
                style={{ fontFamily: "monospace", letterSpacing: "0.05em" }}
              />
              {errors.serialCode && <div className="kapak-field-error">{errors.serialCode.message}</div>}
              <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.25rem" }}>
                {t("cover.bilgiFormu.serialHint")}
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: "1.5rem" }}>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting
              ? t("cover.bilgiFormu.submitting")
              : showSerial
                ? t("cover.bilgiFormu.submitWithSerial")
                : t("cover.bilgiFormu.submitToPayment")}
          </Button>
        </div>
      </form>
    </div>
  );
}
