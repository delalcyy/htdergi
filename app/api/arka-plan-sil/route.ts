import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const file = formData.get("gorsel") as File | null;
  if (!file) return NextResponse.json({ error: "Görsel bulunamadı" }, { status: 400 });

  const MAX_MB = 20;
  if (file.size > MAX_MB * 1024 * 1024) {
    return NextResponse.json({ error: `Görsel ${MAX_MB} MB'dan büyük olamaz` }, { status: 413 });
  }

  try {
    const REMBG_KEY = process.env.REMOVE_BG_API_KEY;
    if (!REMBG_KEY) throw new Error("REMOVE_BG_API_KEY tanımlı değil");

    const arrayBuffer = await file.arrayBuffer();
    const form = new FormData();
    form.append("image_file", new Blob([arrayBuffer], { type: file.type }), file.name || "image.jpg");
    form.append("size", "auto");

    const res = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": REMBG_KEY },
      body: form,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`remove.bg API hatası: ${res.status} ${err}`);
    }

    const resultBuffer = Buffer.from(await res.arrayBuffer());
    return new NextResponse(resultBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Length": String(resultBuffer.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[arka-plan-sil]", err);
    return NextResponse.json({ error: "İşlem başarısız" }, { status: 500 });
  }
}
