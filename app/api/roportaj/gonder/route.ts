import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { moderateTexts } from "@/lib/moderation/textModeration";

const schema = z.object({
  ad:           z.string().max(60).optional().default(""),
  soyad:        z.string().max(60).optional().default(""),
  categoryName: z.string().min(1, "Kategori seçilmedi"),
  answers:      z.record(z.string(), z.string()),
});

export async function POST(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) return NextResponse.json({ success: false, error: "Giriş yapmanız gerekiyor." }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false, error: "Geçersiz istek." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const { categoryName, answers } = parsed.data;

  if (moderateTexts([parsed.data.ad, parsed.data.soyad, ...Object.values(answers)])) {
    return NextResponse.json({ success: false, error: "Bu içerik yayın kurallarımıza uygun değil." }, { status: 400 });
  }

  const category = await prisma.interviewCategory.findFirst({
    where: { name: categoryName, isActive: true },
    include: {
      questions: { where: { isActive: true }, orderBy: { orderIndex: "asc" } },
    },
  });
  if (!category) {
    return NextResponse.json({ success: false, error: "Geçersiz kategori." }, { status: 400 });
  }

  const draft = await prisma.interviewDraft.create({
    data: {
      userId:    user.id,
      categoryId: category.id,
      coverDraftId: null,
      status:    "COMPLETED",
    },
  });

  // answers key formatı: "bd-01" → index = 0 → category.questions[0].id
  const answerRows = category.questions.map((q, idx) => {
    const prefix = categoryName === "Doğum Günü" ? "bd"
                 : categoryName === "Evlilik"    ? "ev"
                 : categoryName === "Kariyer"    ? "kr"
                 : categoryName === "Bebek"      ? "bb"
                 : "mz";
    const key = `${prefix}-${String(idx + 1).padStart(2, "0")}`;
    return {
      id:              crypto.randomUUID(),
      interviewDraftId: draft.id,
      questionId:      q.id,
      answerText:      answers[key]?.trim() || null,
    };
  }).filter(r => r.answerText);

  if (answerRows.length > 0) {
    await prisma.interviewAnswer.createMany({ data: answerRows });
  }

  await writeAuditLog({
    actorId:    user.id,
    action:     "interview_draft_created",
    targetId:   draft.id,
    targetType: "InterviewDraft",
  });

  return NextResponse.json({ success: true, data: { id: draft.id } }, { status: 201 });
}
