import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/dal';
import { prisma } from '@/lib/db';

export async function GET() {
  await requireAdmin();

  const total = await prisma.knowledgeChunk.count();

  // Check which URLs have been indexed
  const indexed = await prisma.knowledgeChunk.findMany({
    select: { url: true },
    distinct: ['url'],
  });

  const urls = indexed.map((r) => r.url);

  // Pull a sample chunk from the delivery page so we can verify content
  const deliverySample = await prisma.knowledgeChunk.findFirst({
    where: { url: { contains: 'delivery' } },
    select: { url: true, content: true },
  });

  return NextResponse.json({ total, urls, deliverySample });
}
