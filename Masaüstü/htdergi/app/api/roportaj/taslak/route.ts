import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";

const schema = z.object({
  categoryId: z.string().uuid("Geçersiz kategori"),
  coverDraftId: z.string().optional().nullable(),
});

export async function POST(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) return NextResponse.json({ success: false, error: "Yetkisiz" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false, error: "Geçersiz istek" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  // Kategori aktif mi?
  const category = await prisma.interviewCategory.findUnique({
    where: { id: parsed.data.categoryId, isActive: true },
  });
  if (!category) {
    return NextResponse.json({ success: false, error: "Geçersiz kategori." }, { status: 400 });
  }

  const interviewDraft = await prisma.interviewDraft.create({
    data: {
      userId: user.id,
      categoryId: parsed.data.categoryId,
      coverDraftId: null,
      status: "DRAFT",
    },
  });

  await writeAuditLog({
    actorId: user.id,
    action: "interview_draft_created",
    targetId: interviewDraft.id,
    targetType: "InterviewDraft",
  });

  return NextResponse.json({ success: true, data: { id: interviewDraft.id } }, { status: 201 });
}
