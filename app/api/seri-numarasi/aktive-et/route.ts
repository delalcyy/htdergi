import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { writeAuditLog } from "@/lib/audit";
import { infoFormSchema } from "@/lib/validation/kapak";

const schema = infoFormSchema.extend({
  code: z.string().min(4).max(50).regex(/^[A-Z0-9\-]+$/, "Geçersiz kod formatı"),
});

export async function POST(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: "Yetkisiz" }, { status: 401 });
  }

  const ip = getClientIp(request);

  // Rate limit: IP başına 5 dakikada 5 deneme
  const ipRl = checkRateLimit({ key: `serial:ip:${ip}`, limit: 5, windowMs: 5 * 60 * 1000 });
  if (!ipRl.allowed) {
    await writeAuditLog({ actorId: user.id, action: "serial_code_failed", ipAddress: ip, meta: { reason: "ip_rate_limit" } });
    return NextResponse.json(
      { success: false, error: "Çok fazla deneme. Lütfen birkaç dakika bekleyin." },
      { status: 429 }
    );
  }

  // Rate limit: kullanıcı başına 10 başarısız deneme
  const userRl = checkRateLimit({ key: `serial:user:${user.id}`, limit: 10, windowMs: 60 * 60 * 1000 });
  if (!userRl.allowed) {
    return NextResponse.json(
      { success: false, error: "Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin." },
      { status: 429 }
    );
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false, error: "Geçersiz istek" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message || "Geçersiz veri" },
      { status: 400 }
    );
  }

  const { code, fullName, phone, addressLine, city, district, postalCode } = parsed.data;

  // Atomik işlem: kod kontrolü + aktivasyon + abonelik oluşturma
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Kodu kilitle
      const serialCode = await tx.serialCode.findUnique({ where: { code } });

      if (!serialCode) {
        return { success: false, error: "Seri numarası bulunamadı." };
      }
      if (serialCode.status !== "UNUSED") {
        return { success: false, error: "Bu seri numarası daha önce kullanılmış veya iptal edilmiş." };
      }

      const now = new Date();
      const expiresAt = new Date(now.getTime() + serialCode.durationDays * 24 * 60 * 60 * 1000);

      // Kodu kullanılmış işaretle
      await tx.serialCode.update({
        where: { id: serialCode.id },
        data: {
          status: "USED",
          usedByUserId: user.id,
          usedAt: now,
          usedIp: ip,
        },
      });

      // Abonelik oluştur
      const subscription = await tx.subscription.create({
        data: {
          userId: user.id,
          type: "SERIAL",
          status: "ACTIVE",
          startedAt: now,
          expiresAt,
          serialCodeId: serialCode.id,
        },
      });

      // Kullanıcı rolünü güncelle
      await tx.user.update({
        where: { id: user.id },
        data: { role: "SERIAL_USER" },
      });

      // Adres kaydet
      await tx.userAddress.upsert({
        where: { id: (await tx.userAddress.findFirst({ where: { userId: user.id, isPrimary: true } }))?.id || "non-existent" },
        update: { fullName, phone, addressLine, city, district, postalCode },
        create: { userId: user.id, fullName, phone, addressLine, city, district, postalCode, isPrimary: true },
      });

      return { success: true, subscriptionId: subscription.id };
    });

    if (!result.success) {
      await writeAuditLog({
        actorId: user.id,
        action: "serial_code_failed",
        ipAddress: ip,
        meta: { reason: result.error },
      });
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    await writeAuditLog({
      actorId: user.id,
      action: "serial_code_activated",
      targetType: "SerialCode",
      ipAddress: ip,
      meta: { subscriptionId: result.subscriptionId },
    });

    return NextResponse.json({ success: true, data: null });
  } catch (err) {
    console.error("[SerialActivate] Hata:", err);
    return NextResponse.json(
      { success: false, error: "İşlem sırasında hata oluştu." },
      { status: 500 }
    );
  }
}
