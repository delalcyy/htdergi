import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTemplateSchema } from "@/lib/validation/admin";
import { writeAuditLog } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const admin = await getSessionUser(request);
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Yetkisiz" }, { status: 403 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false, error: "Geçersiz istek" }, { status: 400 });
  }

  const parsed = createTemplateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const template = await prisma.coverTemplate.create({ data: parsed.data });

  await writeAuditLog({
    actorId: admin.id,
    action: "admin_template_created",
    targetId: template.id,
    targetType: "CoverTemplate",
  });

  return NextResponse.json({ success: true, data: { id: template.id } }, { status: 201 });
}
