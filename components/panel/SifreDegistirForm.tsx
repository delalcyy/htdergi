"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

const schema = z.object({
  currentPassword: z.string().min(1, "Mevcut şifre zorunludur"),
  newPassword: z.string().min(8, "En az 8 karakter").max(72),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

type Input = z.infer<typeof schema>;

export default function SifreDegistirForm() {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Input>({ resolver: zodResolver(schema) });

  async function onSubmit(data: Input) {
    setMessage(null);
    const res = await fetch("/api/user/sifre-degistir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: data.currentPassword, newPassword: data.newPassword }),
    });
    const json = await res.json();
    if (json.success) {
      setMessage({ type: "success", text: "Şifreniz başarıyla güncellendi." });
      reset();
    } else {
      setMessage({ type: "error", text: json.error || "Hata oluştu." });
    }
  }

  return (
    <div className="panel-card" style={{ maxWidth: 480 }}>
      <div className="panel-card-title">Şifre Değiştir</div>

      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"} style={{ marginBottom: "1rem" }}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <Label htmlFor="currentPassword">Mevcut Şifre</Label>
          <Input
            id="currentPassword"
            type="password"
            {...register("currentPassword")}
            autoComplete="current-password"
            style={{ marginTop: "0.375rem" }}
          />
          {errors.currentPassword && (
            <span style={{ fontSize: "0.8125rem", color: "#dc2626", marginTop: "0.25rem", display: "block" }}>
              {errors.currentPassword.message}
            </span>
          )}
        </div>

        <div>
          <Label htmlFor="newPassword">Yeni Şifre</Label>
          <Input
            id="newPassword"
            type="password"
            {...register("newPassword")}
            autoComplete="new-password"
            placeholder="En az 8 karakter"
            style={{ marginTop: "0.375rem" }}
          />
          {errors.newPassword && (
            <span style={{ fontSize: "0.8125rem", color: "#dc2626", marginTop: "0.25rem", display: "block" }}>
              {errors.newPassword.message}
            </span>
          )}
        </div>

        <div>
          <Label htmlFor="confirmPassword">Yeni Şifre Tekrar</Label>
          <Input
            id="confirmPassword"
            type="password"
            {...register("confirmPassword")}
            autoComplete="new-password"
            style={{ marginTop: "0.375rem" }}
          />
          {errors.confirmPassword && (
            <span style={{ fontSize: "0.8125rem", color: "#dc2626", marginTop: "0.25rem", display: "block" }}>
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting} style={{ alignSelf: "flex-start" }}>
          {isSubmitting ? "Kaydediliyor..." : "Şifreyi Güncelle"}
        </Button>
      </form>
    </div>
  );
}
