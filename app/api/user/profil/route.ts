import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { moderateTexts } from "@/lib/moderation/textModeration";

const schema = z.object({
  firstName:     z.string().min(2).max(50).regex(/^[\p{L}\s]+$/u),
  lastName:      z.string().min(2).max(50).regex(/^[\p{L}\s]+$/u),
  phone:         z.string().max(20).optional().nullable(),
  age:           z.number().int().min(1).max(120).optional().nullable(),
  city:          z.string().max(80).optional().nullable(),
  district:      z.string().max(80).optional().nullable(),
  supportedTeam: z.string().max(100).optional().nullable(),
});

export async function PUT(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) return NextResponse.json({ success: false, error: "Yetkisiz" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false, error: "Geçersiz istek" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const { firstName, lastName, phone, age, city, district, supportedTeam } = parsed.data;

  if (moderateTexts([firstName, lastName, city, district, supportedTeam])) {
    return NextResponse.json({ success: false, error: "Bu içerik yayın kurallarımıza uygun değil." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      firstName,
      lastName,
      phone: phone || null,
      age: age ?? null,
      city: city || null,
      district: district || null,
      supportedTeam: supportedTeam || null,
    },
  });

  return NextResponse.json({ success: true, data: null });
}
