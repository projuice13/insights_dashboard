import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getSession } from '@/lib/session';

interface CustomerPayload {
  name: string;
  email: string;
  postcode: string;
  contactName: string;
  customerType: string;
  totalSpend: number;
  lastOrderDate: string;
  gapRatio: number;
  riskLevel: string;
}

interface RequestBody {
  customers: CustomerPayload[];
  teamMember: { name: string; email: string };
}

function buildCSV(customers: CustomerPayload[]): string {
  const headers = [
    'customer_name',
    'email',
    'postcode',
    'region',
    'customer_type',
    'total_spend',
    'last_order_date',
    'risk_score',
    'risk_level',
    'notes',
  ];

  const q = (s: string) => `"${String(s).replace(/"/g, '""')}"`;

  const rows = customers.map((c) => [
    q(c.name),
    q(c.email),
    q(c.postcode),
    q(c.contactName),
    c.customerType,
    c.totalSpend.toFixed(2),
    c.lastOrderDate,
    c.gapRatio.toFixed(1),
    c.riskLevel,
    '',
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Check config is present
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_NAME, SMTP_FROM_EMAIL } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return NextResponse.json(
      { error: 'Email is not configured. Please fill in SMTP settings in .env.local and restart the server.' },
      { status: 500 }
    );
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { customers, teamMember } = body;

  if (!customers?.length || !teamMember?.email) {
    return NextResponse.json({ error: 'Missing customers or team member.' }, { status: 400 });
  }

  const csv = buildCSV(customers);
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const filename = `churn-assign-${teamMember.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT ?? '587'),
    secure: parseInt(SMTP_PORT ?? '587') === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const firstName = teamMember.name.split(' ')[0];
  const count = customers.length;

  try {
    await transporter.sendMail({
      from: `"${SMTP_FROM_NAME ?? 'Customer Churn Dashboard'}" <${SMTP_FROM_EMAIL ?? SMTP_USER}>`,
      to: teamMember.email,
      subject: `Customer follow-up list — ${today}`,
      text: [
        `Hi ${firstName},`,
        '',
        `You've just been assigned the following customer${count === 1 ? '' : 's'} in the Insights Dashboard:`,
        '',
        ...customers.map((c) => `• ${c.name} | ${c.contactName} | ${c.postcode}`),
        '',
        'You can login here: https://insights-dashboard-five.vercel.app/',
        '',
        'Thanks',
      ].join('\n'),
      attachments: [
        {
          filename,
          content: csv,
          contentType: 'text/csv',
        },
      ],
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[send-assignment] SMTP error:', message);
    return NextResponse.json(
      { error: `Failed to send email: ${message}` },
      { status: 500 }
    );
  }
}
