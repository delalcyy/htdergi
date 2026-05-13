import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { prisma } from "../config/prisma";
import { requireAuth } from "../middleware/auth";

const router = Router();

/* ── PUT /api/user/profil ─────────────────────────────── */
router.put(
  "/profil",
  requireAuth,
  [
    body("firstName").trim().isLength({ min: 2, max: 50 }),
    body("lastName").trim().isLength({ min: 2, max: 50 }),
    body("phone").optional({ nullable: true }).trim().isLength({ max: 20 }),
    body("age").optional({ nullable: true }).isInt({ min: 1, max: 120 }),
    body("city").optional({ nullable: true }).trim().isLength({ max: 80 }),
    body("district").optional({ nullable: true }).trim().isLength({ max: 80 }),
    body("supportedTeam").optional({ nullable: true }).trim().isLength({ max: 100 }),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, error: errors.array()[0]?.msg || "Geçersiz veri." });
      return;
    }

    const { firstName, lastName, phone, age, city, district, supportedTeam } =
      req.body as {
        firstName: string;
        lastName: string;
        phone?: string | null;
        age?: number | null;
        city?: string | null;
        district?: string | null;
        supportedTeam?: string | null;
      };

    await prisma.user.update({
      where: { id: req.user!.sub },
      data: {
        firstName,
        lastName,
        phone: phone || null,
        age: age ?? null,
        city: city || null,
        district: district || null,
        supportedTeam: supportedTeam || null,
      },
    });

    res.json({ success: true, data: null });
  }
);

export default router;
