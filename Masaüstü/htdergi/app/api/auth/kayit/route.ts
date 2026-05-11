import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcryptjs from "bcryptjs";
import { SignJWT } from "jose";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "");

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 8 * 60 * 60,
};

const schema = z.object({
  firstName:     z.string().min(2).max(50),
  lastName:      z.string().min(2).max(50),
  email:         z.string().email().max(255),
  phone:         z.string().min(10).max(20),
  age:           z.number().int().min(1).max(120),
  city:          z.string().min(2).max(80),
  district:      z.string().min(2).max(80),
  supportedTeam: z.string().min(2).max(100),
  password:      z.string().min(8).max(72),
});

export async function POST(request: NextRequest) {
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

  const { firstName, lastName, email, phone, age, city, district, supportedTeam, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ success: false, error: "Bu e-posta zaten kayıtlı." }, { status: 409 });
  }

  const passwordHash = await bcryptjs.hash(password, 12);

  let user;
  try {
    user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        phone,
        age,
        city,
        district,
        supportedTeam,
      },
    });
  } catch (err) {
    console.error("Kayıt DB hatası:", err);
    return NextResponse.json({ success: false, error: "Kayıt sırasında bir hata oluştu." }, { status: 500 });
  }

  const token = await new SignJWT({ sub: user.id, email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("8h")
    .sign(JWT_SECRET);

  const response = NextResponse.json({ success: true, data: null }, { status: 201 });
  response.cookies.set("__auth_token", token, COOKIE_OPTS);
  return response;
}
