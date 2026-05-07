import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

const schema = z.object({
  code: z.string().min(1).max(30),
  type: z.enum(["SUBSCRIPTION", "COVER_ONLY"]),
  planId: z.string().uuid().optional().nullable(),
});

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ success: false, error: "Yetkisiz" }, { status: 401 });

  const rl = checkRateLimit({ key: `discount:${user.id}`, limit: 10, windowMs: 60 * 1000 });
  if (!rl.allowed) {
    return NextResponse.json({ success: false, error: "Çok fazla deneme." }, { status: 429 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false, error: "Geçersiz istek" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Geçersiz veri" }, { status: 400 });
  }

  const { code, type, planId } = parsed.data;
  const now = new Date();

  const discountCode = await prisma.discountCode.findUnique({ where: { code } });

  if (!discountCode || !discountCode.isActive) {
    return NextResponse.json({ success: false, error: "İndirim kodu geçersiz." }, { status: 400 });
  }

  if (discountCode.validFrom && discountCode.validFrom > now) {
    return NextResponse.json({ success: false, error: "İndirim kodu henüz aktif değil." }, { status: 400 });
  }

  if (discountCode.validUntil && discountCode.validUntil < now) {
    return NextResponse.json({ success: false, error: "İndirim kodunun süresi doldu." }, { status: 400 });
  }

  if (discountCode.maxUsage !== null && discountCode.usedCount >= discountCode.maxUsage) {
    return NextResponse.json({ success: false, error: "İndirim kodu kullanım limitine ulaştı." }, { status: 400 });
  }

  // Kapsam kontrolü
  if (discountCode.validFor !== "ALL") {
    if (type === "SUBSCRIPTION" && discountCode.validFor !== "SUBSCRIPTION") {
      return NextResponse.json({ success: false, error: "Bu kod abonelik için geçerli değil." }, { status: 400 });
    }
    if (type === "COVER_ONLY" && discountCode.validFor !== "COVER_ONLY") {
      return NextResponse.json({ success: false, error: "Bu kod kapak satın alımı için geçerli değil." }, { status: 400 });
    }
  }

  // Plan kısıtı varsa kontrol et
  if (discountCode.planId && planId && discountCode.planId !== planId) {
    return NextResponse.json({ success: false, error: "Bu kod seçili plan için geçerli değil." }, { status: 400 });
  }

  // Kullanıcı daha önce kullandı mı?
  const alreadyUsed = await prisma.discountCodeUsage.findFirst({
    where: { discountCodeId: discountCode.id, userId: user.id },
  });
  if (alreadyUsed) {
    return NextResponse.json({ success: false, error: "Bu kodu daha önce kullandınız." }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    data: {
      id: discountCode.id,
      code: discountCode.code,
      discountType: discountCode.discountType,
      discountValue: Number(discountCode.discountValue),
    },
  });
}
