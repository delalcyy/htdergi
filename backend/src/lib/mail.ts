import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: { rejectUnauthorized: false },
});

const FROM = process.env.SMTP_FROM || process.env.MAIL_FROM || "Hatira Dergi <info@hatiradergi.com>";
const APP_URL = process.env.FRONTEND_URL || "https://hatiradergi.com";

export async function sendPasswordResetEmail(to: string, token: string) {
  const url = `${APP_URL}/auth/sifremi-sifirla?token=${token}`;
  return transporter.sendMail({
    from: FROM,
    to,
    subject: "Hatira Dergi — Sifre Sifirlama",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;">
        <h2 style="color:#1a1a1a;margin-bottom:8px;">Sifre Sifirlama</h2>
        <p style="color:#444;line-height:1.6;">Sifrenizi sifirlamak icin asagidaki butona tiklayin. Bu baglanti <strong>1 saat</strong> gecerlidir.</p>
        <a href="${url}" style="display:inline-block;padding:12px 28px;background:#1a1a1a;color:#fff;text-decoration:none;border-radius:6px;margin:20px 0;font-weight:600;">
          Sifremi Sifirla
        </a>
        <p style="color:#888;font-size:13px;">Eger sifre sifirlama talebinde bulunmadıysaniz bu e-postayı gormezden gelebilirsiniz. Hesabiniz guvende.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
        <p style="color:#aaa;font-size:12px;">Hatira Dergi — hatiradergi.com</p>
      </div>
    `,
  });
}

export async function sendPasswordChangedEmail(to: string) {
  return transporter.sendMail({
    from: FROM,
    to,
    subject: "Hatira Dergi — Sifreniz Degistirildi",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;">
        <h2 style="color:#1a1a1a;margin-bottom:8px;">Sifreniz Basariyla Degistirildi</h2>
        <p style="color:#444;line-height:1.6;">Hesabinizin sifresi az once guncellendi.</p>
        <p style="color:#444;line-height:1.6;">Bu islemi siz yapmadıysaniz hemen <a href="${APP_URL}/auth/sifremi-unuttum" style="color:#1a1a1a;font-weight:600;">sifrenizi sifirlayin</a> ve hesabinizi guvenceye alin.</p>
        <a href="${APP_URL}/auth/giris" style="display:inline-block;padding:12px 28px;background:#1a1a1a;color:#fff;text-decoration:none;border-radius:6px;margin:20px 0;font-weight:600;">
          Hesabima Giris Yap
        </a>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
        <p style="color:#aaa;font-size:12px;">Hatira Dergi — hatiradergi.com</p>
      </div>
    `,
  });
}
