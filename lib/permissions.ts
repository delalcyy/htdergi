import type { UserRole } from "@prisma/client";
import type { SessionUser, AccessCheck } from "@/types";

export function canAccessEditor(user: SessionUser | null): AccessCheck {
  if (!user) {
    return { allowed: false, reason: "login_required", redirectTo: "/auth/giris" };
  }
  if (!user.emailVerified) {
    return { allowed: false, reason: "email_not_verified", redirectTo: "/auth/giris" };
  }
  if (user.role === "ADMIN") {
    return { allowed: true };
  }
  if (
    user.role === "SUBSCRIBER" ||
    user.role === "SERIAL_USER" ||
    user.role === "COVER_BUYER"
  ) {
    return { allowed: true };
  }
  return {
    allowed: false,
    reason: "no_access",
    redirectTo: "/kapak-tasarla/bilgi-formu",
  };
}

export function canAccessAdmin(user: SessionUser | null): AccessCheck {
  if (!user) {
    return { allowed: false, reason: "login_required", redirectTo: "/auth/giris" };
  }
  if (user.role !== "ADMIN") {
    return { allowed: false, reason: "forbidden", redirectTo: "/" };
  }
  return { allowed: true };
}

export function canAccessPanel(user: SessionUser | null): AccessCheck {
  if (!user) {
    return { allowed: false, reason: "login_required", redirectTo: "/auth/giris" };
  }
  if (user.role === "ADMIN") {
    return { allowed: false, reason: "admin_redirect", redirectTo: "/admin" };
  }
  return { allowed: true };
}

export function isAdmin(user: SessionUser | null): boolean {
  return user?.role === "ADMIN";
}

export function hasSubscription(role: UserRole): boolean {
  return role === "SUBSCRIBER" || role === "SERIAL_USER";
}

// API route'larında kullanım için
export function requireRole(
  user: SessionUser | null,
  ...roles: UserRole[]
): SessionUser {
  if (!user) throw new ApiError(401, "Oturum açmanız gerekiyor");
  if (!roles.includes(user.role)) throw new ApiError(403, "Bu işlem için yetkiniz yok");
  return user;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
  }
}
