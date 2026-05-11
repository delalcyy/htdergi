import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const user = await getSessionUser(request);
  if (!user || user.role !== "ADMIN") return new NextResponse("Yetkisiz", { status: 401 });

  const { id } = await params;
  const slot = new URL(request.url).searchParams.get("slot") ?? "1";

  const order = await prisma.order.findUnique({ where: { id }, select: { notes: true } });
  if (!order?.notes) return new NextResponse("Bulunamadı", { status: 404 });

  let b64: string | null = null;
  try {
    const nd = JSON.parse(order.notes);
    b64 = slot === "2" ? (nd.photo2Base64 ?? null) : (nd.photo1Base64 ?? null);
  } catch { /* */ }
  if (!b64) return new NextResponse("Fotoğraf yok", { status: 404 });

  const match = b64.match(/^data:(image\/\w+);base64,/);
  const mime = match?.[1] ?? "image/jpeg";
  const buffer = Buffer.from(b64.replace(/^data:image\/\w+;base64,/, ""), "base64");
  const personName = (() => {
    try { return JSON.parse(order.notes ?? "").personName ?? "foto"; } catch { return "foto"; }
  })();
  const ext = mime.split("/")[1] ?? "jpg";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":        mime,
      "Content-Disposition": `attachment; filename="foto${slot}-${personName.replace(/\s+/g, "-")}.${ext}"`,
    },
  });
}
