import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 8 * 60 * 60,
};

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Geçersiz istek" }, { status: 400 });
  }

  let backendRes: Response;
  try {
    backendRes = await fetch(`${BACKEND_URL}/api/auth/giris`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Sunucuya bağlanılamadı." },
      { status: 503 }
    );
  }

  const data = await backendRes.json();

  if (!backendRes.ok || !data.success) {
    return NextResponse.json(data, { status: backendRes.status });
  }

  const response = NextResponse.json({ success: true, data: null });

  if (data.data?.token) {
    response.cookies.set("__auth_token", data.data.token, COOKIE_OPTS);
  }

  return response;
}
