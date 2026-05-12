import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  let email = "";
  try {
    const body = await request.json();
    email = typeof body.email === "string" ? body.email.slice(0, 255) : "";
  } catch {
    return NextResponse.json({ success: true, data: null });
  }

  // Başarısız girişi logla
  try {
    await prisma.failedLoginAttempt.create({
      data: { email, ipAddress: ip },
    });
  } catch {
    // Log hatası ana akışı etkilemez
  }

  return NextResponse.json({ success: true, data: null });
}
