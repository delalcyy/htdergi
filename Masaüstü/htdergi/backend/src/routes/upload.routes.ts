import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs";
import { requireAuth } from "../middleware/auth";
import { uploadMiddleware } from "../middleware/upload";
import { uploadLimiter } from "../middleware/rateLimiter";
import { prisma } from "../config/prisma";

const router = Router();

const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp"];

/* ── POST /api/upload ─────────────────────────────────── */
router.post(
  "/",
  requireAuth,
  uploadLimiter,
  uploadMiddleware.single("file"),
  async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ success: false, error: "Dosya bulunamadı." });
      return;
    }

    if (!ALLOWED_MIMES.includes(req.file.mimetype)) {
      fs.unlink(req.file.path, () => {});
      res.status(400).json({ success: false, error: "Geçersiz dosya türü." });
      return;
    }

    const draftId = req.body.draftId as string | undefined;

    if (draftId) {
      const draft = await prisma.coverDraft.findUnique({ where: { id: draftId } });
      if (!draft || draft.userId !== req.user!.sub) {
        fs.unlink(req.file.path, () => {});
        res.status(403).json({ success: false, error: "Yetkisiz." });
        return;
      }

      await prisma.coverDraft.update({
        where: { id: draftId },
        data: { uploadedImageUrl: req.file.filename },
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      data: {
        filename: req.file.filename,
        url: fileUrl,
        size: req.file.size,
        mimeType: req.file.mimetype,
      },
    });
  }
);

/* ── DELETE /api/upload/:filename ─────────────────────── */
router.delete("/:filename", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const filename = req.params["filename"] as string;

  if (!filename || filename.includes("..") || filename.includes("/")) {
    res.status(400).json({ success: false, error: "Geçersiz dosya adı." });
    return;
  }

  const uploadDir = process.env.UPLOAD_DIR || "./uploads";
  const filePath = path.join(uploadDir, filename);

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ success: false, error: "Dosya bulunamadı." });
    return;
  }

  fs.unlink(filePath, (err) => {
    if (err) {
      res.status(500).json({ success: false, error: "Dosya silinemedi." });
      return;
    }
    res.json({ success: true, data: null });
  });
});

export default router;
