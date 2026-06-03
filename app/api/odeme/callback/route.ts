import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { checkoutFormRetrieve, LOCALE } from "@/lib/iyzico";
import { sendSubscriptionConfirmationEmail } from "@/lib/mail";

/**
 * İyzico'nun ödeme sonrası POST ettiği callback.
 * body: token=... (form-data)
 * query: type=subscription|cover &planId=...  &discountCodeId=...
 */
export async function POST(request: NextRequest) {
  const appUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const { searchParams } = new URL(request.url);

  const paymentIdParam = searchParams.get("paymentId") || null;
  const purchaseType = searchParams.get("type") || "cover";
  const planId = searchParams.get("planId") || null;
  const discountCodeId = searchParams.get("discountCodeId") || null;

  let token: string | null = null;
  try {
    const formData = await request.formData();
    token = formData.get("token") as string | null;
  } catch {
    token = searchParams.get("token");
  }

  if (!token) {
    // Tarayıcı GET redirect'i: token yok ama paymentId var — DB durumuna bak
    if (paymentIdParam) {
      try {
        const p = await prisma.payment.findUnique({ where: { id: paymentIdParam } });
        if (p?.status === "COMPLETED") {
          const tip = purchaseType === "subscription" ? "subscription" : "cover";
          return NextResponse.redirect(new URL(`/odeme-sonucu?durum=basarili&tip=${tip}`, appUrl), 303);
        }
        if (p?.status === "FAILED") {
          return NextResponse.redirect(new URL("/odeme-sonucu?durum=basarisiz", appUrl), 303);
        }
      } catch (err) {
        console.error("[odeme/callback] DB okuma hatası:", err);
      }
    }
    return NextResponse.redirect(new URL("/odeme-sonucu?durum=hata", appUrl), 303);
  }

  let iyzicoResult: Record<string, unknown>;
  try {
    iyzicoResult = await checkoutFormRetrieve({
      locale: LOCALE,
      conversationId: paymentIdParam || token,
      token,
    });
  } catch (err) {
    console.error("[odeme/callback] İyzico doğrulama hatası:", err);
    return NextResponse.redirect(new URL("/odeme-sonucu?durum=hata", appUrl), 303);
  }

  const paymentStatus = iyzicoResult.paymentStatus as string;
  const providerPaymentId = iyzicoResult.paymentId as string | undefined;

  // paymentId URL param'dan alınır — İyzico'nun conversationId echo'suna güvenme
  const resolvedId = paymentIdParam || (iyzicoResult.conversationId as string);

  let payment;
  try {
    payment = await prisma.payment.findUnique({ where: { id: resolvedId } });
  } catch (err) {
    console.error("[odeme/callback] Payment DB hatası:", err);
    return NextResponse.redirect(new URL("/odeme-sonucu?durum=hata", appUrl), 303);
  }

  if (!payment) {
    return NextResponse.redirect(new URL("/odeme-sonucu?durum=hata", appUrl), 303);
  }

  if (payment.status === "COMPLETED") {
    const tip = purchaseType === "subscription" ? "subscription" : "cover";
    return NextResponse.redirect(new URL(`/odeme-sonucu?durum=basarili&tip=${tip}`, appUrl), 303);
  }

  if (paymentStatus !== "SUCCESS") {
    try {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          providerPaymentId: providerPaymentId || null,
          providerResponse: iyzicoResult as object,
        },
      });
    } catch (err) {
      console.error("[odeme/callback] FAILED update hatası:", err);
    }
    return NextResponse.redirect(new URL("/odeme-sonucu?durum=basarisiz", appUrl), 303);
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "COMPLETED",
          verifiedAt: new Date(),
          providerPaymentId: providerPaymentId || null,
          providerResponse: iyzicoResult as object,
        },
      });

      if (purchaseType === "subscription" && planId) {
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
            where: { id: payment.id },
            data: { subscriptionId: sub.id },
          });
          await tx.user.update({
            where: { id: payment.userId },
            data: { role: "SUBSCRIBER" },
          });
        }
      } else {
        const purchase = await tx.coverPurchase.create({
          data: {
            userId: payment.userId,
            accessGranted: true,
            discountCodeId: discountCodeId || undefined,
          },
        });
        await tx.payment.update({
          where: { id: payment.id },
          data: { coverPurchaseId: purchase.id },
        });
        await tx.user.update({
          where: { id: payment.userId },
          data: { role: "COVER_BUYER" },
        });
      }

      if (discountCodeId) {
        await tx.discountCodeUsage.create({
          data: { discountCodeId, userId: payment.userId, paymentId: payment.id },
        });
        await tx.discountCode.update({
          where: { id: discountCodeId },
          data: { usedCount: { increment: 1 } },
        });
      }
    });
  } catch (err) {
    console.error("[odeme/callback] Transaction hatası:", err);
    return NextResponse.redirect(new URL("/odeme-sonucu?durum=hata", appUrl), 303);
  }

  try {
    await writeAuditLog({
      actorId: payment.userId,
      action: "payment_completed",
      targetId: payment.id,
      targetType: "Payment",
      meta: { provider: "iyzico", providerPaymentId },
    });
  } catch (err) {
    console.error("[odeme/callback] Audit log hatası:", err);
  }

  if (purchaseType === "subscription" && planId) {
    try {
      const user = await prisma.user.findUnique({ where: { id: payment.userId } });
      const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
      const sub = await prisma.subscription.findFirst({
        where: { userId: payment.userId, planId },
        orderBy: { startedAt: "desc" },
      });
      if (user && plan && sub) {
        await sendSubscriptionConfirmationEmail({
          to: user.email,
          name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email,
          planName: plan.name,
          expiresAt: sub.expiresAt,
        });
      }
    } catch (err) {
      console.error("[odeme/callback] Abonelik maili hatası:", err);
    }
  }

  const tip = purchaseType === "subscription" ? "subscription" : "cover";
  return NextResponse.redirect(new URL(`/odeme-sonucu?durum=basarili&tip=${tip}`, appUrl), 303);
}

// İyzico bazen GET ile de callback yapabilir
export async function GET(request: NextRequest) {
  return POST(request);
}
