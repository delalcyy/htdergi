import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { getClientIp } from "@/lib/rate-limit";

const patchSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
  role: z.enum(["FREE", "SUBSCRIBER", "SERIAL_USER", "COVER_BUYER"]).optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const admin = await getSessionUser(request);
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Yetkisiz" }, { status: 403 });
  }

  const { id } = await params;
  const ip = getClientIp(request);

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false, error: "Geçersiz istek" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Geçersiz veri" }, { status: 400 });
  }

  // Admin kendi hesabını değiştiremez
  if (id === admin.id) {
    return NextResponse.json({ success: false, error: "Kendi hesabınızı değiştiremezsiniz." }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id, deletedAt: null } });
  if (!target) return NextResponse.json({ success: false, error: "Kullanıcı bulunamadı" }, { status: 404 });

  // Başka admin'in rolünü değiştiremez
  if (target.role === "ADMIN") {
    return NextResponse.json({ success: false, error: "Admin rolü değiştirilemez." }, { status: 403 });
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.status) updateData.status = parsed.data.status;
  if (parsed.data.role) updateData.role = parsed.data.role;

  await prisma.user.update({ where: { id }, data: updateData });

  await writeAuditLog({
    actorId: admin.id,
    action: parsed.data.role ? "admin_changed_role" : "user_suspended",
    targetId: id,
    targetType: "User",
    ipAddress: ip,
    meta: { changes: updateData },
  });

  return NextResponse.json({ success: true, data: null });
}
