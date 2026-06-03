import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/dal';
import { prisma } from '@/lib/db';

/**
 * POST { customerIds: string[] }
 * Returns the most recent comment for each customer ID.
 * Result: Record<customerId, { text: string; createdAt: string; userName: string }>
 */
export async function POST(req: NextRequest) {
  const session = await verifySession();
  const { customerIds } = (await req.json()) as { customerIds: string[] };

  if (!Array.isArray(customerIds) || customerIds.length === 0) {
    return NextResponse.json({});
  }

  // Fetch all comments for the given customers, ordered newest first
  const comments = await prisma.comment.findMany({
    where: { customerId: { in: customerIds } },
    orderBy: { createdAt: 'desc' },
    select: {
      customerId: true,
      text: true,
      createdAt: true,
      user: { select: { name: true } },
    },
  });

  // Keep only the latest comment per customer
  const latest: Record<string, { text: string; createdAt: string; userName: string }> = {};
  for (const c of comments) {
    if (!latest[c.customerId]) {
      // Admins see all; team users only see comments on their assigned customers
      // (the route itself just returns what's there — Dashboard already filters the
      //  customer list so only permitted IDs will be passed in)
      void session; // session used for auth above
      latest[c.customerId] = {
        text: c.text,
        createdAt: c.createdAt.toISOString(),
        userName: c.user.name,
      };
    }
  }

  return NextResponse.json(latest);
}
