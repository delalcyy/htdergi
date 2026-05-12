"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validation/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ResetPasswordForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  async function onSubmit(data: ResetPasswordInput) {
    setServerError("");
    const token = new URLSearchParams(window.location.search).get("token") || "";
    const res = await fetch("/api/auth/sifremi-sifirla", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: data.password }),
    });
    if (!res.ok) {
      setServerError("Şifre güncellenirken hata oluştu. Bağlantı süresi dolmuş olabilir.");
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push("/auth/giris"), 3000);
  }

  if (success) {
    return (
      <div className="auth-card">
        <div className="auth-logo">
          <h1>Hatıra Dergi</h1>
        </div>
        <Alert>
          <AlertDescription>
            Şifreniz başarıyla güncellendi. Giriş sayfasına yönlendiriliyorsunuz...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <div className="auth-logo">
        <h1>Hatıra Dergi</h1>
      </div>

      <h2 className="auth-title">Yeni Şifre Belirle</h2>
      <p className="auth-subtitle">Güçlü bir şifre belirleyin</p>

      {serverError && (
        <Alert variant="destructive" className="auth-alert">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="auth-field">
          <Label htmlFor="password">Yeni Şifre</Label>
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

        <div className="auth-field">
          <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
          <Input
            id="confirmPassword"
            type="password"
            {...register("confirmPassword")}
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
            <span className="auth-error">{errors.confirmPassword.message}</span>
          )}
        </div>

        <Button type="submit" className="auth-submit" disabled={isSubmitting}>
          {isSubmitting ? "Güncelleniyor..." : "Şifreyi Güncelle"}
        </Button>
      </form>
    </div>
  );
}
