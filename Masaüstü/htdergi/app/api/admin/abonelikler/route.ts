import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { getClientIp } from "@/lib/rate-limit";

const patchSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["ACTIVE", "EXPIRED", "CANCELLED"]),
});

export async function GET(request: NextRequest) {
  const admin = await getSessionUser();
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Yetkisiz" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const tur = searchParams.get("tur") || "ALL";
  const where = tur !== "ALL" ? { type: tur as "NORMAL" | "SERIAL" | "COVER_ONLY" } : {};

  const subscriptions = await prisma.subscription.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true } },
      plan: { select: { name: true } },
    },
  });

  return NextResponse.json({ success: true, data: subscriptions });
}

export async function PATCH(request: NextRequest) {
  const admin = await getSessionUser();
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Yetkisiz" }, { status: 403 });
  }

  const ip = getClientIp(request);

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false, error: "Geçersiz istek" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const { id, status } = parsed.data;

  const subscription = await prisma.subscription.findUnique({ where: { id } });
  if (!subscription) {
    return NextResponse.json({ success: false, error: "Abonelik bulunamadı." }, { status: 404 });
  }

  await prisma.subscription.update({ where: { id }, data: { status } });

  await writeAuditLog({
    actorId: admin.id,
    action: "subscription_cancelled",
    targetId: id,
    targetType: "Subscription",
    ipAddress: ip,
    meta: { previousStatus: subscription.status, newStatus: status },
  });

  return NextResponse.json({ success: true, data: null });
}
