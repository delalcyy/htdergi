import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  firstName: z.string().min(2).max(50).regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/),
  lastName: z.string().min(2).max(50).regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/),
  phone: z.string().max(20).optional().nullable(),
  addressLine: z.string().min(5).max(200).optional().nullable(),
  city: z.string().max(50).optional().nullable(),
  district: z.string().max(50).optional().nullable(),
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

  const { firstName, lastName, phone, addressLine, city, district } = parsed.data;

  await prisma.user.update({
    where: { id: user.id },
    data: { firstName, lastName, phone },
  });

  // Adres varsa güncelle, yoksa oluştur
  if (addressLine && city && district) {
    const existing = await prisma.userAddress.findFirst({
      where: { userId: user.id, isPrimary: true },
    });

    if (existing) {
      await prisma.userAddress.update({
        where: { id: existing.id },
        data: { fullName: `${firstName} ${lastName}`, phone: phone || "", addressLine, city, district },
      });
    } else {
      await prisma.userAddress.create({
        data: {
          userId: user.id,
          fullName: `${firstName} ${lastName}`,
          phone: phone || "",
          addressLine,
          city,
          district,
          isPrimary: true,
        },
      });
    }
  }

  return NextResponse.json({ success: true, data: null });
}
