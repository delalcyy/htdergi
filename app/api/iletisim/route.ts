import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendContactEmail } from "@/lib/mail";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({
  ad:     z.string().min(2).max(50),
  soyad:  z.string().min(2).max(50),
  email:  z.string().email().max(255),
  telefon: z.string().max(20).optional().default(""),
  konu:   z.string().min(1).max(100),
  mesaj:  z.string().min(10).max(3000),
});

const KONU_LABELS: Record<string, string> = {
  genel:     "Genel Bilgi",
  teknik:    "Teknik Destek",
  odeme:     "Ödeme & Fatura",
  iade:      "İade Talebi",
  kurumsal:  "Kurumsal & Toplu Sipariş",
  diger:     "Diğer",
};

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = checkRateLimit({ key: `iletisim:${ip}`, limit: 3, windowMs: 30 * 60 * 1000 });
  if (!rl.allowed) {
    return NextResponse.json({ success: false, error: "Çok fazla istek. Lütfen daha sonra tekrar deneyin." }, { status: 429 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false, error: "Geçersiz istek" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Lütfen tüm alanları doldurun." }, { status: 400 });
  }

  const { ad, soyad, email, telefon, konu, mesaj } = parsed.data;

  try {
    await sendContactEmail({
      name:    `${ad} ${soyad}`,
      email,
      phone:   telefon,
      subject: KONU_LABELS[konu] || konu,
      message: mesaj,
    });
  } catch (err) {
    console.error("[iletisim] Mail gönderilemedi:", err);
    return NextResponse.json({ success: false, error: "Mesaj gönderilemedi. Lütfen tekrar deneyin." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
