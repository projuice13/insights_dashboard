import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { verifySession } from '@/lib/dal';
import { prisma } from '@/lib/db';

export const maxDuration = 60;

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY is not set');
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM = `You are a helpful internal assistant for Projuice, a food service company.
Answer questions using ONLY the website content provided below.
Be concise and friendly. Use bullet points when listing multiple items.
If the answer isn't covered by the provided content, say: "I don't have specific information about that — please check projuice.co.uk directly or ask the team."
Never make up prices, product details, or delivery terms that aren't in the content.`;

const STOP_WORDS = new Set([
  'what', 'does', 'have', 'with', 'that', 'this', 'from', 'your', 'tell',
  'about', 'which', 'are', 'the', 'and', 'for', 'our', 'any', 'can', 'you',
  'how', 'many', 'some', 'does', 'into', 'them', 'they', 'will', 'been',
  'was', 'has', 'its', 'also', 'just', 'more', 'such', 'like',
]);

type Row = { id: string; url: string; title: string; content: string; pageType: string };

export async function POST(req: NextRequest) {
  await verifySession();

  const { question } = (await req.json()) as { question: string };
  if (!question?.trim()) {
    return new Response('Question is required', { status: 400 });
  }

  // Check if the knowledge base has been indexed at all
  const totalCount = await prisma.knowledgeChunk.count();
  if (totalCount === 0) {
    return new Response(
      "The knowledge base hasn't been indexed yet — an admin needs to go to Settings and click 'Re-index knowledge base' first.",
      { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
    );
  }

  // 1️⃣ Full-text search
  let chunks = await prisma.$queryRaw<Row[]>`
    SELECT id, url, title, content, "pageType"
    FROM "KnowledgeChunk"
    WHERE to_tsvector('english', content || ' ' || title)
          @@ plainto_tsquery('english', ${question})
    ORDER BY ts_rank(
      to_tsvector('english', content || ' ' || title),
      plainto_tsquery('english', ${question})
    ) DESC
    LIMIT 6
  `;

  // 2️⃣ Keyword ILIKE fallback — runs when full-text search returns nothing
  if (chunks.length === 0) {
    const keywords = question
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOP_WORDS.has(w));

    const seen = new Set<string>();
    for (const keyword of keywords.slice(0, 4)) {
      if (chunks.length >= 6) break;
      const pattern = `%${keyword}%`;
      const found = await prisma.$queryRaw<Row[]>`
        SELECT id, url, title, content, "pageType"
        FROM "KnowledgeChunk"
        WHERE content ILIKE ${pattern} OR title ILIKE ${pattern}
        LIMIT 4
      `;
      for (const row of found) {
        if (!seen.has(row.id)) {
          seen.add(row.id);
          chunks.push(row);
        }
      }
    }
  }

  if (chunks.length === 0) {
    return new Response(
      "I couldn't find anything relevant in the knowledge base for that question. Try rephrasing, or check projuice.co.uk directly.",
      { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
    );
  }

  // Build context
  const context = chunks
    .map((c) => `[Source: ${c.title} — ${c.url}]\n${c.content}`)
    .join('\n\n---\n\n');

  const userMessage = `Website content:\n\n${context}\n\n---\n\nQuestion: ${question}`;

  // Stream Claude's answer
  const stream = client.messages.stream({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: SYSTEM,
    messages: [{ role: 'user', content: userMessage }],
  });

  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('Anthropic stream error:', msg);
        controller.enqueue(encoder.encode(`\n\n[Error: ${msg}]`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
