import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_PORT === '465',
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
});

const from = process.env.SMTP_FROM || 'noreply@valopoints.local';

export async function sendPasswordResetCode(to: string, code: string): Promise<boolean> {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log('[DEV] Password reset code (no SMTP configured):', code, 'for', to);
    return true;
  }
  try {
    await transporter.sendMail({
      from,
      to,
      subject: 'ValoPoints - Password Reset Code',
      text: `Your password reset code is: ${code}\n\nThis code expires in 15 minutes.\n\nIf you didn't request this, ignore this email.`,
      html: `
        <p>Your password reset code is: <strong>${code}</strong></p>
        <p>This code expires in 15 minutes.</p>
        <p>If you didn't request this, ignore this email.</p>
      `,
    });
    return true;
  } catch (err) {
    console.error('Email send failed:', err);
    return false;
  }
}
