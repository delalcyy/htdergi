import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { infoFormSchema } from "@/lib/validation/kapak";

export async function POST(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) return NextResponse.json({ success: false, error: "Yetkisiz" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false, error: "Geçersiz istek" }, { status: 400 });
  }

  const parsed = infoFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const { fullName, phone, addressLine, city, district, postalCode } = parsed.data;

  const existing = await prisma.userAddress.findFirst({
    where: { userId: user.id, isPrimary: true },
  });

  if (existing) {
    await prisma.userAddress.update({
      where: { id: existing.id },
      data: { fullName, phone, addressLine, city, district, postalCode },
    });
  } else {
    await prisma.userAddress.create({
      data: { userId: user.id, fullName, phone, addressLine, city, district, postalCode, isPrimary: true },
    });
  }

  return NextResponse.json({ success: true, data: null });
}
