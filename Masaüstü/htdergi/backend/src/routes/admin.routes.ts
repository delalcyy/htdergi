import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { requireAuth, requireRole } from "../middleware/auth";
import type { OrderStatus } from "@prisma/client";
import { prisma } from "../config/prisma";

const router = Router();
router.use(requireAuth, requireRole("ADMIN"));

function qs(req: Request, key: string, def = ""): string {
  const v = req.query[key];
  return typeof v === "string" ? v : def;
}

/* ── GET /api/admin/stats ─────────────────────────────── */
router.get("/stats", async (_req: Request, res: Response): Promise<void> => {
  const now = new Date();

  const [totalUsers, activeSubscriptions, totalOrders, pendingOrders,
    completedPayments, unusedSerials, newUsersThisMonth] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null, role: { not: "ADMIN" } } }),
    prisma.subscription.count({ where: { status: "ACTIVE", expiresAt: { gt: now } } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: { in: ["PENDING", "CONFIRMED", "IN_PRODUCTION"] } } }),
    prisma.payment.count({ where: { status: "COMPLETED" } }),
    prisma.serialCode.count({ where: { status: "UNUSED" } }),
    prisma.user.count({
      where: {
        deletedAt: null,
        createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) },
      },
    }),
  ]);

  const [recentUsers, recentOrders] = await Promise.all([
    prisma.user.findMany({
      where: { deletedAt: null, role: { not: "ADMIN" } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
        cargoTracking: { select: { status: true, trackingNumber: true } },
      },
    }),
  ]);

  res.json({
    success: true,
    data: {
      totalUsers, activeSubscriptions, totalOrders, pendingOrders,
      completedPayments, unusedSerials, newUsersThisMonth,
      recentUsers, recentOrders,
    },
  });
});

/* ── GET /api/admin/users ─────────────────────────────── */
router.get("/users", async (req: Request, res: Response): Promise<void> => {
  const page  = Math.max(1, parseInt(qs(req, "page", "1")));
  const limit = Math.min(100, Math.max(1, parseInt(qs(req, "limit", "25"))));
  const role  = qs(req, "role", "ALL");
  const q     = qs(req, "q");
  const skip  = (page - 1) * limit;

  const where: Record<string, unknown> = { deletedAt: null };
  if (role !== "ALL") where["role"] = role;
  if (q) {
    where["OR"] = [
      { email:     { contains: q } },
      { firstName: { contains: q } },
      { lastName:  { contains: q } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, status: true, emailVerified: true, createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({ success: true, data: { users, total, page, totalPages: Math.ceil(total / limit) } });
});

/* ── GET /api/admin/users/:id ─────────────────────────── */
router.get("/users/:id", async (req: Request, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id as string },
    select: {
      id: true, email: true, firstName: true, lastName: true,
      phone: true, role: true, status: true, emailVerified: true,
      createdAt: true, updatedAt: true,
      subscriptions: {
        orderBy: { createdAt: "desc" }, take: 5, include: { plan: true },
      },
      orders: {
        orderBy: { createdAt: "desc" }, take: 10,
        include: { cargoTracking: true },
      },
    },
  });

  if (!user) { res.status(404).json({ success: false, error: "Kullanıcı bulunamadı." }); return; }
  res.json({ success: true, data: user });
});

/* ── PATCH /api/admin/users/:id ───────────────────────── */
router.patch(
  "/users/:id",
  [
    body("role").optional().isIn(["FREE","SUBSCRIBER","SERIAL_USER","COVER_BUYER","ADMIN"]),
    body("status").optional().isIn(["ACTIVE","SUSPENDED","DELETED"]),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ success: false, error: errors.array()[0]?.msg }); return; }

    const { role, status } = req.body as { role?: string; status?: string };
    const data: Record<string, string> = {};
    if (role)   data["role"]   = role;
    if (status) data["status"] = status;

    if (!Object.keys(data).length) { res.status(400).json({ success: false, error: "Güncellenecek alan yok." }); return; }

    const user = await prisma.user.update({
      where: { id: req.params.id as string },
      data,
      select: { id: true, email: true, role: true, status: true },
    });
    res.json({ success: true, data: user });
  }
);

