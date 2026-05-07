"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/panel";
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setServerError("");

    const res = await fetch("/api/auth/giris", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email, password: data.password }),
    });

    const json = await res.json();

    if (!json.success) {
      if (json.error === "email_not_confirmed") {
        setServerError("E-posta adresiniz doğrulanmamış. Lütfen e-postanızı kontrol edin.");
      } else if (json.error === "invalid_credentials") {
        setServerError("E-posta veya şifre hatalı.");
      } else if (res.status === 429) {
        setServerError(json.error || "Çok fazla deneme. Lütfen bekleyin.");
      } else {
        setServerError("Giriş sırasında hata oluştu. Lütfen tekrar deneyin.");
      }
      return;
    }

    const safeFrom = from.startsWith("/") ? from : "/panel";
    router.push(safeFrom);
    router.refresh();
  }

  return (
    <div className="auth-card">
      <div className="auth-logo">
        <h1>Hatıra Dergi</h1>
        <p>Kendi derginizi oluşturun</p>
      </div>

      <h2 className="auth-title">Giriş Yap</h2>
      <p className="auth-subtitle">Hesabınıza erişin</p>

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

        <div className="auth-field">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Label htmlFor="password">Şifre</Label>
            <Link href="/auth/sifremi-unuttum" className="auth-forgot" style={{ fontSize: "0.8125rem", color: "#6b7280", textDecoration: "underline" }}>
              Şifremi unuttum
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            {...register("password")}
            autoComplete="current-password"
          />
          {errors.password && (
            <span className="auth-error">{errors.password.message}</span>
          )}
        </div>

        <Button type="submit" className="auth-submit" disabled={isSubmitting}>
          {isSubmitting ? "Giriş yapılıyor..." : "Giriş Yap"}
        </Button>
      </form>

      <div className="auth-divider">
        Hesabınız yok mu? <Link href="/auth/kayit">Kayıt olun</Link>
      </div>
    </div>
  );
}
