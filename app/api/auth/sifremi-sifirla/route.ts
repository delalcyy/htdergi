import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/token";
import { sendPasswordChangedEmail } from "@/lib/mail";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = checkRateLimit({ key: `reset:${ip}`, limit: 5, windowMs: 15 * 60 * 1000 });
  if (!rl.allowed) {
    return NextResponse.json({ success: false, error: "Çok fazla deneme." }, { status: 429 });
  }

  let body: { token?: string; password?: string };
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false, error: "Geçersiz istek" }, { status: 400 });
  }

  const { token, password } = body;
  if (!token || !password || password.length < 8) {
    return NextResponse.json({ success: false, error: "Geçersiz parametre" }, { status: 400 });
  }

  const tokenHash = hashToken(token);
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { email: true } } },
  });

  if (!record) {
    return NextResponse.json({ success: false, error: "invalid_token" }, { status: 400 });
  }
  if (record.usedAt) {
    return NextResponse.json({ success: false, error: "token_used" }, { status: 400 });
  }
  if (record.expiresAt < new Date()) {
    return NextResponse.json({ success: false, error: "token_expired" }, { status: 400 });
  }

  const passwordHash = await bcryptjs.hash(password, 12);

  await prisma.$transaction([
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
  ]);

  try {
    await sendPasswordChangedEmail(record.user.email);
  } catch (err) {
    console.error("Şifre değişikliği maili gönderilemedi:", err);
  }

  return NextResponse.json({ success: true });
}
