import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, assertOwnership } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { coverDraftSchema } from "@/lib/validation/kapak";
import { writeAuditLog } from "@/lib/audit";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ success: false, error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;

  // Taslak sahibi mi? IDOR koruması
  const draft = await prisma.coverDraft.findUnique({ where: { id } });
  if (!draft) return NextResponse.json({ success: false, error: "Bulunamadı" }, { status: 404 });

  try {
    assertOwnership(draft.userId, user.id);
  } catch {
    return NextResponse.json({ success: false, error: "Yetkisiz" }, { status: 403 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false, error: "Geçersiz istek" }, { status: 400 });
  }

  const parsed = coverDraftSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  // templateId değiştirilmek isteniyorsa aktif mi kontrol et
  const template = await prisma.coverTemplate.findUnique({
    where: { id: parsed.data.templateId, isActive: true },
  });
  if (!template) {
    return NextResponse.json({ success: false, error: "Geçersiz şablon." }, { status: 400 });
  }

  // coverSerial kullanıcıdan ASLA alınmaz
  const updated = await prisma.coverDraft.update({
    where: { id },
    data: {
      templateId: parsed.data.templateId,
      title: parsed.data.title,
      subtitle: parsed.data.subtitle,
      personName: parsed.data.personName,
      dateLabel: parsed.data.dateLabel,
    },
  });

  await writeAuditLog({
    actorId: user.id,
    action: "cover_draft_updated",
    targetId: draft.id,
    targetType: "CoverDraft",
  });

  return NextResponse.json({ success: true, data: { id: updated.id } });
}

export async function GET(request: NextRequest, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ success: false, error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;

  const draft = await prisma.coverDraft.findUnique({
    where: { id },
    include: { template: true },
  });

  if (!draft) return NextResponse.json({ success: false, error: "Bulunamadı" }, { status: 404 });

  try {
    assertOwnership(draft.userId, user.id);
  } catch {
    return NextResponse.json({ success: false, error: "Yetkisiz" }, { status: 403 });
  }

  return NextResponse.json({ success: true, data: draft });
}
