import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import authRoutes from "./routes/auth.routes";
import uploadRoutes from "./routes/upload.routes";
import adminRoutes from "./routes/admin.routes";
import userRoutes from "./routes/user.routes";

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

/* ── Güvenlik ─────────────────────────────────────────── */
app.use(helmet());
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ── Temel Middleware ─────────────────────────────────── */
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ── Statik Dosyalar (uploads) ────────────────────────── */
const uploadDir = path.resolve(process.env.UPLOAD_DIR || "./uploads");
app.use("/uploads", express.static(uploadDir));

/* ── Routes ───────────────────────────────────────────── */
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);

/* ── Health Check ─────────────────────────────────────── */
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/* ── 404 Handler ──────────────────────────────────────── */
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Endpoint bulunamadı." });
});

/* ── Global Error Handler ─────────────────────────────── */
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[Server Error]", err.message);
  res.status(500).json({ success: false, error: "Sunucu hatası oluştu." });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend çalışıyor → http://localhost:${PORT}`);
  console.log(`   CORS origin: ${FRONTEND_URL}`);
});

export default app;
