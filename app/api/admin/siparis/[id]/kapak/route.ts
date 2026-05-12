import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const user = await getSessionUser(request);
  if (!user || user.role !== "ADMIN") return new NextResponse("Yetkisiz", { status: 401 });

  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, select: { notes: true } });
  if (!order?.notes) return new NextResponse("Bulunamadı", { status: 404 });

  let coverBase64: string | null = null;
  try { coverBase64 = JSON.parse(order.notes).coverBase64 ?? null; } catch { /* */ }
  if (!coverBase64) return new NextResponse("Kapak yok", { status: 404 });

  // "data:image/png;base64,..." → binary buffer
  const base64Data = coverBase64.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  const personName = (() => {
    try { return JSON.parse(order.notes ?? "").personName ?? "kapak"; } catch { return "kapak"; }
  })();
  const filename = `kapak-${personName.replace(/\s+/g, "-")}.png`;

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":        "image/png",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length":      String(buffer.length),
    },
  });
}
