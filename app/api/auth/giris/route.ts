import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { SignJWT } from "jose";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "");

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 8 * 60 * 60,
};

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = checkRateLimit({ key: `giris:${ip}`, limit: 10, windowMs: 15 * 60 * 1000 });
  if (!rl.allowed) {
    return NextResponse.json({ success: false, error: "Çok fazla deneme. 15 dakika bekleyin." }, { status: 429 });
  }

  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Geçersiz istek" }, { status: 400 });
  }

  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json({ success: false, error: "invalid_credentials" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, passwordHash: true, role: true, status: true, deletedAt: true, emailVerified: true },
  });

  if (!user || user.deletedAt || user.status === "SUSPENDED") {
    return NextResponse.json({ success: false, error: "invalid_credentials" }, { status: 401 });
  }

  const valid = await bcryptjs.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ success: false, error: "invalid_credentials" }, { status: 401 });
  }

  if (!user.emailVerified) {
    return NextResponse.json({ success: false, error: "email_not_verified", email }, { status: 403 });
  }

  const token = await new SignJWT({ sub: user.id, email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("8h")
    .sign(JWT_SECRET);

  const response = NextResponse.json({ success: true, data: null });
  response.cookies.set("__auth_token", token, COOKIE_OPTS);
  return response;
}
