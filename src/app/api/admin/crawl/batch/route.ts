import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/dal';
import { prisma } from '@/lib/db';
import { crawlUrl } from '@/lib/crawler';

export const maxDuration = 60;

const CONCURRENCY = 5;

/**
 * POST { urls: string[] }
 * Crawls the given URLs concurrently and writes chunks to the DB.
 * Returns { indexed: number } — the number of chunks saved.
 */
export async function POST(req: NextRequest) {
  await requireAdmin();

  const { urls } = (await req.json()) as { urls: string[] };
  if (!Array.isArray(urls) || urls.length === 0) {
    return NextResponse.json({ indexed: 0 });
  }

  let indexed = 0;

  // Process in groups of CONCURRENCY to avoid hammering the website
  for (let i = 0; i < urls.length; i += CONCURRENCY) {
    const batch = urls.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map((u) => crawlUrl(u)));
    const chunks = results.flat();

    if (chunks.length > 0) {
      await prisma.knowledgeChunk.createMany({
        data: chunks.map((c) => ({
          url: c.url,
          title: c.title,
          content: c.content,
          pageType: c.pageType,
        })),
      });
      indexed += chunks.length;
    }
  }

  return NextResponse.json({ indexed });
}
