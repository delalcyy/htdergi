import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";

const patchSchema = z.object({
  isActive: z.boolean().optional(),
  orderIndex: z.number().int().min(0).optional(),
  name: z.string().min(1).max(100).optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const admin = await getSessionUser();
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Yetkisiz" }, { status: 403 });
  }

  const { id } = await params;
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false, error: "Geçersiz istek" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const template = await prisma.coverTemplate.findUnique({ where: { id } });
  if (!template) return NextResponse.json({ success: false, error: "Bulunamadı" }, { status: 404 });

  await prisma.coverTemplate.update({ where: { id }, data: parsed.data });

  await writeAuditLog({
    actorId: admin.id,
    action: "admin_template_updated",
    targetId: id,
    targetType: "CoverTemplate",
    meta: { changes: parsed.data },
  });

  return NextResponse.json({ success: true, data: null });
}
