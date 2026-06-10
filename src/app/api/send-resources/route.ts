import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { verifySession } from '@/lib/dal';

export async function POST(req: NextRequest) {
  await verifySession();

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_NAME, SMTP_FROM_EMAIL } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return NextResponse.json(
      { error: 'Email is not configured. Please fill in SMTP settings in environment variables.' },
      { status: 500 },
    );
  }

  const { to, message } = (await req.json()) as { to: string; message: string };

  if (!to?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Email address and message are required.' }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT ?? '587'),
    secure: parseInt(SMTP_PORT ?? '587') === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  // Convert **word** markdown-style bold into HTML <strong> tags,
  // escape remaining HTML, and turn line breaks into <br>.
  const escapeHtml = (str: string) =>
    str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const htmlBody = escapeHtml(message)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" style="color:#2563eb;">$1</a>')
    .replace(/\n/g, '<br>');

  // Plain-text fallback: strip the ** markers
  const textBody = message.replace(/\*\*(.+?)\*\*/g, '$1');

  try {
    await transporter.sendMail({
      from: `"${SMTP_FROM_NAME ?? 'Projuice'}" <${SMTP_FROM_EMAIL ?? SMTP_USER}>`,
      to: to.trim(),
      subject: 'Your Projuice Resources Portal Access',
      text: textBody,
      html: htmlBody,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[send-resources] SMTP error:', msg);
    return NextResponse.json({ error: `Failed to send: ${msg}` }, { status: 500 });
  }
}
