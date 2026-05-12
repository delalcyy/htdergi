import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 60 * 1000,       // 1 dakika
  max: 5,
  message: { success: false, error: "Çok fazla deneme. Lütfen 1 dakika bekleyin." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const registerLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,  // 5 dakika
  max: 5,
  message: { success: false, error: "Çok fazla kayıt denemesi. Lütfen bekleyin." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, error: "Çok fazla yükleme isteği." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 3,
  message: { success: false, error: "Çok fazla şifre sıfırlama isteği. Lütfen bekleyin." },
  standardHeaders: true,
  legacyHeaders: false,
});
