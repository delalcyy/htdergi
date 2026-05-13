import nodemailer from "nodemailer";

const t = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: { rejectUnauthorized: false },
});

const FR = process.env.SMTP_FROM || "info@hatiradergi.com";
const BA = process.env.FRONTEND_URL || "https://hatiradergi.com";

export const sendPasswordResetEmail =
  async (to: string, token: string) =>
    t.sendMail({
      from: FR, to,
      subject: "Hatira Dergi - Sifre Sifirlama",
      text: "Sifrenizi sifirlamak icin: " + BA + "/auth/sifremi-sifirla?token=" + token,
    });

export const sendPasswordChangedEmail =
  async (to: string) =>
    t.sendMail({
      from: FR, to,
      subject: "Hatira Dergi - Sifreniz Degisti",
      text: "Sifreniz guncellendi. Giris: " + BA + "/auth/giris",
    });
