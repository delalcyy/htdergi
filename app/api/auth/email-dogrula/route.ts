import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/token";

export async function POST(request: NextRequest) {
  let body: { token?: string };
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false, error: "Geçersiz istek" }, { status: 400 });
  }

  const { token } = body;
  if (!token || typeof token !== "string") {
    return NextResponse.json({ success: false, error: "Geçersiz token" }, { status: 400 });
  }

  const tokenHash = hashToken(token);
  const record = await prisma.emailVerificationToken.findUnique({ where: { tokenHash } });

  if (!record) {
    return NextResponse.json({ success: false, error: "invalid_token" }, { status: 400 });
  }
  if (record.usedAt) {
    return NextResponse.json({ success: false, error: "token_used" }, { status: 400 });
  }
  if (record.expiresAt < new Date()) {
    return NextResponse.json({ success: false, error: "token_expired" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: true },
    }),
  ]);

  return NextResponse.json({ success: true });
}