/* ── GET /api/admin/orders ────────────────────────────── */
router.get("/orders", async (req: Request, res: Response): Promise<void> => {
  const page   = Math.max(1, parseInt(qs(req, "page", "1")));
  const limit  = 25;
  const status = qs(req, "status");
  const q      = qs(req, "q");
  const skip   = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status) where["status"] = status;
  if (q) {
    where["user"] = { OR: [
      { email: { contains: q } },
      { firstName: { contains: q } },
      { lastName: { contains: q } },
    ]};
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip, take: limit,
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
        cargoTracking: { select: { status: true, trackingNumber: true, carrier: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  res.json({ success: true, data: { orders, total, page, totalPages: Math.ceil(total / limit) } });
});

/* ── GET /api/admin/orders/:id ────────────────────────── */
router.get("/orders/:id", async (req: Request, res: Response): Promise<void> => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id as string },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
      cargoTracking: true,
    },
  });

  if (!order) { res.status(404).json({ success: false, error: "Sipariş bulunamadı." }); return; }
  res.json({ success: true, data: order });
});

/* ── PATCH /api/admin/orders/:id ──────────────────────── */
router.patch(
  "/orders/:id",
  [body("status").isIn(["PENDING","CONFIRMED","IN_PRODUCTION","SHIPPED","DELIVERED","CANCELLED","REFUNDED"])],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ success: false, error: "Geçersiz durum." }); return; }

    const order = await prisma.order.update({
      where: { id: req.params.id as string },
      data: { status: req.body.status },
      include: { cargoTracking: true },
    });
    res.json({ success: true, data: order });
  }
);

/* ── PUT /api/admin/orders/:id/cargo ─────────────────── */
router.put(
  "/orders/:id/cargo",
  [
    body("carrier").optional().isString(),
    body("trackingNumber").optional().isString(),
    body("status").optional().isIn(["PENDING","PICKED_UP","IN_TRANSIT","DELIVERED","FAILED","RETURNED"]),
    body("currentLocation").optional().isString(),
    body("estimatedDate").optional().isISO8601(),
    body("notes").optional().isString(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ success: false, error: errors.array()[0]?.msg }); return; }

    const { carrier, trackingNumber, status, currentLocation, estimatedDate, notes } =
      req.body as {
        carrier?: string; trackingNumber?: string; status?: string;
        currentLocation?: string; estimatedDate?: string; notes?: string;
      };

    const data: Record<string, unknown> = {};
    if (carrier !== undefined)         data["carrier"]         = carrier;
    if (trackingNumber !== undefined)  data["trackingNumber"]  = trackingNumber;
    if (status !== undefined)          data["status"]          = status;
    if (currentLocation !== undefined) data["currentLocation"] = currentLocation;
    if (estimatedDate !== undefined)   data["estimatedDate"]   = new Date(estimatedDate);
    if (notes !== undefined)           data["notes"]           = notes;
    if (status === "PICKED_UP" || status === "IN_TRANSIT") data["shippedAt"]   = new Date();
    if (status === "DELIVERED")                            data["deliveredAt"] = new Date();

    const cargo = await prisma.cargoTracking.upsert({
      where:  { orderId: req.params.id as string },
      create: { orderId: req.params.id as string, ...data },
      update: data,
    });

    // Kargo durumunu sipariş durumuna yansıt
    const orderStatusMap: Record<string, string> = {
      PICKED_UP:  "SHIPPED",
      IN_TRANSIT: "SHIPPED",
      DELIVERED:  "DELIVERED",
      RETURNED:   "REFUNDED",
    };
    if (status && orderStatusMap[status]) {
      await prisma.order.update({
        where: { id: req.params.id as string },
        data:  { status: orderStatusMap[status] as OrderStatus },
      });
    }

    res.json({ success: true, data: cargo });
  }
);

export default router;
