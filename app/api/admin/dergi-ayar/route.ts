import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const ayar = await prisma.dergiAyar.findFirst({ where: { id: 1 } });
  return NextResponse.json({ success: true, data: ayar ?? { arkaKapakUrl: null, sirtUrl: null } });
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Yetkisiz" }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ success: false, error: "Geçersiz istek" }, { status: 400 });
  }

  const arkaKapakDosya = formData.get("arkaKapak") as File | null;
  const sirtDosya = formData.get("sirt") as File | null;

  const mevcut = await prisma.dergiAyar.findFirst({ where: { id: 1 } });
  const guncel: { arkaKapakUrl?: string; sirtUrl?: string } = {};

  if (arkaKapakDosya && arkaKapakDosya.size > 0) {
    const ext = arkaKapakDosya.name.split(".").pop() ?? "jpg";
    const dosyaAdi = `arka-kapak-${Date.now()}.${ext}`;
    const tamYol = path.join(process.cwd(), "public", "dergi-ayar", dosyaAdi);
    await writeFile(tamYol, Buffer.from(await arkaKapakDosya.arrayBuffer()));
    guncel.arkaKapakUrl = `/dergi-ayar/${dosyaAdi}`;
  }

  if (sirtDosya && sirtDosya.size > 0) {
    const ext = sirtDosya.name.split(".").pop() ?? "jpg";
    const dosyaAdi = `sirt-${Date.now()}.${ext}`;
    const tamYol = path.join(process.cwd(), "public", "dergi-ayar", dosyaAdi);
    await writeFile(tamYol, Buffer.from(await sirtDosya.arrayBuffer()));
    guncel.sirtUrl = `/dergi-ayar/${dosyaAdi}`;
  }

  if (Object.keys(guncel).length === 0) {
    return NextResponse.json({ success: false, error: "Yüklenecek dosya seçilmedi." }, { status: 400 });
  }

  const ayar = mevcut
    ? await prisma.dergiAyar.update({ where: { id: 1 }, data: guncel })
    : await prisma.dergiAyar.create({ data: { id: 1, ...guncel } });

  return NextResponse.json({ success: true, data: ayar });
}
