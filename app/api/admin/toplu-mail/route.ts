import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";

function buildWhere(sehir?: string, takim?: string) {
  return {
    emailVerified: true,
    deletedAt: null,
    status: "ACTIVE" as const,
    emailMarketingConsent: true,
    ...(sehir ? { city: sehir } : {}),
    ...(takim ? { supportedTeam: takim } : {}),
  };
}

/* GET — param yoksa kategori listesi, param varsa kişi sayısı */
export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Yetkisiz" }, { status: 403 });
  }
  const { searchParams } = new URL(request.url);
  const sehir = searchParams.get("sehir") || undefined;
  const takim = searchParams.get("takim") || undefined;

  if (!sehir && !takim && searchParams.get("liste") === "1") {
    const aktifWhere = { deletedAt: null, status: "ACTIVE" as const };
    const [sehirler, takimlar] = await Promise.all([
      prisma.user.findMany({
        where: { ...aktifWhere, city: { not: null } },
        select: { city: true },
        distinct: ["city"],
        orderBy: { city: "asc" },
      }),
      prisma.user.findMany({
        where: { ...aktifWhere, supportedTeam: { not: null } },
        select: { supportedTeam: true },
        distinct: ["supportedTeam"],
        orderBy: { supportedTeam: "asc" },
      }),
    ]);
    return NextResponse.json({
      success: true,
      data: {
        sehirler: sehirler.map(s => s.city!),
        takimlar: takimlar.map(t => t.supportedTeam!),
      },
    });
  }

  const sayi = await prisma.user.count({ where: buildWhere(sehir, takim) });
  return NextResponse.json({ success: true, data: { sayi } });
}

const schema = z.object({
  konu:  z.string().min(1).max(200),
  icerik: z.string().min(1).max(10000),
  sehir: z.string().optional(),
  takim: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Yetkisiz" }, { status: 403 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false, error: "Geçersiz istek" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const { konu, icerik, sehir, takim } = parsed.data;

  const kullanicilar = await prisma.user.findMany({
    where: buildWhere(sehir, takim),
    select: { email: true, firstName: true, lastName: true },
  });

  if (kullanicilar.length === 0) {
    return NextResponse.json({ success: false, error: "Bu filtreye uyan gönderilecek kullanıcı bulunamadı." }, { status: 400 });
  }

  let basarili = 0;
  let basarisiz = 0;

  for (const k of kullanicilar) {
    const ad = [k.firstName, k.lastName].filter(Boolean).join(" ") || k.email;
    const html = `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fff;">
        <h2 style="color:#1a1a1a;margin-bottom:16px;">${konu}</h2>
        <div style="color:#333;line-height:1.7;white-space:pre-wrap;">${icerik.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</div>
        <hr style="border:none;border-top:1px solid #eee;margin:28px 0;">
        <p style="color:#aaa;font-size:12px;">Hatıra Dergi — hatiradergi.com</p>
        <p style="color:#ccc;font-size:11px;">Bu e-postayı almak istemiyorsanız <a href="https://hatiradergi.com/panel/profil" style="color:#ccc;">profil sayfanızdan</a> e-posta bildirim iznini kaldırabilirsiniz.</p>
      </div>
    `;
    try {
      await sendMail({ to: k.email, subject: konu, html });
      basarili++;
    } catch {
      basarisiz++;
    }
  }

  return NextResponse.json({
    success: true,
    data: { toplam: kullanicilar.length, basarili, basarisiz },
  });
}
