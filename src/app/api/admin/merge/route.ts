import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

interface MergeBody {
  canonical: { id: string; name: string; postcode: string };
  sourceIds: string[];
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: MergeBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { canonical, sourceIds } = body;
  if (!canonical?.id || !sourceIds?.length) {
    return NextResponse.json({ error: 'Missing canonical or sourceIds.' }, { status: 400 });
  }

  // Read conditional data before the transaction
  const [canonicalAssignment, canonicalStatus] = await Promise.all([
    prisma.assignment.findUnique({ where: { customerId: canonical.id } }),
    prisma.customerStatus.findUnique({ where: { customerId: canonical.id } }),
  ]);

  const sourceAssignment = !canonicalAssignment
    ? await prisma.assignment.findFirst({ where: { customerId: { in: sourceIds } } })
    : null;

  const sourceStatus = !canonicalStatus
    ? await prisma.customerStatus.findFirst({ where: { customerId: { in: sourceIds } } })
    : null;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Record the merge mappings (skip if any sourceId was already merged)
      await tx.customerMerge.createMany({
        data: sourceIds.map((sourceId) => ({
          sourceId,
          canonicalId: canonical.id,
          canonicalName: canonical.name,
          canonicalPostcode: canonical.postcode,
          mergedById: session.userId,
        })),
        skipDuplicates: true,
      });

      // 2. Move comments from sources to canonical
      await tx.comment.updateMany({
        where: { customerId: { in: sourceIds } },
        data: { customerId: canonical.id },
      });

      // 3. Migrate assignment if canonical has none
      if (sourceAssignment) {
        await tx.assignment.upsert({
          where: { customerId: canonical.id },
          create: {
            customerId: canonical.id,
            userId: sourceAssignment.userId,
            assignedAt: sourceAssignment.assignedAt,
          },
          update: {},
        });
      }
      await tx.assignment.deleteMany({ where: { customerId: { in: sourceIds } } });

      // 4. Migrate status tag if canonical has none
      if (sourceStatus) {
        await tx.customerStatus.upsert({
          where: { customerId: canonical.id },
          create: {
            customerId: canonical.id,
            customerName: canonical.name,
            status: sourceStatus.status,
            approvalStatus: sourceStatus.approvalStatus,
            reason: sourceStatus.reason,
            setById: sourceStatus.setById,
            setAt: sourceStatus.setAt,
            approvedById: sourceStatus.approvedById,
            approvedAt: sourceStatus.approvedAt,
          },
          update: {},
        });
      }
      await tx.customerStatus.deleteMany({ where: { customerId: { in: sourceIds } } });

      // 5. Reroute notifications to canonical
      await tx.notification.updateMany({
        where: { customerId: { in: sourceIds } },
        data: { customerId: canonical.id, customerName: canonical.name },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[merge] error:', message);
    return NextResponse.json({ error: `Merge failed: ${message}` }, { status: 500 });
  }
}
