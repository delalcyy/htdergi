import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendOrderShippedEmail, sendOrderDeliveredEmail } from "@/lib/mail";
import type { OrderStatus } from "@prisma/client";

const schema = z.object({
  carrier:         z.string().optional(),
  trackingNumber:  z.string().optional(),
  status:          z.enum(["PENDING","PICKED_UP","IN_TRANSIT","DELIVERED","FAILED","RETURNED"]).optional(),
  currentLocation: z.string().optional(),
  estimatedDate:   z.string().optional(),
  notes:           z.string().optional(),
});

const CARGO_TO_ORDER: Record<string, OrderStatus> = {
  PICKED_UP:  "SHIPPED",
  IN_TRANSIT: "SHIPPED",
  DELIVERED:  "DELIVERED",
  RETURNED:   "REFUNDED",
};

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const admin = await getSessionUser(request);
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Yetkisiz" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false, error: "Geçersiz istek" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Geçersiz veri" }, { status: 400 });
  }

  const { carrier, trackingNumber, status, currentLocation, estimatedDate, notes } = parsed.data;

  const data: Record<string, unknown> = {};
  if (carrier !== undefined)         data.carrier         = carrier;
  if (trackingNumber !== undefined)  data.trackingNumber  = trackingNumber;
  if (status !== undefined)          data.status          = status;
  if (currentLocation !== undefined) data.currentLocation = currentLocation;
  if (estimatedDate !== undefined)   data.estimatedDate   = new Date(estimatedDate);
  if (notes !== undefined)           data.notes           = notes;
  if (status === "PICKED_UP" || status === "IN_TRANSIT") data.shippedAt  = new Date();
  if (status === "DELIVERED")                             data.deliveredAt = new Date();

  const cargo = await prisma.cargoTracking.upsert({
    where:  { orderId: id },
    create: { orderId: id, ...data },
    update: data,
  });

  // Sipariş durumunu kargo durumuna göre güncelle
  if (status && CARGO_TO_ORDER[status]) {
    await prisma.order.update({ where: { id }, data: { status: CARGO_TO_ORDER[status] } });
  }

  // Kullanıcıya e-posta bildirimi gönder
  if (status === "PICKED_UP" || status === "IN_TRANSIT") {
    try {
      const order = await prisma.order.findUnique({
        where: { id },
        include: { user: { select: { email: true, firstName: true, lastName: true } } },
      });
      if (order?.user) {
        const name = [order.user.firstName, order.user.lastName].filter(Boolean).join(" ") || "Müşteri";
        await sendOrderShippedEmail({
          to: order.user.email,
          name,
          carrier: carrier || "—",
          trackingNumber: trackingNumber || "—",
          estimatedDate: estimatedDate
            ? new Date(estimatedDate).toLocaleDateString("tr-TR")
            : undefined,
        });
      }
    } catch (err) {
      console.error("[kargo] Kargo bildirimi gönderilemedi:", err);
    }
  }

  if (status === "DELIVERED") {
    try {
      const order = await prisma.order.findUnique({
        where: { id },
        include: { user: { select: { email: true, firstName: true, lastName: true } } },
      });
      if (order?.user) {
        const name = [order.user.firstName, order.user.lastName].filter(Boolean).join(" ") || "Müşteri";
        await sendOrderDeliveredEmail({ to: order.user.email, name });
      }
    } catch (err) {
      console.error("[kargo] Teslim bildirimi gönderilemedi:", err);
    }
  }

  return NextResponse.json({ success: true, data: cargo });
}
