"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { infoFormSchema } from "@/lib/validation/kapak";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

const schema = infoFormSchema.extend({
  code: z
    .string()
    .min(4)
    .max(50)
    .regex(/^[A-Z0-9\-]+$/),
});

type FormInput = z.infer<typeof schema>;

export default function SeriNumarasiFormu() {
  const router = useRouter();
  const { t } = useTranslation("common");
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInput>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormInput) {
    setServerError("");
    const res = await fetch("/api/seri-numarasi/aktive-et", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      setServerError(json.error || t("cover.seriNumarasi.invalidError"));
      return;
    }
    router.push("/kapak-tasarla/editor");
    router.refresh();
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
          <label htmlFor="code">{t("cover.seriNumarasi.codeLabel")}</label>
          <Input
            id="code"
            {...register("code")}
            placeholder="HD-XXXX-XXXXXXXXXX"
            style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
            onChange={(e) => {
              e.target.value = e.target.value.toUpperCase();
            }}
          />
          {errors.code && (
            <div className="kapak-field-error">
              {errors.code.type === "too_small"
                ? t("cover.seriNumarasi.tooShort")
                : errors.code.type === "too_big"
                  ? t("cover.seriNumarasi.tooLong")
                  : errors.code.type === "invalid_string"
                    ? t("cover.seriNumarasi.formatError")
                    : errors.code.message}
            </div>
          )}
        </div>

        <div className="kapak-form-section">
          <div className="kapak-form-section-title">{t("cover.seriNumarasi.addressSection")}</div>

          <div className="kapak-field">
            <label htmlFor="fullName">{t("cover.seriNumarasi.fullName")}</label>
            <Input id="fullName" {...register("fullName")} />
            {errors.fullName && <div className="kapak-field-error">{errors.fullName.message}</div>}
          </div>

          <div className="kapak-field">
            <label htmlFor="phone">{t("cover.seriNumarasi.phone")}</label>
            <Input id="phone" {...register("phone")} placeholder="05XX XXX XX XX" />
            {errors.phone && <div className="kapak-field-error">{errors.phone.message}</div>}
          </div>

          <div className="kapak-field">
            <label htmlFor="addressLine">{t("cover.seriNumarasi.address")}</label>
            <Input id="addressLine" {...register("addressLine")} />
            {errors.addressLine && <div className="kapak-field-error">{errors.addressLine.message}</div>}
          </div>

          <div className="kapak-grid-2">
            <div className="kapak-field">
              <label htmlFor="city">{t("cover.seriNumarasi.city")}</label>
              <Input id="city" {...register("city")} />
              {errors.city && <div className="kapak-field-error">{errors.city.message}</div>}
            </div>
            <div className="kapak-field">
              <label htmlFor="district">{t("cover.seriNumarasi.district")}</label>
              <Input id="district" {...register("district")} />
              {errors.district && <div className="kapak-field-error">{errors.district.message}</div>}
            </div>
          </div>

          <div className="kapak-field">
            <label htmlFor="postalCode">{t("cover.seriNumarasi.postalCode")}</label>
            <Input id="postalCode" {...register("postalCode")} placeholder="34000" />
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting} style={{ width: "100%", marginTop: "1rem" }}>
          {isSubmitting ? t("cover.seriNumarasi.checking") : t("cover.seriNumarasi.submit")}
        </Button>
      </form>
    </div>
  );
}
