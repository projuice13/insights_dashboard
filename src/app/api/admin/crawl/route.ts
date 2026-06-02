import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/dal';
import { prisma } from '@/lib/db';
import { discoverUrls } from '@/lib/crawler';

export const maxDuration = 60;

/** POST — discover all URLs from projuice.co.uk sitemaps and clear old index. */
export async function POST() {
  await requireAdmin();

  // Clear previous index
  await prisma.knowledgeChunk.deleteMany();

  const urls = await discoverUrls();
  return NextResponse.json({ urls, total: urls.length });
}

/** DELETE — clear the knowledge base without re-indexing. */
export async function DELETE() {
  await requireAdmin();
  await prisma.knowledgeChunk.deleteMany();
  return NextResponse.json({ ok: true });
}
