import { prisma } from "./prisma";

export type AuditAction =
  | "user_registered"
  | "user_login"
  | "user_logout"
  | "user_suspended"
  | "user_deleted"
  | "password_reset_requested"
  | "email_verified"
  | "serial_code_activated"
  | "serial_code_failed"
  | "serial_code_created"
  | "serial_code_cancelled"
  | "subscription_created"
  | "subscription_cancelled"
  | "payment_completed"
  | "payment_failed"
  | "discount_code_used"
  | "discount_code_created"
  | "cover_draft_created"
  | "cover_draft_updated"
  | "cover_purchase_granted"
  | "interview_draft_created"
  | "admin_viewed_user"
  | "admin_changed_role"
  | "admin_template_created"
  | "admin_template_updated";

export async function writeAuditLog(params: {
  actorId: string;
  action: AuditAction;
  targetId?: string;
  targetType?: string;
  ipAddress?: string;
  userAgent?: string;
  meta?: Record<string, unknown>;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: params.actorId,
        action: params.action,
        targetId: params.targetId,
        targetType: params.targetType,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        meta: params.meta ? (sanitizeMeta(params.meta) as object) : undefined,
      },
    });
  } catch (err) {
    // Audit log hatası asla ana işlemi durdurmamalı
    console.error("[AuditLog] Yazma hatası:", err);
  }
}

// Meta'dan hassas alanları temizle
function sanitizeMeta(meta: Record<string, unknown>): Record<string, unknown> {
  const sensitiveKeys = ["password", "token", "secret", "cvv", "card", "ip"];
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta)) {
    if (!sensitiveKeys.some((s) => k.toLowerCase().includes(s))) {
      clean[k] = v;
    }
  }
  return clean;
}
