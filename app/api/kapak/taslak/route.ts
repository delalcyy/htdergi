import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser, hasEditorAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateUserSerial } from "@/lib/cover-serial";
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

  const template = await prisma.coverTemplate.findUnique({
    where: { id: parsed.data.templateId, isActive: true },
  });
  if (!template) {
    return NextResponse.json({ success: false, error: "Geçersiz veya devre dışı şablon." }, { status: 400 });
  }

  /* Kullanıcının kalıcı seri numarasını al veya üret */
  let dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { seriNo: true } });
  let coverSerial = dbUser?.seriNo ?? null;

  if (!coverSerial) {
    // Benzersiz olana kadar üret
    for (let i = 0; i < 10; i++) {
      const candidate = generateUserSerial();
      const existing = await prisma.user.findUnique({ where: { seriNo: candidate } });
      if (!existing) { coverSerial = candidate; break; }
    }
    if (!coverSerial) coverSerial = generateUserSerial();
    await prisma.user.update({ where: { id: user.id }, data: { seriNo: coverSerial } });
  }

  const draft = await prisma.coverDraft.create({
    data: {
      userId: user.id,
      templateId: template.id,
      coverSerial,
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
