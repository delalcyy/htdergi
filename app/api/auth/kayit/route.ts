import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcryptjs from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateToken, hashToken } from "@/lib/token";
import { sendVerificationEmail, sendWelcomeEmail } from "@/lib/mail";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({
  firstName:     z.string().min(2).max(50),
  lastName:      z.string().min(2).max(50),
  email:         z.string().email().max(255),
  phone:         z.string().min(10).max(20),
  birthDate:     z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  city:          z.string().min(2).max(80),
  district:      z.string().min(2).max(80),
  supportedTeam:         z.string().max(100),
  password:              z.string().min(8).max(72),
  kvkkConsent: z.literal(true),
  epostaIzni: z.union([z.boolean(), z.string()]).transform(v => v === true || v === "on" || v === "true").optional(),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = checkRateLimit({ key: `kayit:${ip}`, limit: 5, windowMs: 15 * 60 * 1000 });
  if (!rl.allowed) {
    return NextResponse.json({ success: false, error: "Çok fazla deneme. 15 dakika bekleyin." }, { status: 429 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false, error: "Geçersiz istek" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Geçersiz veri" },
      { status: 400 }
    );
  }

  const { firstName, lastName, email, phone, birthDate, city, district, supportedTeam, password, epostaIzni } = parsed.data;
  const age = Math.floor((Date.now() - new Date(birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000));

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ success: false, error: "Bu e-posta zaten kayıtlı." }, { status: 409 });
  }

  const passwordHash = await bcryptjs.hash(password, 12);

  let user;
  try {
    user = await prisma.user.create({
      data: { email, passwordHash, firstName, lastName, phone, age, city, district, supportedTeam, emailMarketingConsent: epostaIzni ?? false },
    });
  } catch (err) {
    console.error("Kayıt DB hatası:", err);
    return NextResponse.json({ success: false, error: "Kayıt sırasında bir hata oluştu." }, { status: 500 });
  }

  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.emailVerificationToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  try {
    await sendVerificationEmail(email, token);
  } catch (err) {
    console.error("Doğrulama maili gönderilemedi:", err);
  }

  try {
    await sendWelcomeEmail(email);
  } catch (err) {
    console.error("Hoş geldiniz maili gönderilemedi:", err);
  }

  return NextResponse.json(
    { success: true, data: { message: "Kayıt başarılı. E-postanızı doğrulayın." } },
    { status: 201 }
  );
}
