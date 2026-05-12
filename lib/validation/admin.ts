import { z } from "zod";

export const createSerialBatchSchema = z.object({
  count: z.number().int().min(1).max(500, "Bir seferde en fazla 500 kod"),
  durationDays: z.number().int().min(1).max(3650).default(365),
  batchLabel: z.string().min(1, "Batch etiketi zorunludur").max(100),
});

export const createDiscountCodeSchema = z.object({
  code: z
    .string()
    .min(4, "Kod en az 4 karakter")
    .max(30, "Kod en fazla 30 karakter")
    .regex(/^[A-Z0-9_\-]+$/, "Sadece büyük harf, rakam, _ ve - kullanılabilir"),
  discountType: z.enum(["PERCENT", "FIXED"]),
  discountValue: z.number().positive("İndirim değeri pozitif olmalıdır"),
  validFor: z.enum(["ALL", "SUBSCRIPTION", "COVER_ONLY"]).default("ALL"),
  planId: z.string().uuid().optional().nullable(),
  maxUsage: z.number().int().positive().optional().nullable(),
  validFrom: z.string().datetime().optional().nullable(),
  validUntil: z.string().datetime().optional().nullable(),
});

export const createTemplateSchema = z.object({
  name: z.string().min(1, "Şablon adı zorunludur").max(100),
  previewUrl: z.string().url("Geçerli bir URL girin"),
  orderIndex: z.number().int().min(0).default(0),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, "Kategori adı zorunludur").max(100),
  description: z.string().max(300).optional().nullable(),
  orderIndex: z.number().int().min(0).default(0),
});

export const createQuestionSchema = z.object({
  categoryId: z.string().uuid("Geçersiz kategori"),
  body: z.string().min(3, "Soru metni en az 3 karakter").max(500),
  orderIndex: z.number().int().min(0).default(0),
});

export type CreateSerialBatchInput = z.infer<typeof createSerialBatchSchema>;
export type CreateDiscountCodeInput = z.infer<typeof createDiscountCodeSchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
