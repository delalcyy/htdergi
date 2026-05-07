import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser, assertOwnership } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const answerSchema = z.object({
  questionId: z.string().uuid(),
  answerText: z.string().max(2000).optional().nullable(),
});

const updateSchema = z.object({
  answers: z.array(answerSchema).max(50),
  status: z.enum(["DRAFT", "COMPLETED"]).optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ success: false, error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;

  const interviewDraft = await prisma.interviewDraft.findUnique({
    where: { id },
    include: { category: { include: { questions: { where: { isActive: true } } } } },
  });
  if (!interviewDraft) return NextResponse.json({ success: false, error: "Bulunamadı" }, { status: 404 });

  try {
    assertOwnership(interviewDraft.userId, user.id);
  } catch {
    return NextResponse.json({ success: false, error: "Yetkisiz" }, { status: 403 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false, error: "Geçersiz istek" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  // Sadece bu categorye ait aktif soru ID'lerini kabul et
  const validQuestionIds = new Set(interviewDraft.category.questions.map((q) => q.id));

  await prisma.$transaction(async (tx) => {
    for (const ans of parsed.data.answers) {
      if (!validQuestionIds.has(ans.questionId)) continue; // Yabancı soru ID'sini reddet

      await tx.interviewAnswer.upsert({
        where: {
          interviewDraftId_questionId: {
            interviewDraftId: id,
            questionId: ans.questionId,
          },
        },
        create: {
          interviewDraftId: id,
          questionId: ans.questionId,
          answerText: ans.answerText || null,
        },
        update: {
          answerText: ans.answerText || null,
        },
      });
    }

    if (parsed.data.status) {
      await tx.interviewDraft.update({
        where: { id },
        data: { status: parsed.data.status },
      });
    }
  });

  return NextResponse.json({ success: true, data: null });
}
