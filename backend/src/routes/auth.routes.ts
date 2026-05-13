import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../config/prisma";
import { requireAuth } from "../middleware/auth";
import { loginLimiter, registerLimiter, passwordResetLimiter } from "../middleware/rateLimiter";
import { sendVerificationEmail, sendPasswordResetEmail, sendPasswordChangedEmail } from "../lib/mail";

const router = Router();

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 8 * 60 * 60 * 1000, // 8 saat
};

function signToken(userId: string, email: string, role: string): string {
  return jwt.sign(
    { sub: userId, email, role },
    process.env.JWT_SECRET as string,
    { expiresIn: "8h" }
  );
}

function getClientIp(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown"
  );
}

/* ── POST /api/auth/giris ─────────────────────────────── */
router.post(
  "/giris",
  loginLimiter,
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, error: "Geçersiz e-posta veya şifre formatı." });
      return;
    }

    const { email, password } = req.body as { email: string; password: string };
    const ip = getClientIp(req);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.deletedAt || user.status === "SUSPENDED") {
      await prisma.failedLoginAttempt.create({
        data: { email: email.slice(0, 255), ipAddress: ip },
      });
      res.status(401).json({ success: false, error: "invalid_credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      await prisma.failedLoginAttempt.create({
        data: { email: email.slice(0, 255), ipAddress: ip, userId: user.id },
      });
      res.status(401).json({ success: false, error: "invalid_credentials" });
      return;
    }

    if (!user.emailVerified) {
      res.status(403).json({ success: false, error: "email_not_verified", email: user.email });
      return;
    }

    const token = signToken(user.id, user.email, user.role);

    res.cookie("__auth_token", token, COOKIE_OPTS);
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      },
    });
  }
);

/* ── POST /api/auth/kayit ─────────────────────────────── */
router.post(
  "/kayit",
  registerLimiter,
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 8 }).matches(/[A-Z]/).matches(/[0-9]/),
    body("firstName").trim().isLength({ min: 1, max: 100 }),
    body("lastName").trim().isLength({ min: 1, max: 100 }),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: errors.array()[0]?.msg || "Geçersiz veri.",
      });
      return;
    }

    const { email, password, firstName, lastName, phone, age, city, district, supportedTeam } = req.body as {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone?: string;
      age?: number;
      city?: string;
      district?: string;
      supportedTeam?: string;
    };

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      res.status(409).json({ success: false, error: "Bu e-posta adresi zaten kayıtlı." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        phone: phone || null,
        age: age ?? null,
        city: city || null,
        district: district || null,
        supportedTeam: supportedTeam || null,
        role: "FREE",
        status: "ACTIVE",
        emailVerified: false,
      },
    });

    const verifyToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(verifyToken).digest("hex");
    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    sendVerificationEmail(user.email, verifyToken).catch((err) =>
      console.error("[Kayit] Doğrulama maili gönderilemedi:", err)
    );

    res.status(201).json({
      success: true,
      data: { message: "Kayıt başarılı. E-postanızı doğrulayın." },
    });
  }
);

/* ── POST /api/auth/email-dogrula ────────────────────── */
router.post("/email-dogrula", async (req: Request, res: Response): Promise<void> => {
  const { token } = req.body as { token?: string };
  if (!token || typeof token !== "string") {
    res.status(400).json({ success: false, error: "Geçersiz token." });
    return;
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const record = await prisma.emailVerificationToken.findUnique({ where: { tokenHash } });

  if (!record) {
    res.status(400).json({ success: false, error: "invalid_token" });
    return;
  }
  if (record.usedAt) {
    res.status(400).json({ success: false, error: "token_used" });
    return;
  }
  if (record.expiresAt < new Date()) {
    res.status(400).json({ success: false, error: "token_expired" });
    return;
  }

  await prisma.$transaction([
    prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: true },
    }),
  ]);

  res.json({ success: true });
});

/* ── POST /api/auth/email-dogrulama-gonder ────────────── */
router.post(
  "/email-dogrulama-gonder",
  [body("email").isEmail().normalizeEmail()],
  async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body as { email: string };
    const user = await prisma.user.findUnique({ where: { email } });

    if (user && !user.emailVerified) {
      const verifyToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(verifyToken).digest("hex");
      await prisma.emailVerificationToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
      sendVerificationEmail(email, verifyToken).catch((err) =>
        console.error("[EmailDogrulama] Mail gönderilemedi:", err)
      );
    }

    res.json({ success: true });
  }
);

/* ── POST /api/auth/cikis ─────────────────────────────── */
router.post("/cikis", (_req: Request, res: Response): void => {
  res.clearCookie("__auth_token", { path: "/" });
  res.json({ success: true });
});

/* ── GET /api/auth/me ─────────────────────────────────── */
router.get("/me", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.sub },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      status: true,
      emailVerified: true,
    },
  });

  if (!user) {
    res.status(404).json({ success: false, error: "Kullanıcı bulunamadı." });
    return;
  }

  res.json({ success: true, data: user });
});

/* ── POST /api/auth/sifremi-unuttum ─────────────────────── */
router.post(
  "/sifremi-unuttum",
  passwordResetLimiter,
  [body("email").isEmail().normalizeEmail()],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, error: "Geçersiz e-posta." });
      return;
    }

    const { email } = req.body as { email: string };

    // User enumeration önleme — her durumda aynı yanıt
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 saat

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: token,
          resetPasswordExpiry: expiry,
        },
      });

      const resetLink = `${process.env.FRONTEND_URL || "https://hatiradergi.com"}/auth/sifremi-sifirla?token=${token}`;
      console.info("[PasswordReset] Token oluşturuldu:", email, resetLink);
      sendPasswordResetEmail(email, token).catch((err) =>
        console.error("[PasswordReset] Mail gönderilemedi:", err)
      );
    }

    res.json({
      success: true,
      data: null,
      message: "Şifre sıfırlama bağlantısı gönderildi (e-posta kayıtlıysa).",
    });
  }
);

/* ── POST /api/auth/sifremi-sifirla ─────────────────────── */
router.post(
  "/sifremi-sifirla",
  [
    body("token").isString().isLength({ min: 1 }),
    body("password").isLength({ min: 8 }).matches(/[A-Z]/).matches(/[0-9]/),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, error: "Geçersiz istek." });
      return;
    }

    const { token, password } = req.body as { token: string; password: string };

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      res.status(400).json({ success: false, error: "Token geçersiz veya süresi dolmuş." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpiry: null,
      },
    });

    sendPasswordChangedEmail(user.email).catch((err) =>
      console.error("[PasswordReset] Onay maili gönderilemedi:", err)
    );

    res.json({ success: true, data: null });
  }
);

export default router;
