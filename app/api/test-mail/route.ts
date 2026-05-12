import { NextRequest, NextResponse } from "next/server";
import { sendMail, verifySmtpConnection } from "@/lib/mail";

// Sadece development'ta veya TEST_MAIL_SECRET eşleştiğinde çalışır
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-test-secret");
  const expectedSecret = process.env.TEST_MAIL_SECRET;

  const isAllowed =
    process.env.NODE_ENV !== "production" ||
    (expectedSecret && secret === expectedSecret);

  if (!isAllowed) {
    return NextResponse.json({ success: false, error: "Bu endpoint production'da kapalıdır." }, { status: 403 });
  }

  // 1. SMTP bağlantısını doğrula
  try {
    await verifySmtpConnection();
  } catch (err) {
    return NextResponse.json({
      success: false,
      step: "smtp_verify",
      error: err instanceof Error ? err.message : String(err),
      hint: "SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS değerlerini kontrol edin.",
    }, { status: 500 });
  }

  // 2. Test maili gönder
  let body: { to?: string } = {};
  try { body = await request.json(); } catch { /* to opsiyonel */ }

  const to = body.to || process.env.SMTP_USER || "info@hatiradergi.com";

  try {
    const info = await sendMail({
      to,
      subject: "Hatıra Dergi — SMTP Test Maili",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;">
          <h2 style="color:#1a1a1a;">SMTP Bağlantısı Başarılı</h2>
          <p style="color:#444;">Bu mail Natro SMTP üzerinden başarıyla gönderildi.</p>
          <table style="font-size:13px;color:#666;margin-top:16px;border-collapse:collapse;">
            <tr><td style="padding:4px 12px 4px 0;white-space:nowrap;">Host</td><td>${process.env.SMTP_HOST}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;">Port</td><td>${process.env.SMTP_PORT}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;">Secure</td><td>${process.env.SMTP_SECURE}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;">From</td><td>${process.env.MAIL_FROM}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;">To</td><td>${to}</td></tr>
          </table>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
          <p style="color:#aaa;font-size:11px;">${new Date().toISOString()}</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      to,
      messageId: info.messageId,
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      step: "send_mail",
      error: err instanceof Error ? err.message : String(err),
    }, { status: 500 });
  }
}
