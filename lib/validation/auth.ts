import { z } from "zod";

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(2, "Ad en az 2 karakter olmalıdır")
    .max(50, "Ad çok uzun")
    .regex(/^[\p{L}\s]+$/u, "Geçersiz karakter"),
  lastName: z
    .string()
    .min(2, "Soyad en az 2 karakter olmalıdır")
    .max(50, "Soyad çok uzun")
    .regex(/^[\p{L}\s]+$/u, "Geçersiz karakter"),
  email: z
    .string()
    .min(1, "E-posta zorunludur")
    .email("Geçerli bir e-posta adresi girin")
    .max(255, "E-posta çok uzun"),
  phone: z
    .string()
    .min(10, "Geçerli bir telefon girin")
    .max(20, "Telefon çok uzun")
    .regex(/^[0-9+\s\-()]+$/, "Geçersiz telefon formatı"),
  birthDate: z
    .string()
    .min(1, "Doğum tarihi zorunludur")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Geçerli bir tarih seçin")
    .refine((v) => {
      const d = new Date(v);
      if (isNaN(d.getTime())) return false;
      const age = Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      return age >= 6 && age <= 120;
    }, "Geçerli bir doğum tarihi girin"),
  city: z
    .string()
    .min(2, "İl zorunludur")
    .max(80, "İl çok uzun"),
  district: z
    .string()
    .min(2, "İlçe zorunludur")
    .max(80, "İlçe çok uzun"),
  supportedTeam: z
    .string()
    .max(100, "Takım adı çok uzun")
    .refine(
      (v) => v === "" || v.length >= 2,
      "En az 2 karakter giriniz"
    ),
  password: z
    .string()
    .min(8, "Şifre en az 8 karakter olmalıdır")
    .max(72, "Şifre çok uzun")
    .regex(/[A-Z]/, "En az bir büyük harf içermeli")
    .regex(/[0-9]/, "En az bir rakam içermeli"),
  emailMarketingConsent: z.boolean().optional().default(false),
});

export const loginSchema = z.object({
  email: z.string().min(1, "E-posta zorunludur").email("Geçerli bir e-posta girin"),
  password: z.string().min(1, "Şifre zorunludur").max(72),
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "E-posta zorunludur").email("Geçerli bir e-posta girin"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Şifre en az 8 karakter olmalıdır")
      .max(72, "Şifre çok uzun")
      .regex(/[A-Z]/, "En az bir büyük harf içermeli")
      .regex(/[0-9]/, "En az bir rakam içermeli"),
    confirmPassword: z.string().min(1, "Şifre tekrarı zorunludur"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
