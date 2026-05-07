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

export default function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterInput) {
    setServerError("");
    try {
      const res = await fetch("/api/auth/kayit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setServerError(json.error || "Kayıt sırasında hata oluştu");
        return;
      }
      // JWT cookie otomatik set edildi, direkt panel'e yönlendir
      router.push("/panel");
      router.refresh();
    } catch {
      setServerError("Bağlantı hatası. Lütfen tekrar deneyin.");
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-logo">
        <h1>Hatıra Dergi</h1>
        <p>Kendi derginizi oluşturun</p>
      </div>

      <h2 className="auth-title">Hesap Oluştur</h2>
      <p className="auth-subtitle">Bilgilerinizi girerek kayıt olun</p>

      {serverError && (
        <Alert variant="destructive" className="auth-alert">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="auth-form-row">
          <div className="auth-field">
            <Label htmlFor="firstName">Ad</Label>
            <Input id="firstName" {...register("firstName")} autoComplete="given-name" />
            {errors.firstName && (
              <span className="auth-error">{errors.firstName.message}</span>
            )}
          </div>
          <div className="auth-field">
            <Label htmlFor="lastName">Soyad</Label>
            <Input id="lastName" {...register("lastName")} autoComplete="family-name" />
            {errors.lastName && (
              <span className="auth-error">{errors.lastName.message}</span>
            )}
          </div>
        </div>

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

        <div className="auth-field">
          <Label htmlFor="password">Şifre</Label>
          <Input
            id="password"
            type="password"
            {...register("password")}
            autoComplete="new-password"
            placeholder="En az 8 karakter, büyük harf ve rakam"
          />
          {errors.password && (
            <span className="auth-error">{errors.password.message}</span>
          )}
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
