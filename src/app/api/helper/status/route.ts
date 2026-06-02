import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/dal';
import { prisma } from '@/lib/db';

export async function GET() {
  await requireAdmin();

  const total = await prisma.knowledgeChunk.count();

  // Breakdown by page type
  const byType = await prisma.knowledgeChunk.groupBy({
    by: ['pageType'],
    _count: { id: true },
  });

  // Sample PDF chunk if any exist
  const pdfSample = await prisma.knowledgeChunk.findFirst({
    where: { pageType: 'pdf' },
    select: { url: true, content: true },
  });

  // Count distinct URLs
  const urlCount = await prisma.knowledgeChunk.findMany({
    select: { url: true },
    distinct: ['url'],
  });

  return NextResponse.json({
    total,
    distinctUrls: urlCount.length,
    byType: Object.fromEntries(byType.map((r) => [r.pageType, r._count.id])),
    pdfSample,
  });
}
