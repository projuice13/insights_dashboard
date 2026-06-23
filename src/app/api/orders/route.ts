import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { verifySession } from '@/lib/dal';
import { prisma } from '@/lib/db';

interface OrderItem {
  product: string;
  quantity: number;
}

interface OrderBody {
  type?: 'order' | 'enquiry';
  postcode: string;
  address: string;
  businessName: string;
  contactName: string;
  phone: string;
  openingTimes: string;
  deliveryInstructions?: string;
  enquiryText?: string;
  items: OrderItem[];
}

function buildEmailText(order: OrderBody, placedBy: string): string {
  const date = new Date().toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const isEnquiry = order.type === 'enquiry';

  const customerLines = [
    `CUSTOMER DETAILS`,
    `─────────────────────────────────────`,
    `Business name:   ${order.businessName}`,
    `Postcode:        ${order.postcode}`,
    `Address:         ${order.address}`,
    `Contact name:    ${order.contactName}`,
    `Phone:           ${order.phone}`,
    `Opening times:   ${order.openingTimes}`,
    ...(order.deliveryInstructions ? [
      ``,
      `DELIVERY INSTRUCTIONS`,
      `─────────────────────────────────────`,
      order.deliveryInstructions,
    ] : []),
  ];

  const detailLines = isEnquiry
    ? [
        `ENQUIRY`,
        `─────────────────────────────────────`,
        order.enquiryText ?? '',
      ]
    : [
        `ORDER DETAILS`,
        `─────────────────────────────────────`,
        ...order.items.map((i) => `  ${i.product.padEnd(40)} x${i.quantity}`),
      ];

  return [
    isEnquiry
      ? `New enquiry submitted via the Projuice portal`
      : `New order placed via the Projuice portal`,
    ``,
    ...customerLines,
    ``,
    ...detailLines,
    ``,
    `Placed by: ${placedBy}`,
    `Date/time: ${date}`,
  ].join('\n');
}

export async function POST(req: NextRequest) {
  const session = await verifySession();
  const body = (await req.json()) as OrderBody;
  const isEnquiry = body.type === 'enquiry';

  // Save to DB
  const order = await prisma.order.create({
    data: {
      type: body.type ?? 'order',
      postcode: body.postcode,
      address: body.address,
      businessName: body.businessName,
      contactName: body.contactName,
      phone: body.phone,
      openingTimes: body.openingTimes,
      deliveryInstructions: body.deliveryInstructions ?? '',
      enquiryText: body.enquiryText ?? '',
      placedById: session.userId,
      ...(isEnquiry ? {} : {
        items: {
          create: body.items.map((i) => ({
            product: i.product,
            quantity: i.quantity,
          })),
        },
      }),
    },
  });

  // Send email notifications (non-blocking — don't fail the order if email fails)
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_NAME, SMTP_FROM_EMAIL,
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
        from: `"${SMTP_FROM_NAME ?? 'Projuice Portal'}" <${SMTP_FROM_EMAIL ?? SMTP_USER}>`,
        to: recipients.join(', '),
        subject: isEnquiry
          ? `New Enquiry — ${body.businessName}`
          : `New Order — ${body.businessName}`,
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
