import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";

/**
 * GELİŞTİRME ORTAMI İÇİN — production'da kaldırılmalı.
 * Gerçek ödeme sağlayıcısının webhook'u /api/odeme/webhook endpoint'ini kullanır.
 */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get("paymentId");
  const planId = searchParams.get("planId") || null;
  const type = searchParams.get("type") || "cover";
  const discountCodeId = searchParams.get("discountCodeId") || null;

  if (!paymentId) {
    return NextResponse.redirect(new URL("/panel", request.url));
  }

  // Ödemeyi tamamlandı işaretle ve abonelik/satın alım oluştur
  let affectedUserId = "";
  await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.update({
      where: { id: paymentId },
      data: { status: "COMPLETED", verifiedAt: new Date() },
    });
    affectedUserId = payment.userId;

    if (type === "subscription" && planId) {
      const plan = await tx.subscriptionPlan.findUnique({ where: { id: planId } });
      if (plan) {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
        const sub = await tx.subscription.create({
          data: {
            userId: payment.userId,
            planId,
            type: "NORMAL",
            status: "ACTIVE",
            startedAt: now,
            expiresAt,
            discountCodeId: discountCodeId || undefined,
          },
        });
        await tx.payment.update({
          where: { id: paymentId },
          data: { subscriptionId: sub.id },
        });
        await tx.user.update({
          where: { id: payment.userId },
          data: { role: "SUBSCRIBER" },
        });
      }
    } else {
      // Kapak satın alımı
      const purchase = await tx.coverPurchase.create({
        data: {
          userId: payment.userId,
          accessGranted: true,
          discountCodeId: discountCodeId || undefined,
        },
      });
      await tx.payment.update({
        where: { id: paymentId },
        data: { coverPurchaseId: purchase.id },
      });
      await tx.user.update({
        where: { id: payment.userId },
        data: { role: "COVER_BUYER" },
      });
    }

    // İndirim kodu kullanıldıysa kaydet
    if (discountCodeId) {
      await tx.discountCodeUsage.create({
        data: {
          discountCodeId,
          userId: payment.userId,
          paymentId,
        },
      });
      await tx.discountCode.update({
        where: { id: discountCodeId },
        data: { usedCount: { increment: 1 } },
      });
    }
  });

  if (affectedUserId) {
    await writeAuditLog({
      actorId: affectedUserId,
      action: "payment_completed",
      targetId: paymentId,
      targetType: "Payment",
    });
  }

  return NextResponse.redirect(new URL("/kapak-tasarla/editor", request.url));
}
