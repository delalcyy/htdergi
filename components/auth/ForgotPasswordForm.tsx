"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validation/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordInput) {
    setServerError("");
    const res = await fetch("/api/auth/sifremi-unuttum", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email }),
    });
    if (!res.ok) {
      setServerError("İşlem sırasında hata oluştu. Lütfen tekrar deneyin.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="auth-card">
        <div className="auth-logo">
          <h1>Hatıra Dergi</h1>
        </div>
        <Alert>
          <AlertDescription>
            Eğer bu e-posta adresine kayıtlı bir hesap varsa, şifre sıfırlama bağlantısı gönderildi.
            Gelen kutunuzu kontrol edin.
          </AlertDescription>
        </Alert>
        <div className="auth-divider" style={{ marginTop: "1.25rem" }}>
          <Link href="/auth/giris">Giriş sayfasına dön</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <div className="auth-logo">
        <h1>Hatıra Dergi</h1>
      </div>

      <h2 className="auth-title">Şifremi Unuttum</h2>
      <p className="auth-subtitle">
        Kayıtlı e-posta adresinizi girin, şifre sıfırlama bağlantısı göndereceğiz.
      </p>

      {serverError && (
        <Alert variant="destructive" className="auth-alert">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="auth-field">
          <Label htmlFor="email">E-posta</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            autoComplete="email"
            placeholder="ornek@email.com"
          />
          {errors.email && (
            <span className="auth-error">{errors.email.message}</span>
          )}
        </div>

        <Button type="submit" className="auth-submit" disabled={isSubmitting}>
          {isSubmitting ? "Gönderiliyor..." : "Bağlantı Gönder"}
        </Button>
      </form>

      <div className="auth-divider">
        <Link href="/auth/giris">Giriş sayfasına dön</Link>
      </div>
    </div>
  );
}
