"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { SessionUser } from "@/types";
import type { UserAddress } from "@prisma/client";

const profilSchema = z.object({
  firstName: z.string().min(2).max(50).regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, "Geçersiz karakter"),
  lastName: z.string().min(2).max(50).regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, "Geçersiz karakter"),
  phone: z.string().max(20).optional().nullable(),
  addressLine: z.string().min(5).max(200).optional().nullable(),
  city: z.string().max(50).optional().nullable(),
  district: z.string().max(50).optional().nullable(),
});

type ProfilInput = z.infer<typeof profilSchema>;

type Props = {
  user: SessionUser;
  address: UserAddress | null;
};

export default function ProfilForm({ user, address }: Props) {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfilInput>({
    resolver: zodResolver(profilSchema),
    defaultValues: {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phone: user.phone || "",
      addressLine: address?.addressLine || "",
      city: address?.city || "",
      district: address?.district || "",
    },
  });

  async function onSubmit(data: ProfilInput) {
    setMessage(null);
    const res = await fetch("/api/user/profil", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      setMessage({ type: "success", text: "Profil güncellendi." });
    } else {
      setMessage({ type: "error", text: json.error || "Hata oluştu." });
    }
  }

  return (
    <div className="panel-card">
      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"} style={{ marginBottom: "1.25rem" }}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <div>
            <Label htmlFor="firstName">Ad</Label>
            <Input id="firstName" {...register("firstName")} />
            {errors.firstName && <span style={{ fontSize: "0.75rem", color: "#dc2626" }}>{errors.firstName.message}</span>}
          </div>
          <div>
            <Label htmlFor="lastName">Soyad</Label>
            <Input id="lastName" {...register("lastName")} />
            {errors.lastName && <span style={{ fontSize: "0.75rem", color: "#dc2626" }}>{errors.lastName.message}</span>}
          </div>
        </div>

        <div>
          <Label htmlFor="phone">Telefon</Label>
          <Input id="phone" {...register("phone")} placeholder="05XX XXX XX XX" />
        </div>

        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "1rem", marginTop: "0.5rem" }}>
          <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.75rem" }}>Adres Bilgisi</p>

          <div style={{ marginBottom: "0.75rem" }}>
            <Label htmlFor="addressLine">Adres</Label>
            <Input id="addressLine" {...register("addressLine")} placeholder="Sokak, mahalle, bina no..." />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div>
              <Label htmlFor="city">Şehir</Label>
              <Input id="city" {...register("city")} />
            </div>
            <div>
              <Label htmlFor="district">İlçe</Label>
              <Input id="district" {...register("district")} />
            </div>
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting} style={{ alignSelf: "flex-start" }}>
          {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </form>
    </div>
  );
}
