import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

async function toBase64DataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  const mime = res.headers.get("content-type") || "image/webp";
  return `data:${mime};base64,${Buffer.from(buf).toString("base64")}`;
}

export async function POST(request: NextRequest) {
  if (!process.env.REPLICATE_API_TOKEN) {
    return NextResponse.json({ error: "REPLICATE_API_TOKEN eksik" }, { status: 500 });
  }

  let formData: FormData;
  try { formData = await request.formData(); }
  catch { return NextResponse.json({ error: "Geçersiz form" }, { status: 400 }); }

  const imageFile = formData.get("image") as File | null;
  const maskFile  = formData.get("mask")  as File | null;
  const prompt    = (formData.get("prompt") as string | null) ?? "";

  if (!imageFile) return NextResponse.json({ error: "image zorunlu" }, { status: 400 });

  const imageBlob = new Blob([await imageFile.arrayBuffer()], { type: imageFile.type });

  try {
    let resultUrl: string;

    if (maskFile) {
      const maskBlob = new Blob([await maskFile.arrayBuffer()], { type: maskFile.type });

      const output = await replicate.run("black-forest-labs/flux-fill-dev", {
        input: {
          image: imageBlob,
          mask: maskBlob,
          prompt: prompt ||
            "Two people standing together, professional photo, realistic shared background, " +
            "same natural lighting and shadows, seamless environment, photorealistic",
          num_inference_steps: 28,
          guidance: 30,
          output_format: "webp",
          output_quality: 92,
        },
      });

      const urls = Array.isArray(output) ? output : [output];
      resultUrl = typeof urls[0] === "string" ? urls[0] : (urls[0] as { url: () => string }).url?.();
    } else {
      const output = await replicate.run("black-forest-labs/flux-dev", {
        input: {
          image: imageBlob,
          prompt: prompt || "Seamless photorealistic blend, same lighting, no collage look",
          prompt_strength: 0.18,
          num_inference_steps: 28,
          guidance: 3.5,
          output_format: "webp",
          output_quality: 92,
        },
      });

      const urls = Array.isArray(output) ? output : [output];
      resultUrl = typeof urls[0] === "string" ? urls[0] : (urls[0] as { url: () => string }).url?.();
    }

    if (!resultUrl) return NextResponse.json({ error: "Model çıktı üretemedi" }, { status: 500 });

    return NextResponse.json({ url: await toBase64DataUrl(resultUrl) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
