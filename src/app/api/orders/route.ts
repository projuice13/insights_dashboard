import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { verifySession } from '@/lib/dal';
import { prisma } from '@/lib/db';

interface OrderItem {
  product: string;
  quantity: number;
}

interface OrderBody {
  postcode: string;
  address: string;
  businessName: string;
  contactName: string;
  phone: string;
  openingTimes: string;
  deliveryInstructions?: string;
  items: OrderItem[];
}

function buildEmailText(order: OrderBody, placedBy: string): string {
  const date = new Date().toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const itemLines = order.items
    .map((i) => `  ${i.product.padEnd(40)} x${i.quantity}`)
    .join('\n');

  return [
    `New order placed via the Projuice portal`,
    ``,
    `CUSTOMER DETAILS`,
    `─────────────────────────────────────`,
    `Business name:   ${order.businessName}`,
    `Address:         ${order.address}`,
    `Postcode:        ${order.postcode}`,
    `Contact name:    ${order.contactName}`,
    `Phone:           ${order.phone}`,
    `Opening times:   ${order.openingTimes}`,
    ...(order.deliveryInstructions ? [
      ``,
      `DELIVERY INSTRUCTIONS`,
      `─────────────────────────────────────`,
      order.deliveryInstructions,
    ] : []),
    ``,
    `ORDER DETAILS`,
    `─────────────────────────────────────`,
    itemLines,
    ``,
    `Placed by: ${placedBy}`,
    `Date/time: ${date}`,
  ].join('\n');
}

export async function POST(req: NextRequest) {
  const session = await verifySession();
  const body = (await req.json()) as OrderBody;

  // Save to DB
  const order = await prisma.order.create({
    data: {
      postcode: body.postcode,
      address: body.address,
      businessName: body.businessName,
      contactName: body.contactName,
      phone: body.phone,
      openingTimes: body.openingTimes,
      deliveryInstructions: body.deliveryInstructions ?? '',
      placedById: session.userId,
      items: {
        create: body.items.map((i) => ({
          product: i.product,
          quantity: i.quantity,
        })),
      },
    },
  });

  // Send email notifications (non-blocking — don't fail the order if email fails)
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_NAME,
          ORDER_NOTIFY_EMAIL_1, ORDER_NOTIFY_EMAIL_2 } = process.env;

  const recipients = [ORDER_NOTIFY_EMAIL_1, ORDER_NOTIFY_EMAIL_2].filter(Boolean) as string[];

  if (SMTP_HOST && SMTP_USER && SMTP_PASS && recipients.length > 0) {
    try {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT ?? '587'),
        secure: parseInt(SMTP_PORT ?? '587') === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      });

      await transporter.sendMail({
        from: `"${SMTP_FROM_NAME ?? 'Projuice Portal'}" <${SMTP_USER}>`,
        to: recipients.join(', '),
        subject: `New Order — ${body.businessName}`,
        text: buildEmailText(body, session.name),
      });
    } catch (err) {
      console.error('[orders] Email error:', err);
    }
  }

  return NextResponse.json({ ok: true, orderId: order.id });
}

export async function GET() {
  await verifySession();

  const orders = await prisma.order.findMany({
    orderBy: { placedAt: 'desc' },
    include: {
      items: true,
      placedBy: { select: { name: true } },
    },
  });

  return NextResponse.json(orders);
}
