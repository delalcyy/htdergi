import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(72),
});

export async function POST(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: "Yetkisiz" }, { status: 401 });
  }

  const ip = getClientIp(request);
  const rl = checkRateLimit({ key: `sifre-degistir:${user.id}:${ip}`, limit: 5, windowMs: 15 * 60 * 1000 });
  if (!rl.allowed) {
    return NextResponse.json({ success: false, error: "Çok fazla deneme. 15 dakika bekleyin." }, { status: 429 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false, error: "Geçersiz istek" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Geçersiz veri" }, { status: 400 });
  }

  const { currentPassword, newPassword } = parsed.data;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });
  if (!dbUser) {
    return NextResponse.json({ success: false, error: "Kullanıcı bulunamadı" }, { status: 404 });
  }

  const valid = await bcryptjs.compare(currentPassword, dbUser.passwordHash);
  if (!valid) {
    return NextResponse.json({ success: false, error: "Mevcut şifre hatalı." }, { status: 400 });
  }

  const passwordHash = await bcryptjs.hash(newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return NextResponse.json({ success: true });
}
