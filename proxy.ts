import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "");

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get("__auth_token")?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

function validateApiOrigin(request: NextRequest): boolean {
  const method = request.method;
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) return true;

  const pathname = request.nextUrl.pathname;
  if (!pathname.startsWith("/api/")) return true;

  if (pathname === "/api/odeme/webhook") return true;
  if (pathname === "/api/odeme/callback") return true;

  // Auth endpointleri herkese açık olmalı
  if (pathname.startsWith("/api/auth/")) return true;

  const origin = request.headers.get("origin");
  if (!origin) return false;

  const frontendUrl = process.env.FRONTEND_URL;
  if (!frontendUrl) return false;

  try {
    return new URL(origin).origin === new URL(frontendUrl).origin;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!validateApiOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const authed = await isAuthenticated(request);

  if (pathname.startsWith("/admin")) {
    if (!authed) {
      return NextResponse.redirect(new URL("/auth/giris?from=admin", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/panel") || pathname.startsWith("/kapak-tasarla")) {
    if (!authed) {
      return NextResponse.redirect(
        new URL(`/auth/giris?from=${encodeURIComponent(pathname)}`, request.url)
      );
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/auth/") && authed) {
    return NextResponse.redirect(new URL("/panel", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/admin/:path*",
    "/panel/:path*",
    "/kapak-tasarla/:path*",
    "/auth/:path*",
  ],
};
