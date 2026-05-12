import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createDiscountCodeSchema } from "@/lib/validation/admin";
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

  const parsed = createDiscountCodeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const existing = await prisma.discountCode.findUnique({ where: { code: parsed.data.code } });
  if (existing) {
    return NextResponse.json({ success: false, error: "Bu kod zaten mevcut." }, { status: 409 });
  }

  const code = await prisma.discountCode.create({
    data: {
      ...parsed.data,
      validFrom: parsed.data.validFrom ? new Date(parsed.data.validFrom) : null,
      validUntil: parsed.data.validUntil ? new Date(parsed.data.validUntil) : null,
      createdById: admin.id,
    },
  });

  await writeAuditLog({
    actorId: admin.id,
    action: "discount_code_created",
    targetId: code.id,
    targetType: "DiscountCode",
  });

  return NextResponse.json({ success: true, data: { id: code.id } }, { status: 201 });
}
