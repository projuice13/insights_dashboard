import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { verifySession } from '@/lib/dal';

export async function POST(req: NextRequest) {
  await verifySession();

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_NAME } = process.env;

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

  try {
    await transporter.sendMail({
      from: `"${SMTP_FROM_NAME ?? 'Projuice'}" <${SMTP_USER}>`,
      to: to.trim(),
      subject: 'Your Projuice Resources Portal Access',
      text: message,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[send-resources] SMTP error:', msg);
    return NextResponse.json({ error: `Failed to send: ${msg}` }, { status: 500 });
  }
}
