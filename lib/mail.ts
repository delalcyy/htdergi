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

const FROM = process.env.SMTP_FROM || process.env.MAIL_FROM || "Hatıra Dergi <info@hatiradergi.com>";
const APP_URL = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "https://hatiradergi.com";

export async function sendMail(options: Mail.Options) {
  return transporter.sendMail({ from: FROM, ...options });
}

export async function verifySmtpConnection() {
  return transporter.verify();
}

export async function sendVerificationEmail(to: string, token: string) {
  const url = `${APP_URL}/auth/email-dogrula?token=${token}`;
  return sendMail({
    from: FROM,
    to,
    subject: "Hatıra Dergi — E-posta Doğrulama",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;">
        <h2 style="color:#1a1a1a;margin-bottom:8px;">E-posta Adresinizi Doğrulayın</h2>
        <p style="color:#444;line-height:1.6;">Hatıra Dergi'ye kayıt olduğunuz için teşekkürler. Hesabınızı etkinleştirmek için aşağıdaki butona tıklayın.</p>
        <a href="${url}" style="display:inline-block;padding:12px 28px;background:#1a1a1a;color:#fff;text-decoration:none;border-radius:6px;margin:20px 0;font-weight:600;">
          E-postamı Doğrula
        </a>
        <p style="color:#888;font-size:13px;">Bu bağlantı 24 saat geçerlidir. Eğer bu işlemi siz yapmadıysanız bu e-postayı görmezden gelebilirsiniz.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
        <p style="color:#aaa;font-size:12px;">Hatıra Dergi — hatiradergi.com</p>
      </div>
    `,
  });
}

export async function sendContactEmail(params: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}) {
  const adminTo = process.env.CONTACT_FORM_EMAIL || process.env.CONTACT_EMAIL || "info@hatiradergi.com";
  return sendMail({
    from: FROM,
    to: adminTo,
    replyTo: params.email,
    subject: `İletişim Formu: ${params.subject} — ${params.name}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fff;">
        <h2 style="color:#1a1a1a;margin-bottom:16px;">Yeni İletişim Mesajı</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;">
          <tr><td style="padding:6px 0;color:#888;width:120px;">Ad Soyad</td><td style="padding:6px 0;font-weight:600">${params.name}</td></tr>
          <tr><td style="padding:6px 0;color:#888;">E-posta</td><td style="padding:6px 0"><a href="mailto:${params.email}" style="color:#2563eb">${params.email}</a></td></tr>
          ${params.phone ? `<tr><td style="padding:6px 0;color:#888;">Telefon</td><td style="padding:6px 0">${params.phone}</td></tr>` : ""}
          <tr><td style="padding:6px 0;color:#888;">Konu</td><td style="padding:6px 0">${params.subject}</td></tr>
        </table>
        <div style="background:#f9f9f9;border-left:3px solid #1a1a1a;padding:16px 20px;font-size:14px;line-height:1.7;color:#333;white-space:pre-wrap;">${params.message}</div>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
        <p style="color:#aaa;font-size:12px;">hatiradergi.com iletişim formu</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const url = `${APP_URL}/auth/sifremi-sifirla?token=${token}`;
  return sendMail({
    from: FROM,
    to,
    subject: "Hatıra Dergi — Şifre Sıfırlama",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;">
        <h2 style="color:#1a1a1a;margin-bottom:8px;">Şifre Sıfırlama</h2>
        <p style="color:#444;line-height:1.6;">Şifrenizi sıfırlamak için aşağıdaki butona tıklayın. Bu bağlantı <strong>1 saat</strong> geçerlidir.</p>
        <a href="${url}" style="display:inline-block;padding:12px 28px;background:#1a1a1a;color:#fff;text-decoration:none;border-radius:6px;margin:20px 0;font-weight:600;">
          Şifremi Sıfırla
        </a>
        <p style="color:#888;font-size:13px;">Eğer şifre sıfırlama talebinde bulunmadıysanız bu e-postayı görmezden gelebilirsiniz. Hesabınız güvende.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
        <p style="color:#aaa;font-size:12px;">Hatıra Dergi — hatiradergi.com</p>
      </div>
    `,
  });
}

export async function sendNewOrderNotificationToAdmin(params: {
  orderId: string;
  personName: string;
  categoryName: string;
  userEmail: string;
  userName: string;
}) {
  const adminTo = process.env.ORDER_NOTIFICATION_EMAIL || process.env.CONTACT_EMAIL || "info@hatiradergi.com";
  const detailUrl = `${APP_URL}/admin/siparisler/${params.orderId}`;
  return sendMail({
    from: FROM,
    to: adminTo,
    subject: `Yeni Sipariş: ${params.personName} — ${params.categoryName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;">
        <h2 style="color:#1a1a1a;margin-bottom:8px;">Yeni Sipariş Alındı</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0;background:#f9f9f9;padding:16px;border-radius:6px;">
          <tr><td style="padding:6px 0;color:#888;width:120px;">Kişi</td><td style="padding:6px 0;font-weight:600">${params.personName}</td></tr>
          <tr><td style="padding:6px 0;color:#888;">Kategori</td><td style="padding:6px 0">${params.categoryName}</td></tr>
          <tr><td style="padding:6px 0;color:#888;">Müşteri</td><td style="padding:6px 0">${params.userName} (${params.userEmail})</td></tr>
          <tr><td style="padding:6px 0;color:#888;">Sipariş ID</td><td style="padding:6px 0;font-family:monospace;font-size:12px">${params.orderId}</td></tr>
        </table>
        <a href="${detailUrl}" style="display:inline-block;padding:12px 28px;background:#1a1a1a;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">
          Admin Panelde Görüntüle
        </a>
      </div>
    `,
  });
}

export async function sendOrderConfirmationEmail(params: {
  to: string;
  name: string;
  orderId: string;
  categoryName: string;
  personName: string;
}) {
  return sendMail({
    from: FROM,
    to: params.to,
    subject: "Hatıra Dergi — Siparişiniz Alındı!",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;">
        <h2 style="color:#1a1a1a;margin-bottom:8px;">Siparişiniz Alındı</h2>
        <p style="color:#444;line-height:1.6;">Merhaba ${params.name}, siparişiniz başarıyla alınmıştır. Ekibimiz en kısa sürede inceleyecektir.</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin:20px 0;background:#f9f9f9;padding:16px;border-radius:6px;">
          <tr><td style="padding:6px 0;color:#888;width:120px;">Sipariş No</td><td style="padding:6px 0;font-family:monospace;font-size:12px">${params.orderId}</td></tr>
          <tr><td style="padding:6px 0;color:#888;">Kişi</td><td style="padding:6px 0;font-weight:600">${params.personName}</td></tr>
          <tr><td style="padding:6px 0;color:#888;">Kategori</td><td style="padding:6px 0">${params.categoryName}</td></tr>
        </table>
        <a href="${APP_URL}/panel/siparislerim" style="display:inline-block;padding:12px 28px;background:#1a1a1a;color:#fff;text-decoration:none;border-radius:6px;margin:8px 0;font-weight:600;">
          Siparişimi Takip Et
        </a>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
        <p style="color:#aaa;font-size:12px;">Hatıra Dergi — hatiradergi.com</p>
      </div>
    `,
  });
}

export async function sendOrderShippedEmail(params: {
  to: string;
  name: string;
  carrier: string;
  trackingNumber: string;
  estimatedDate?: string;
}) {
  return sendMail({
    from: FROM,
    to: params.to,
    subject: "Hatıra Dergi — Siparişiniz Kargoya Verildi!",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;">
        <h2 style="color:#1a1a1a;margin-bottom:8px;">Siparişiniz Yola Çıktı!</h2>
        <p style="color:#444;line-height:1.6;">Merhaba ${params.name}, siparişiniz kargoya verilmiştir.</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin:20px 0;background:#f9f9f9;padding:16px;border-radius:6px;">
          <tr><td style="padding:6px 0;color:#888;width:140px;">Kargo Firması</td><td style="padding:6px 0;font-weight:600">${params.carrier}</td></tr>
          <tr><td style="padding:6px 0;color:#888;">Takip Numarası</td><td style="padding:6px 0;font-weight:600;font-family:monospace">${params.trackingNumber}</td></tr>
          ${params.estimatedDate ? `<tr><td style="padding:6px 0;color:#888;">Tahmini Teslim</td><td style="padding:6px 0">${params.estimatedDate}</td></tr>` : ""}
        </table>
        <a href="${APP_URL}/panel/siparislerim" style="display:inline-block;padding:12px 28px;background:#1a1a1a;color:#fff;text-decoration:none;border-radius:6px;margin:8px 0;font-weight:600;">
          Sipariş Takibim
        </a>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
        <p style="color:#aaa;font-size:12px;">Hatıra Dergi — hatiradergi.com</p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(to: string) {
  return sendMail({
    to,
    subject: "Hatıra Dergi'ye Hoş Geldiniz",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;">
        <h2 style="color:#1a1a1a;margin-bottom:8px;">Hatıra Dergi'ye Hoş Geldiniz</h2>
        <p style="color:#444;line-height:1.6;">Merhaba,</p>
        <p style="color:#444;line-height:1.6;">Hatıra Dergi'ye hoş geldiniz.</p>
        <p style="color:#444;line-height:1.6;">Kaydınız başarıyla oluşturuldu. Artık hesabınıza giriş yaparak kapak tasarlama, röportaj oluşturma ve Hatıra Dergi deneyiminize başlayabilirsiniz.</p>
        <a href="${APP_URL}/auth/giris" style="display:inline-block;padding:12px 28px;background:#1a1a1a;color:#fff;text-decoration:none;border-radius:6px;margin:20px 0;font-weight:600;">
          Hesabıma Giriş Yap
        </a>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
        <p style="color:#aaa;font-size:12px;">Hatıra Dergi — hatiradergi.com</p>
      </div>
    `,
  });
}

export async function sendPasswordChangedEmail(to: string) {
  return sendMail({
    to,
    subject: "Hatıra Dergi — Şifreniz Değiştirildi",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;">
        <h2 style="color:#1a1a1a;margin-bottom:8px;">Şifreniz Başarıyla Değiştirildi</h2>
        <p style="color:#444;line-height:1.6;">Hesabınızın şifresi az önce güncellendi.</p>
        <p style="color:#444;line-height:1.6;">Bu işlemi siz yapmadıysanız hemen <a href="${APP_URL}/auth/sifremi-unuttum" style="color:#1a1a1a;font-weight:600;">şifrenizi sıfırlayın</a> ve hesabınızı güvenceye alın.</p>
        <a href="${APP_URL}/auth/giris" style="display:inline-block;padding:12px 28px;background:#1a1a1a;color:#fff;text-decoration:none;border-radius:6px;margin:20px 0;font-weight:600;">
          Hesabıma Giriş Yap
        </a>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
        <p style="color:#aaa;font-size:12px;">Hatıra Dergi — hatiradergi.com</p>
      </div>
    `,
  });
}

export async function sendSubscriptionConfirmationEmail(params: {
  to: string;
  name: string;
  planName: string;
  expiresAt: Date;
}) {
  const expiresStr = params.expiresAt.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  return sendMail({
    to: params.to,
    subject: "Hatıra Dergi — Aboneliğiniz Başladı!",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;">
        <h2 style="color:#1a1a1a;margin-bottom:8px;">Aboneliğiniz Aktif!</h2>
        <p style="color:#444;line-height:1.6;">Merhaba ${params.name}, <strong>${params.planName}</strong> aboneliğiniz başarıyla başlatıldı.</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin:20px 0;background:#f9f9f9;padding:16px;border-radius:6px;">
          <tr><td style="padding:6px 0;color:#888;width:140px;">Plan</td><td style="padding:6px 0;font-weight:600">${params.planName}</td></tr>
          <tr><td style="padding:6px 0;color:#888;">Bitiş Tarihi</td><td style="padding:6px 0;font-weight:600">${expiresStr}</td></tr>
        </table>
        <a href="${APP_URL}/kapak-tasarla/editor" style="display:inline-block;padding:12px 28px;background:#1a1a1a;color:#fff;text-decoration:none;border-radius:6px;margin:8px 0;font-weight:600;">
          Kapak Tasarlamaya Başla
        </a>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
        <p style="color:#aaa;font-size:12px;">Hatıra Dergi — hatiradergi.com</p>
      </div>
    `,
  });
}

export async function sendOrderDeliveredEmail(params: { to: string; name: string }) {
  return sendMail({
    from: FROM,
    to: params.to,
    subject: "Hatıra Dergi — Siparişiniz Teslim Edildi!",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;">
        <h2 style="color:#1a1a1a;margin-bottom:8px;">Siparişiniz Teslim Edildi</h2>
        <p style="color:#444;line-height:1.6;">Merhaba ${params.name}, siparişiniz başarıyla teslim edilmiştir. Hatıra Dergi'nizi keyifle kullanmanızı dileriz.</p>
        <a href="${APP_URL}/panel/siparislerim" style="display:inline-block;padding:12px 28px;background:#1a1a1a;color:#fff;text-decoration:none;border-radius:6px;margin:20px 0;font-weight:600;">
          Siparişlerim
        </a>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
        <p style="color:#aaa;font-size:12px;">Hatıra Dergi — hatiradergi.com</p>
      </div>
    `,
  });
}
