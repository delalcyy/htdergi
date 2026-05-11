"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerSchema, type RegisterInput } from "@/lib/validation/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IL_LISTESI, ILLER, TAKIMLAR } from "@/lib/data/turkiye";

export default function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [selectedIl, setSelectedIl] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  /* RHF'e city kaydı yaparken aynı anda local state'i de güncelle */
  const cityReg = register("city");

  const ilceler = selectedIl ? (ILLER[selectedIl] ?? []).sort((a, b) => a.localeCompare(b, "tr")) : [];

  async function onSubmit(data: RegisterInput) {
    setServerError("");
    try {
      const res = await fetch("/api/auth/kayit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      let json: { success: boolean; error?: string } = { success: false };
      try { json = await res.json(); } catch { /* sunucu HTML döndü */ }

      if (!res.ok || !json.success) {
        setServerError(json.error || "Kayıt sırasında hata oluştu");
        return;
      }
      router.push("/panel");
      router.refresh();
    } catch {
      setServerError("Bağlantı hatası. Lütfen tekrar deneyin.");
    }
  }

  const sel = "w-full border border-input bg-background px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="auth-card">
      <div className="auth-logo">
        <h1>Hatıra Dergi</h1>
        <p>Kendi derginizi oluşturun</p>
      </div>

      <h2 className="auth-title">Hesap Oluştur</h2>
      <p className="auth-subtitle">Tüm alanlar zorunludur</p>

      {serverError && (
        <Alert variant="destructive" className="auth-alert">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>

        {/* Ad / Soyad */}
        <div className="auth-form-row">
          <div className="auth-field">
            <Label htmlFor="firstName">Ad</Label>
            <Input id="firstName" {...register("firstName")} placeholder="Adınız" autoComplete="given-name" />
            {errors.firstName && <span className="auth-error">{errors.firstName.message}</span>}
          </div>
          <div className="auth-field">
            <Label htmlFor="lastName">Soyad</Label>
            <Input id="lastName" {...register("lastName")} placeholder="Soyadınız" autoComplete="family-name" />
            {errors.lastName && <span className="auth-error">{errors.lastName.message}</span>}
          </div>
        </div>

        {/* E-posta */}
        <div className="auth-field">
          <Label htmlFor="email">E-posta</Label>
          <Input id="email" type="email" {...register("email")} placeholder="ornek@email.com" autoComplete="email" />
          {errors.email && <span className="auth-error">{errors.email.message}</span>}
        </div>

        {/* Telefon */}
        <div className="auth-field">
          <Label htmlFor="phone">Telefon</Label>
          <Input id="phone" type="tel" {...register("phone")} placeholder="05XX XXX XX XX" autoComplete="tel" />
          {errors.phone && <span className="auth-error">{errors.phone.message}</span>}
        </div>

        {/* Yaş */}
        <div className="auth-field">
          <Label htmlFor="age">Yaş</Label>
          <Input
            id="age"
            type="number"
            min={1}
            max={120}
            {...register("age", { valueAsNumber: true })}
            placeholder="Yaşınız"
          />
          {errors.age && <span className="auth-error">{errors.age.message}</span>}
        </div>

        {/* İl */}
        <div className="auth-field">
          <Label htmlFor="city">İl</Label>
          <select
            id="city"
            className={sel}
            {...cityReg}
            onChange={(e) => {
              cityReg.onChange(e);
              setSelectedIl(e.target.value);
              setValue("district", "", { shouldValidate: false });
            }}
          >
            <option value="">— İl seçin —</option>
            {IL_LISTESI.map(il => (
              <option key={il} value={il}>{il}</option>
            ))}
          </select>
          {errors.city && <span className="auth-error">{errors.city.message}</span>}
        </div>

        {/* İlçe */}
        <div className="auth-field">
          <Label htmlFor="district">İlçe</Label>
          <select
            id="district"
            className={sel}
            disabled={!selectedIl}
            {...register("district")}
          >
            <option value="">{selectedIl ? "— İlçe seçin —" : "Önce il seçin"}</option>
            {ilceler.map(ilce => (
              <option key={ilce} value={ilce}>{ilce}</option>
            ))}
          </select>
          {errors.district && <span className="auth-error">{errors.district.message}</span>}
        </div>

        {/* Tuttuğu Takım */}
        <div className="auth-field">
          <Label htmlFor="supportedTeam">Tuttuğunuz Takım</Label>
          <select id="supportedTeam" className={sel} {...register("supportedTeam")}>
            <option value="">— Takım seçin —</option>
            {TAKIMLAR.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {errors.supportedTeam && <span className="auth-error">{errors.supportedTeam.message}</span>}
        </div>

        {/* Şifre */}
        <div className="auth-field">
          <Label htmlFor="password">Şifre</Label>
          <Input
            id="password"
            type="password"
            {...register("password")}
            placeholder="En az 8 karakter, büyük harf ve rakam"
            autoComplete="new-password"
          />
          {errors.password && <span className="auth-error">{errors.password.message}</span>}
        </div>

        <Button type="submit" className="auth-submit" disabled={isSubmitting}>
          {isSubmitting ? "Kaydediliyor..." : "Kayıt Ol"}
        </Button>
      </form>

      <div className="auth-divider">
        Zaten hesabınız var mı? <Link href="/auth/giris">Giriş yapın</Link>
      </div>
    </div>
  );
}
