"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { registerSchema, type RegisterInput } from "@/lib/validation/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IL_LISTESI, ILLER, TAKIMLAR } from "@/lib/data/turkiye";

export default function RegisterForm() {
  const [serverError, setServerError] = useState("");
  const [selectedIl, setSelectedIl] = useState("");
  const [registered, setRegistered] = useState(false);
  const [teamOption, setTeamOption] = useState("");

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
      setRegistered(true);
    } catch {
      setServerError("Bağlantı hatası. Lütfen tekrar deneyin.");
    }
  }

  const sel = "w-full border border-input bg-background px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed";

  if (registered) {
    return (
      <div className="auth-card">
        <div className="auth-logo"><h1>Hatıra Dergi</h1></div>
        <h2 className="auth-title">Kaydınız Alındı!</h2>
        <p className="auth-subtitle">
          E-posta adresinize bir doğrulama bağlantısı gönderdik. Hesabınızı etkinleştirmek için
          gelen kutunuzu kontrol edin.
        </p>
        <div className="auth-divider">
          <Link href="/auth/giris">Giriş sayfasına git</Link>
        </div>
      </div>
    );
  }

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

        {/* Doğum Tarihi */}
        <div className="auth-field">
          <Label htmlFor="birthDate">Doğum Tarihi</Label>
          <Input
            id="birthDate"
            type="date"
            max={new Date().toISOString().split("T")[0]}
            {...register("birthDate")}
          />
          {errors.birthDate && <span className="auth-error">{errors.birthDate.message}</span>}
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
          <select
            id="supportedTeam"
            className={sel}
            value={teamOption}
            onChange={(e) => {
              const val = e.target.value;
              setTeamOption(val);
              if (val === "__none__") {
                setValue("supportedTeam", "", { shouldValidate: true });
              } else if (val !== "Diğer") {
                setValue("supportedTeam", val, { shouldValidate: true });
              } else {
                setValue("supportedTeam", "", { shouldValidate: false });
              }
            }}
          >
            <option value="">— Takım seçin —</option>
            <option value="__none__">Takım tutmuyorum</option>
            {TAKIMLAR.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {teamOption === "Diğer" && (
            <Input
              {...register("supportedTeam")}
              placeholder="Takımınızın adını yazın"
              autoComplete="off"
              style={{ marginTop: "0.5rem" }}
            />
          )}
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

        {/* KVKK onayı — zorunlu */}
        <div className="auth-field" style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
          <input
            id="kvkkConsent"
            type="checkbox"
            {...register("kvkkConsent")}
            style={{ marginTop: "3px", flexShrink: 0, accentColor: "#1a1a1a" }}
          />
          <label htmlFor="kvkkConsent" style={{ fontSize: "13px", color: "#4b5563", cursor: "pointer", lineHeight: "1.5" }}>
            <Link href="/gizlilik" target="_blank" style={{ color: "#1a1a1a", fontWeight: 600, textDecoration: "underline" }}>
              Kişisel Verilerin Korunması (KVKK) Aydınlatma Metni
            </Link>
            &apos;ni okudum, kişisel verilerimin işlenmesini kabul ediyorum.
          </label>
        </div>
        {errors.kvkkConsent && (
          <span className="auth-error" style={{ marginTop: "-8px" }}>{errors.kvkkConsent.message}</span>
        )}

        {/* E-posta pazarlama izni — isteğe bağlı */}
        <div className="auth-field" style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
          <input
            id="epostaIzni"
            type="checkbox"
            {...register("epostaIzni")}
            style={{ marginTop: "3px", flexShrink: 0, accentColor: "#1a1a1a" }}
          />
          <label htmlFor="epostaIzni" style={{ fontSize: "13px", color: "#4b5563", cursor: "pointer", lineHeight: "1.5" }}>
            Hatıra Dergi&apos;nin kampanya, özel teklif ve duyurularından e-posta ile haberdar olmak istiyorum. (İsteğe bağlı)
          </label>
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
