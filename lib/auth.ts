import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { NextRequest } from "next/server";
import { prisma } from "./prisma";
import type { SessionUser } from "@/types";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "");

type JwtPayload = {
  sub: string;
  email: string;
  role: string;
};

async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

/* Route Handler'lardan çağrılırken request geçilmeli (next/headers cookies güvenilmez) */
export async function getSessionUser(req?: NextRequest): Promise<SessionUser | null> {
  const token = req
    ? req.cookies.get("__auth_token")?.value
    : (await cookies()).get("__auth_token")?.value;

  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload?.sub) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        age: true,
        city: true,
        district: true,
        supportedTeam: true,
        role: true,
        status: true,
        emailVerified: true,
        deletedAt: true,
      },
    });

    if (!user || user.deletedAt || user.status === "SUSPENDED") return null;

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      age: user.age,
      city: user.city,
      district: user.district,
      supportedTeam: user.supportedTeam,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
    };
  } catch {
    return null;
  }
}

export async function hasEditorAccess(userId: string): Promise<boolean> {
  const now = new Date();

  const activeSubscription = await prisma.subscription.findFirst({
    where: { userId, status: "ACTIVE", expiresAt: { gt: now } },
  });
  if (activeSubscription) return true;

  const coverPurchase = await prisma.coverPurchase.findFirst({
    where: { userId, accessGranted: true },
  });
  return !!coverPurchase;
}

export function assertOwnership(resourceUserId: string, sessionUserId: string): void {
  if (resourceUserId !== sessionUserId) throw new Error("Unauthorized");
}
