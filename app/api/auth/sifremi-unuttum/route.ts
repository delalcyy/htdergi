import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken, hashToken } from "@/lib/token";
import { sendPasswordResetEmail } from "@/lib/mail";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = checkRateLimit({ key: `forgot:${ip}`, limit: 3, windowMs: 10 * 60 * 1000 });
  if (!rl.allowed) {
    return NextResponse.json({ success: false, error: "Çok fazla istek. 10 dakika bekleyin." }, { status: 429 });
  }

  let body: { email?: string };
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false, error: "Geçersiz istek" }, { status: 400 });
  }

  const { email } = body;
  if (!email) {
    // Güvenlik: her durumda aynı başarı yanıtı
    return NextResponse.json({ success: true });
  }

  const user = await prisma.user.findUnique({
    where: { email, deletedAt: null },
    select: { id: true, email: true },
  });

  if (user) {
    const token = generateToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 saat

    await prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt } });

    try {
      await sendPasswordResetEmail(email, token);
    } catch (err) {
      console.error("Şifre sıfırlama maili gönderilemedi:", err);
    }
  }

  return NextResponse.json({ success: true });
}
