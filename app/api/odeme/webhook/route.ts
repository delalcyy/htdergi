import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";

/**
 * Ödeme sağlayıcısının webhook endpoint'i.
 * Frontend'den BAĞIMSIZ — ödeme durumu sadece buradan güncellenir.
 */
export async function POST(request: NextRequest) {
  // İmza doğrulama — iyzico webhook imzası
  const webhookSecret = process.env.IYZICO_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[Webhook] IYZICO_WEBHOOK_SECRET tanımlı değil");
    return NextResponse.json({ error: "Config error" }, { status: 500 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-iyz-signature") || "";

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = event.iyziEventType as string || event.eventType as string;
  const referenceCode = event.iyziReferenceCode as string || "";
  const status = event.status as string;
  const paymentId = event.paymentId as string || event.iyziReferenceCode as string;

  // İyzico webhook imzası: HMAC-SHA256(secret, [secret, eventType, referenceCode, status].join(':'))
  const expectedSig = createHmac("sha256", webhookSecret)
    .update([webhookSecret, eventType, referenceCode, status].join(":"))
    .digest("hex");

  if (!signature || signature !== expectedSig) {
    console.warn("[Webhook] Geçersiz veya eksik imza");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (!paymentId) {
    return NextResponse.json({ received: true });
  }

  // Idempotency: aynı ödeme iki kez işlenmesin
  const payment = await prisma.payment.findUnique({ where: { providerPaymentId: paymentId } });
  if (payment?.status === "COMPLETED") {
    return NextResponse.json({ received: true });
  }

  if (eventType === "PAYMENT_SUCCESS" || status === "SUCCESS") {
    let affectedUserId = "";

    await prisma.$transaction(async (tx) => {
      const p = await tx.payment.findFirst({ where: { providerPaymentId: paymentId } });
      if (!p || p.status === "COMPLETED") return;

      affectedUserId = p.userId;

      await tx.payment.update({
        where: { id: p.id },
        data: {
          status: "COMPLETED",
          verifiedAt: new Date(),
          providerResponse: event as object,
        },
      });

      // Abonelik veya satın alım aktive et — hangi kayıtla ilişkili?
      if (p.subscriptionId) {
        await tx.subscription.update({
          where: { id: p.subscriptionId },
          data: { status: "ACTIVE", startedAt: new Date() },
        });
        const sub = await tx.subscription.findUnique({ where: { id: p.subscriptionId } });
        if (sub) {
          await tx.user.update({
            where: { id: sub.userId },
            data: { role: "SUBSCRIBER" },
          });
        }
      } else if (p.coverPurchaseId) {
        await tx.coverPurchase.update({
          where: { id: p.coverPurchaseId },
          data: { accessGranted: true },
        });
        const purchase = await tx.coverPurchase.findUnique({ where: { id: p.coverPurchaseId } });
        if (purchase) {
          await tx.user.update({
            where: { id: purchase.userId },
            data: { role: "COVER_BUYER" },
          });
        }
      }
    });

    if (affectedUserId) {
      await writeAuditLog({
        actorId: affectedUserId,
        action: "payment_completed",
        targetId: paymentId,
        targetType: "Payment",
        meta: { eventType, source: "webhook" },
      });
    }
  } else if (eventType === "PAYMENT_FAILED" || status === "FAILURE") {
    const p = await prisma.payment.findFirst({ where: { providerPaymentId: paymentId } });

    await prisma.payment.updateMany({
      where: { providerPaymentId: paymentId },
      data: { status: "FAILED", providerResponse: event as object },
    });

    if (p) {
      await writeAuditLog({
        actorId: p.userId,
        action: "payment_failed",
        targetId: paymentId,
        targetType: "Payment",
        meta: { eventType, source: "webhook" },
      });
    }
  }

  return NextResponse.json({ received: true });
}
