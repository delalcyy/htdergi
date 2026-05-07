import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSerialBatchSchema } from "@/lib/validation/admin";
import { writeAuditLog } from "@/lib/audit";

function generateSerialCode(): string {
  // Kriptografik güçlü rastgele kod: HD-XXXX-XXXXXXXXXX
  const part1 = randomBytes(2).toString("hex").toUpperCase();
  const part2 = randomBytes(5).toString("hex").toUpperCase();
  return `HD-${part1}-${part2}`;
}

export async function POST(request: NextRequest) {
  const admin = await getSessionUser();
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Yetkisiz" }, { status: 403 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false, error: "Geçersiz istek" }, { status: 400 });
  }

  const parsed = createSerialBatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const { count, durationDays, batchLabel } = parsed.data;

  // Toplu oluştur — unique kod garantisi için döngü
  const created: string[] = [];
  const attempts = count * 3;

  for (let i = 0; i < attempts && created.length < count; i++) {
    const code = generateSerialCode();
    const exists = await prisma.serialCode.findUnique({ where: { code } });
    if (!exists) created.push(code);
  }

  if (created.length < count) {
    return NextResponse.json(
      { success: false, error: "Yeterince benzersiz kod üretilemedi. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }

  await prisma.serialCode.createMany({
    data: created.map((code) => ({
      code,
      durationDays,
      batchLabel,
      status: "UNUSED" as const,
      createdById: admin.id,
    })),
  });

  await writeAuditLog({
    actorId: admin.id,
    action: "serial_code_created",
    meta: { count, batchLabel },
  });

  return NextResponse.json({ success: true, data: { count: created.length } }, { status: 201 });
}
