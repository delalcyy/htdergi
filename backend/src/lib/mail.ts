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

export const sendVerificationEmail =
  async (to: string, token: string) =>
    t.sendMail({
      from: FR, to,
      subject: "Hatıra Dergi — E-posta Adresinizi Doğrulayın",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;">
          <h2 style="color:#1a1a1a;margin-bottom:8px;">E-posta Adresinizi Doğrulayın</h2>
          <p style="color:#444;line-height:1.6;">Hatıra Dergi'ye kayıt olduğunuz için teşekkürler. Hesabınızı etkinleştirmek için aşağıdaki butona tıklayın.</p>
          <a href="${BA}/auth/email-dogrula?token=${token}" style="display:inline-block;padding:12px 28px;background:#1a1a1a;color:#fff;text-decoration:none;border-radius:6px;margin:20px 0;font-weight:600;">
            E-postamı Doğrula
          </a>
          <p style="color:#888;font-size:13px;">Bu bağlantı 24 saat geçerlidir. Bu işlemi siz yapmadıysanız bu e-postayı görmezden gelebilirsiniz.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
          <p style="color:#aaa;font-size:12px;">Hatıra Dergi — hatiradergi.com</p>
        </div>
      `,
    });

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
