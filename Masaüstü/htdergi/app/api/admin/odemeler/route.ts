import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { getClientIp } from "@/lib/rate-limit";

const patchSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["PENDING", "COMPLETED", "FAILED", "REFUNDED"]),
});

export async function GET(request: NextRequest) {
  const admin = await getSessionUser(request);
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Yetkisiz" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const durum = searchParams.get("durum") || "ALL";
  const where = durum !== "ALL" ? { status: durum as "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED" } : {};

  const payments = await prisma.payment.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      userId: true,
      amount: true,
      currency: true,
      status: true,
      provider: true,
      providerPaymentId: true,
      createdAt: true,
      verifiedAt: true,
      user: { select: { id: true, email: true, firstName: true, lastName: true } },
    },
  });

  return NextResponse.json({ success: true, data: payments });
}

export async function PATCH(request: NextRequest) {
  const admin = await getSessionUser(request);
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

  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) {
    return NextResponse.json({ success: false, error: "Ödeme bulunamadı." }, { status: 404 });
  }

  await prisma.payment.update({
    where: { id },
    data: {
      status,
      verifiedAt: status === "COMPLETED" ? new Date() : undefined,
    },
  });

  await writeAuditLog({
    actorId: admin.id,
    action: "payment_completed",
    targetId: id,
    targetType: "Payment",
    ipAddress: ip,
    meta: { previousStatus: payment.status, newStatus: status },
  });

  return NextResponse.json({ success: true, data: null });
}
