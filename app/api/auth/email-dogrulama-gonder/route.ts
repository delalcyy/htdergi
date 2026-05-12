import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken, hashToken } from "@/lib/token";
import { sendVerificationEmail } from "@/lib/mail";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = checkRateLimit({ key: `verify-resend:${ip}`, limit: 3, windowMs: 10 * 60 * 1000 });
  if (!rl.allowed) {
    return NextResponse.json({ success: false, error: "Çok fazla istek. 10 dakika bekleyin." }, { status: 429 });
  }

  let body: { email?: string };
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false, error: "Geçersiz istek" }, { status: 400 });
  }

  const { email } = body;
  if (!email) {
    return NextResponse.json({ success: false, error: "E-posta zorunludur" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true, emailVerified: true } });

  // Güvenlik: e-posta yoksa da aynı yanıtı döndür
  if (!user || user.emailVerified) {
    return NextResponse.json({ success: true });
  }

  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.emailVerificationToken.create({ data: { userId: user.id, tokenHash, expiresAt } });

  try {
    await sendVerificationEmail(email, token);
  } catch (err) {
    console.error("Mail gönderilemedi:", err);
  }

  return NextResponse.json({ success: true });
}
