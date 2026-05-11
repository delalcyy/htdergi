import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser, hasEditorAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCoverSerial } from "@/lib/cover-serial";
import { writeAuditLog } from "@/lib/audit";

const createSchema = z.object({
  templateId: z.string().uuid("Geçersiz şablon ID"),
});

export async function POST(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) return NextResponse.json({ success: false, error: "Yetkisiz" }, { status: 401 });

  const hasAccess = await hasEditorAccess(user.id);
  if (!hasAccess) {
    return NextResponse.json({ success: false, error: "Editör erişiminiz yok." }, { status: 403 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false, error: "Geçersiz istek" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  // Şablon aktif mi? Kullanıcıdan gelen ID'ye güvenmeden doğrula
  const template = await prisma.coverTemplate.findUnique({
    where: { id: parsed.data.templateId, isActive: true },
  });
  if (!template) {
    return NextResponse.json({ success: false, error: "Geçersiz veya devre dışı şablon." }, { status: 400 });
  }

  // Kapak seri numarasını server-side üret — kullanıcı belirleyemez
  let coverSerial: string;
  let attempts = 0;
  do {
    coverSerial = generateCoverSerial();
    const existing = await prisma.coverDraft.findUnique({ where: { coverSerial } });
    if (!existing) break;
    attempts++;
  } while (attempts < 5);

  const draft = await prisma.coverDraft.create({
    data: {
      userId: user.id,
      templateId: template.id,
      coverSerial: coverSerial!,
      status: "DRAFT",
    },
  });

  await writeAuditLog({
    actorId: user.id,
    action: "cover_draft_created",
    targetId: draft.id,
    targetType: "CoverDraft",
  });

  return NextResponse.json({ success: true, data: { id: draft.id } }, { status: 201 });
}
