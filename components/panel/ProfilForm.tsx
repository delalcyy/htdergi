"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IL_LISTESI, ILLER, TAKIMLAR } from "@/lib/data/turkiye";
import type { SessionUser } from "@/types";

const schema = z.object({
  firstName: z.string().min(2, "En az 2 karakter").max(50).regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, "Geçersiz karakter"),
  lastName:  z.string().min(2, "En az 2 karakter").max(50).regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, "Geçersiz karakter"),
  phone:         z.string().max(20).optional().nullable(),
  age:           z.number().int().min(1).max(120).optional().nullable(),
  city:          z.string().max(80).optional().nullable(),
  district:      z.string().max(80).optional().nullable(),
  supportedTeam: z.string().max(100).optional().nullable(),
});

type ProfilInput = z.infer<typeof schema>;

const sel = "w-full border border-input bg-background px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed";

function Row({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div style={{ display: "flex", padding: "0.625rem 0", borderBottom: "1px solid #f3f4f6", gap: "1rem" }}>
      <span style={{ width: "9rem", flexShrink: 0, fontSize: "0.8125rem", color: "#6b7280", fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: "0.9375rem", color: "#111827" }}>{value || <span style={{ color: "#d1d5db" }}>—</span>}</span>
    </div>
  );
}

export default function ProfilForm({ user }: { user: SessionUser }) {
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [selectedCity, setSelectedCity] = useState(user.city || "");
  const [teamOption, setTeamOption] = useState(() => {
    if (!user.supportedTeam) return "__none__";
    if (TAKIMLAR.includes(user.supportedTeam)) return user.supportedTeam;
    return "Diğer";
  });

  const ilceler = selectedCity ? (ILLER[selectedCity] ?? []).sort((a, b) => a.localeCompare(b, "tr")) : [];

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfilInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName:     user.firstName     || "",
      lastName:      user.lastName      || "",
      phone:         user.phone         || "",
      age:           user.age           ?? undefined,
      city:          user.city          || "",
      district:      user.district      || "",
      supportedTeam: user.supportedTeam || "",
    },
  });

  const cityReg = register("city");

  function handleCancel() {
    reset();
    setSelectedCity(user.city || "");
    setTeamOption(() => {
      if (!user.supportedTeam) return "__none__";
      if (TAKIMLAR.includes(user.supportedTeam)) return user.supportedTeam;
      return "Diğer";
    });
    setMessage(null);
    setEditing(false);
  }

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
      setEditing(false);
    } else {
      setMessage({ type: "error", text: json.error || "Hata oluştu." });
    }
  }

  const teamDisplay = !user.supportedTeam ? "—" :
    user.supportedTeam === "" ? "Takım tutmuyorum" : user.supportedTeam;

  if (!editing) {
    return (
      <div className="panel-card">
        {message?.type === "success" && (
          <Alert style={{ marginBottom: "1.25rem" }}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <Row label="Ad"             value={user.firstName} />
        <Row label="Soyad"          value={user.lastName} />
        <Row label="E-posta"        value={user.email} />
        <Row label="Telefon"        value={user.phone} />
        <Row label="Yaş"            value={user.age} />
        <Row label="İl"             value={user.city} />
        <Row label="İlçe"           value={user.district} />
        <Row label="Takım"          value={teamDisplay} />

        <div style={{ marginTop: "1.25rem" }}>
          <Button onClick={() => { setMessage(null); setEditing(true); }}>
            Düzenle
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="panel-card">
      {message?.type === "error" && (
        <Alert variant="destructive" style={{ marginBottom: "1.25rem" }}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>

        {/* Ad / Soyad */}
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

        {/* E-posta (salt okunur) */}
        <div>
          <Label>E-posta</Label>
          <Input value={user.email} disabled style={{ opacity: 0.6, cursor: "not-allowed" }} />
          <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>E-posta adresi değiştirilemez.</span>
        </div>

        {/* Telefon */}
        <div>
          <Label htmlFor="phone">Telefon</Label>
          <Input id="phone" {...register("phone")} placeholder="05XX XXX XX XX" />
        </div>

        {/* Yaş */}
        <div>
          <Label htmlFor="age">Yaş</Label>
          <Input id="age" type="number" min={1} max={120} {...register("age", { valueAsNumber: true })} />
          {errors.age && <span style={{ fontSize: "0.75rem", color: "#dc2626" }}>{errors.age.message}</span>}
        </div>

        {/* İl */}
        <div>
          <Label htmlFor="city">İl</Label>
          <select
            id="city"
            className={sel}
            {...cityReg}
            onChange={(e) => {
              cityReg.onChange(e);
              setSelectedCity(e.target.value);
              setValue("district", "", { shouldValidate: false });
            }}
          >
            <option value="">— İl seçin —</option>
            {IL_LISTESI.map(il => <option key={il} value={il}>{il}</option>)}
          </select>
        </div>

        {/* İlçe */}
        <div>
          <Label htmlFor="district">İlçe</Label>
          <select id="district" className={sel} disabled={!selectedCity} {...register("district")}>
            <option value="">{selectedCity ? "— İlçe seçin —" : "Önce il seçin"}</option>
            {ilceler.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>

        {/* Takım */}
        <div>
          <Label htmlFor="teamSelect">Tuttuğunuz Takım</Label>
          <select
            id="teamSelect"
            className={sel}
            value={teamOption}
            onChange={(e) => {
              const val = e.target.value;
              setTeamOption(val);
              if (val === "__none__") setValue("supportedTeam", "", { shouldValidate: true });
              else if (val !== "Diğer") setValue("supportedTeam", val, { shouldValidate: true });
              else setValue("supportedTeam", "", { shouldValidate: false });
            }}
          >
            <option value="">— Takım seçin —</option>
            <option value="__none__">Takım tutmuyorum</option>
            {TAKIMLAR.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {teamOption === "Diğer" && (
            <Input
              {...register("supportedTeam")}
              placeholder="Takımınızın adını yazın"
              autoComplete="off"
              style={{ marginTop: "0.5rem" }}
            />
          )}
        </div>

        {/* Butonlar */}
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
          </Button>
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            İptal
          </Button>
        </div>
      </form>
    </div>
  );
}
