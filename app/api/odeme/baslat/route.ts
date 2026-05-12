import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/rate-limit";
import { checkoutFormInitialize, LOCALE, CURRENCY, BASKET_ITEM_TYPE } from "@/lib/iyzico";

const schema = z.object({
  planId: z.string().uuid().optional().nullable(),
  purchaseType: z.enum(["subscription", "cover"]),
  discountCodeId: z.string().uuid().optional().nullable(),
});

const COVER_PRICE = 299;

export async function POST(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) return NextResponse.json({ success: false, error: "Yetkisiz" }, { status: 401 });

  const ip = getClientIp(request);

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false, error: "Geçersiz istek" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Geçersiz veri" }, { status: 400 });
  }

  const { planId, purchaseType, discountCodeId } = parsed.data;

  // Fiyatı backend'de hesapla — frontend'den gelen tutara güvenme
  let baseAmount = COVER_PRICE;
  let plan = null;
  let itemName = "Kapak Tasarım";

  if (planId) {
    plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId, isActive: true },
    });
    if (!plan) return NextResponse.json({ success: false, error: "Geçersiz plan" }, { status: 400 });
    baseAmount = Number(plan.price);
    itemName = `Abonelik: ${plan.name}`;
  }

  // İndirim kodu kontrolü — yeniden doğrula
  let discountAmount = 0;
  let discountCode = null;
  if (discountCodeId) {
    const now = new Date();
    discountCode = await prisma.discountCode.findUnique({ where: { id: discountCodeId } });

    if (!discountCode || !discountCode.isActive) {
      return NextResponse.json({ success: false, error: "İndirim kodu artık geçerli değil." }, { status: 400 });
    }
    if (discountCode.validUntil && discountCode.validUntil < now) {
      return NextResponse.json({ success: false, error: "İndirim kodunun süresi doldu." }, { status: 400 });
    }
    if (discountCode.maxUsage !== null && discountCode.usedCount >= discountCode.maxUsage) {
      return NextResponse.json({ success: false, error: "İndirim kodu kullanım limitine ulaştı." }, { status: 400 });
    }
    const alreadyUsed = await prisma.discountCodeUsage.findFirst({
      where: { discountCodeId: discountCode.id, userId: user.id },
    });
    if (alreadyUsed) {
      return NextResponse.json({ success: false, error: "Bu kodu daha önce kullandınız." }, { status: 400 });
    }

    discountAmount = discountCode.discountType === "PERCENT"
      ? (baseAmount * Number(discountCode.discountValue)) / 100
      : Number(discountCode.discountValue);
  }

  const finalAmount = Math.max(0, baseAmount - discountAmount);

  // Payment kaydı oluştur (PENDING)
  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      amount: finalAmount,
      currency: CURRENCY,
      status: "PENDING",
      provider: "iyzico",
      ipAddress: ip,
    },
  });

  // Kullanıcı adres bilgisi (varsa)
  const primaryAddress = await prisma.userAddress.findFirst({
    where: { userId: user.id, isPrimary: true },
  });

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Müşteri";
  const addressLine = primaryAddress?.addressLine || "Türkiye";
  const city = primaryAddress?.city || "Istanbul";

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Satın alım meta verisini callbackUrl'e ekle — İyzico bu URL'e POST eder
  const callbackParams = new URLSearchParams({
    type: purchaseType,
    ...(planId ? { planId } : {}),
    ...(discountCodeId ? { discountCodeId } : {}),
  });
  const callbackUrl = `${appUrl}/api/odeme/callback?${callbackParams.toString()}`;

  let iyzicoResult: Record<string, unknown>;
  try {
    iyzicoResult = await checkoutFormInitialize({
      locale: LOCALE,
      conversationId: payment.id,
      price: finalAmount.toFixed(2),
      paidPrice: finalAmount.toFixed(2),
      currency: CURRENCY,
      basketId: payment.id,
      paymentGroup: "PRODUCT",
      callbackUrl,
      enabledInstallments: [1, 2, 3, 6, 9],
      buyer: {
        id: user.id,
        name: user.firstName || "Ad",
        surname: user.lastName || "Soyad",
        gsmNumber: user.phone || "+905000000000",
        email: user.email,
        identityNumber: "11111111111",
        registrationAddress: addressLine,
        ip,
        city,
        country: "Turkey",
      },
      shippingAddress: {
        contactName: fullName,
        city,
        country: "Turkey",
        address: addressLine,
      },
      billingAddress: {
        contactName: fullName,
        city,
        country: "Turkey",
        address: addressLine,
      },
      basketItems: [
        {
          id: planId || "cover",
          name: itemName,
          category1: "Dijital",
          itemType: BASKET_ITEM_TYPE,
          price: finalAmount.toFixed(2),
        },
      ],
    });
  } catch (err) {
    console.error("[odeme/baslat] İyzico hatası:", err);
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
    return NextResponse.json({ success: false, error: "Ödeme başlatılamadı. Lütfen tekrar deneyin." }, { status: 502 });
  }

  if (iyzicoResult.status !== "success") {
    console.error("[odeme/baslat] İyzico hata yanıtı:", iyzicoResult);
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED", providerResponse: iyzicoResult as object },
    });
    return NextResponse.json({
      success: false,
      error: (iyzicoResult.errorMessage as string) || "Ödeme başlatılamadı.",
    }, { status: 400 });
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: { providerResponse: iyzicoResult as object },
  });

  return NextResponse.json({
    success: true,
    data: {
      checkoutUrl: iyzicoResult.paymentPageUrl as string,
      paymentId: payment.id,
    },
  });
}
