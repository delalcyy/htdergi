"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { infoFormSchema } from "@/lib/validation/kapak";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

const schema = infoFormSchema.extend({
  code: z
    .string()
    .min(4, "Seri numarası çok kısa")
    .max(50, "Seri numarası çok uzun")
    .regex(/^[A-Z0-9\-]+$/, "Seri numarası yalnızca büyük harf, rakam ve tire içerebilir"),
});

type FormInput = z.infer<typeof schema>;

export default function SeriNumarasiFormu() {
  const router = useRouter();
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
      setServerError(json.error || "Seri numarası geçersiz veya kullanılmış.");
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
          <label htmlFor="code">Seri Numarası</label>
          <Input
            id="code"
            {...register("code")}
            placeholder="HD-XXXX-XXXXXXXXXX"
            style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
            onChange={(e) => {
              e.target.value = e.target.value.toUpperCase();
            }}
          />
          {errors.code && <div className="kapak-field-error">{errors.code.message}</div>}
        </div>

        <div className="kapak-form-section">
          <div className="kapak-form-section-title">Adres Bilgileri</div>

          <div className="kapak-field">
            <label htmlFor="fullName">Ad Soyad</label>
            <Input id="fullName" {...register("fullName")} />
            {errors.fullName && <div className="kapak-field-error">{errors.fullName.message}</div>}
          </div>

          <div className="kapak-field">
            <label htmlFor="phone">Telefon</label>
            <Input id="phone" {...register("phone")} placeholder="05XX XXX XX XX" />
            {errors.phone && <div className="kapak-field-error">{errors.phone.message}</div>}
          </div>

          <div className="kapak-field">
            <label htmlFor="addressLine">Adres</label>
            <Input id="addressLine" {...register("addressLine")} />
            {errors.addressLine && <div className="kapak-field-error">{errors.addressLine.message}</div>}
          </div>

          <div className="kapak-grid-2">
            <div className="kapak-field">
              <label htmlFor="city">Şehir</label>
              <Input id="city" {...register("city")} />
              {errors.city && <div className="kapak-field-error">{errors.city.message}</div>}
            </div>
            <div className="kapak-field">
              <label htmlFor="district">İlçe</label>
              <Input id="district" {...register("district")} />
              {errors.district && <div className="kapak-field-error">{errors.district.message}</div>}
            </div>
          </div>

          <div className="kapak-field">
            <label htmlFor="postalCode">Posta Kodu (opsiyonel)</label>
            <Input id="postalCode" {...register("postalCode")} placeholder="34000" />
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting} style={{ width: "100%", marginTop: "1rem" }}>
          {isSubmitting ? "Kontrol ediliyor..." : "Seri Numarasını Kullan"}
        </Button>
      </form>
    </div>
  );
}
