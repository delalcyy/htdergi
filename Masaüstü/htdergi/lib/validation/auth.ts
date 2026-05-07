import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, "E-posta zorunludur")
    .email("Geçerli bir e-posta adresi girin")
    .max(255, "E-posta çok uzun"),
  password: z
    .string()
    .min(8, "Şifre en az 8 karakter olmalıdır")
    .max(72, "Şifre çok uzun")
    .regex(/[A-Z]/, "En az bir büyük harf içermeli")
    .regex(/[0-9]/, "En az bir rakam içermeli"),
  firstName: z
    .string()
    .min(2, "Ad en az 2 karakter olmalıdır")
    .max(50, "Ad çok uzun")
    .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, "Geçersiz karakter"),
  lastName: z
    .string()
    .min(2, "Soyad en az 2 karakter olmalıdır")
    .max(50, "Soyad çok uzun")
    .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, "Geçersiz karakter"),
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
