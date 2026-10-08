import nodemailer from 'nodemailer';

export async function sendVerificationCode(email: string, code: string) {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_APP_PASSWORD?.replace(/\s/g, '');
  if (!user || !pass) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Email delivery is not configured. Add Gmail SMTP secrets to the server environment.');
    }
    console.info(`[LinguaLeap development OTP] ${email}: ${code} (expires in 10 minutes)`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 465),
    secure: Number(process.env.SMTP_PORT || 465) === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `LinguaLeap <${user}>`,
    to: email,
    subject: 'Your LinguaLeap sign-in code',
    text: `Your LinguaLeap verification code is ${code}. It expires in 10 minutes. If you did not request it, you can ignore this email.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:28px;color:#183a36"><h1 style="color:#14866d">Your sign-in code</h1><p>Enter this code in LinguaLeap to continue:</p><p style="font-size:32px;font-weight:bold;letter-spacing:8px;background:#f3fbf8;padding:18px;border-radius:12px;text-align:center">${code}</p><p>This code expires in 10 minutes. If you did not request it, ignore this message.</p></div>`,
  });
}
