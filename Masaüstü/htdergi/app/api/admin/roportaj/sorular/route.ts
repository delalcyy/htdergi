import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createQuestionSchema } from "@/lib/validation/admin";

export async function POST(request: NextRequest) {
  const admin = await getSessionUser();
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Yetkisiz" }, { status: 403 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false, error: "Geçersiz istek" }, { status: 400 });
  }

  const parsed = createQuestionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  // Kategori admin'e ait mi değil ama var mı kontrol
  const category = await prisma.interviewCategory.findUnique({ where: { id: parsed.data.categoryId } });
  if (!category) {
    return NextResponse.json({ success: false, error: "Geçersiz kategori." }, { status: 400 });
  }

  const question = await prisma.interviewQuestion.create({ data: parsed.data });
  return NextResponse.json({ success: true, data: { id: question.id } }, { status: 201 });
}
