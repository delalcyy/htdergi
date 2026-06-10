import { z } from "zod";

export const coverDraftSchema = z.object({
  templateId: z.string().uuid("Geçersiz şablon"),
  title: z.string().max(80, "Başlık en fazla 80 karakter").optional().nullable(),
  subtitle: z.string().max(120, "Alt başlık en fazla 120 karakter").optional().nullable(),
  personName: z.string().max(60, "Ad soyad en fazla 60 karakter").optional().nullable(),
  dateLabel: z.string().max(30, "Tarih alanı en fazla 30 karakter").optional().nullable(),
});

export const infoFormSchema = z.object({
  fullName: z
    .string()
    .min(3, "Ad soyad en az 3 karakter")
    .max(100)
    .regex(/^[\p{L}\s]+$/u, "Geçersiz karakter"),
  phone: z
    .string()
    .min(10, "Geçerli bir telefon numarası girin")
    .max(20)
    .regex(/^[0-9\s\+\-\(\)]+$/, "Geçersiz telefon formatı"),
  addressLine: z.string().min(5, "Adres en az 5 karakter").max(200),
  city: z.string().min(2, "Şehir zorunludur").max(50),
  district: z.string().min(2, "İlçe zorunludur").max(50),
  postalCode: z
    .string()
    .min(1, "Posta kodu zorunludur")
    .regex(/^[0-9]{5}$/, "Posta kodu 5 rakam olmalıdır"),
});

export type CoverDraftInput = z.infer<typeof coverDraftSchema>;
export type InfoFormInput = z.infer<typeof infoFormSchema>;
