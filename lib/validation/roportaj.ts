import { z } from "zod";

export const interviewAnswerSchema = z.object({
  questionId: z.string().uuid("Geçersiz soru ID"),
  answerText: z
    .string()
    .max(2000, "Cevap en fazla 2000 karakter olabilir")
    .optional()
    .nullable(),
  imageUrl: z.string().url("Geçersiz görsel URL").optional().nullable(),
});

export const saveInterviewSchema = z.object({
  categoryId: z.string().uuid("Geçersiz kategori"),
  coverDraftId: z.string().uuid("Geçersiz kapak taslağı").optional().nullable(),
  answers: z.array(interviewAnswerSchema).max(50),
});

export type SaveInterviewInput = z.infer<typeof saveInterviewSchema>;
