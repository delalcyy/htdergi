import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ success: false, error: "Yetkisiz" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const draftId = formData.get("draftId") as string | null;

  if (!file) {
    return NextResponse.json({ success: false, error: "Dosya bulunamadı." }, { status: 400 });
  }

  const authToken = request.cookies.get("__auth_token")?.value;

  const backendForm = new FormData();
  backendForm.append("file", file);
  if (draftId) backendForm.append("draftId", draftId);

  let backendRes: Response;
  try {
    backendRes = await fetch(`${BACKEND_URL}/api/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${authToken}` },
      body: backendForm,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Yükleme sunucusuna bağlanılamadı." },
      { status: 503 }
    );
  }

  const data = await backendRes.json();
  return NextResponse.json(data, { status: backendRes.status });
}
