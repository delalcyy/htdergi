import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { sendOrderConfirmationEmail, sendNewOrderNotificationToAdmin } from "@/lib/mail";
import { moderateTexts } from "@/lib/moderation/textModeration";

const schema = z.object({
  ad:           z.string().max(60).default(""),
  soyad:        z.string().max(60).default(""),
  categoryName: z.string().min(1),
  answers:      z.record(z.string(), z.string()),
  coverBase64:  z.string().nullable().optional(),
  photo1Base64: z.string().nullable().optional(),
  photo2Base64: z.string().nullable().optional(),
});

export async function POST(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) return NextResponse.json({ success: false, error: "Giriş yapmanız gerekiyor." }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false, error: "Geçersiz istek." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const { ad, soyad, categoryName, answers, coverBase64, photo1Base64, photo2Base64 } = parsed.data;
  const personName = `${ad} ${soyad}`.trim() || null;

  if (moderateTexts([ad, soyad, ...Object.values(answers)])) {
    return NextResponse.json({ success: false, error: "Bu içerik yayın kurallarımıza uygun değil." }, { status: 400 });
  }

  const category = await prisma.interviewCategory.findFirst({
    where: { name: categoryName, isActive: true },
    include: { questions: { where: { isActive: true }, orderBy: { orderIndex: "asc" } } },
  });
  if (!category) {
    return NextResponse.json({ success: false, error: "Geçersiz kategori." }, { status: 400 });
  }

  /* InterviewDraft + cevaplar */
  const interviewDraft = await prisma.interviewDraft.create({
    data: { userId: user.id, categoryId: category.id, coverDraftId: null, status: "COMPLETED" },
  });

  const prefix = categoryName === "Doğum Günü"  ? "bd"
               : categoryName === "Evlilik"     ? "ev"
               : categoryName === "Kariyer"     ? "kr"
               : categoryName === "Bebek"       ? "bb"
               : categoryName === "Sevgililik"  ? "sv"
               : "mz";

  const answerRows = category.questions.map((q, idx) => {
    const key = `${prefix}-${String(idx + 1).padStart(2, "0")}`;
    return {
      id:              crypto.randomUUID(),
      interviewDraftId: interviewDraft.id,
      questionId:      q.id,
      answerText:      answers[key]?.trim() || null,
    };
  }).filter(r => r.answerText);

  if (answerRows.length > 0) {
    await prisma.interviewAnswer.createMany({ data: answerRows });
  }

  /* Order — notes alanında kişi adı + kapak + röportaj ID saklanır */
  const notes = JSON.stringify({
    personName,
    categoryName,
    interviewDraftId: interviewDraft.id,
    coverBase64:  coverBase64  ?? null,
    photo1Base64: photo1Base64 ?? null,
    photo2Base64: photo2Base64 ?? null,
    submittedAt:  new Date().toISOString(),
  });

  const order = await prisma.order.create({
    data: {
      userId:          user.id,
      status:          "PENDING",
      quantity:        1,
      unitPrice:       0,
      totalPrice:      0,
      shippingAddress: "",
      notes,
    },
  });

  await writeAuditLog({
    actorId: user.id, action: "interview_draft_created",
    targetId: order.id, targetType: "Order",
  });

  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Müşteri";

  try {
    await sendOrderConfirmationEmail({
      to: user.email,
      name,
      orderId: order.id,
      categoryName,
      personName: personName || name,
    });
  } catch (err) {
    console.error("[siparis] Sipariş onay maili gönderilemedi:", err);
  }

  try {
    await sendNewOrderNotificationToAdmin({
      orderId: order.id,
      personName: personName || name,
      categoryName,
      userEmail: user.email,
      userName: name,
    });
  } catch (err) {
    console.error("[siparis] Admin bildirim maili gönderilemedi:", err);
  }

  return NextResponse.json({ success: true, data: { orderId: order.id } }, { status: 201 });
}
