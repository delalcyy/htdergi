import nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: { rejectUnauthorized: false },
});

const FROM = process.env.MAIL_FROM || "Hatıra Dergi <info@hatiradergi.com>";

export async function sendMail(options: Mail.Options) {
  return transporter.sendMail({ from: FROM, ...options });
}

export async function verifySmtpConnection() {
  return transporter.verify();
}
