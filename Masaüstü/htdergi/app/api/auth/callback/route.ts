import { NextRequest, NextResponse } from "next/server";

// Supabase email callback kaldırıldı.
// Bu endpoint artık kullanılmıyor; gelen istekleri panel'e yönlendiriyor.
export function GET(request: NextRequest) {
  const origin = new URL(request.url).origin;
  return NextResponse.redirect(`${origin}/panel`);
}
