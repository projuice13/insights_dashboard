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
  'how', 'many', 'some', 'into', 'them', 'they', 'will', 'been', 'was',
  'has', 'its', 'also', 'just', 'more', 'such', 'like', 'when', 'where',
  'there', 'their', 'then', 'than',
]);

function extractKeywords(question: string): string[] {
  return question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

export async function POST(req: NextRequest) {
  await verifySession();

  const { question } = (await req.json()) as { question: string };
  if (!question?.trim()) {
    return new Response('Question is required', { status: 400 });
  }

  // Check if the knowledge base has been indexed
  const totalCount = await prisma.knowledgeChunk.count();
  if (totalCount === 0) {
    return new Response(
      "The knowledge base hasn't been indexed yet — an admin needs to go to the Helper page and click 'Re-index website' first.",
      { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
    );
  }

  const keywords = extractKeywords(question);

  if (keywords.length === 0) {
    return new Response(
      "Please ask a more specific question.",
      { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
    );
  }

  // Search: find chunks matching any keyword, score by how many they match
  const seen = new Map<string, { chunk: typeof allChunks[0]; score: number }>();

  const allChunks = await prisma.knowledgeChunk.findMany({
    where: {
      OR: keywords.flatMap((k) => [
        { content: { contains: k, mode: 'insensitive' } },
        { title: { contains: k, mode: 'insensitive' } },
      ]),
    },
    select: { id: true, url: true, title: true, content: true, pageType: true },
    take: 50, // fetch more, then rank
  });

  // Score each chunk by number of keywords matched
  for (const chunk of allChunks) {
    const text = (chunk.content + ' ' + chunk.title).toLowerCase();
    const score = keywords.filter((k) => text.includes(k)).length;
    const existing = seen.get(chunk.id);
    if (!existing || score > existing.score) {
      seen.set(chunk.id, { chunk, score });
    }
  }

  // Sort by score descending, take top 6
  const ranked = [...seen.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((r) => r.chunk);

  if (ranked.length === 0) {
    return new Response(
      "I couldn't find anything relevant in the knowledge base for that question. Try using different keywords, or check projuice.co.uk directly.",
      { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
    );
  }

  // Build context
  const context = ranked
    .map((c) => `[Source: ${c.title} — ${c.url}]\n${c.content}`)
    .join('\n\n---\n\n');

  const userMessage = `Website content:\n\n${context}\n\n---\n\nQuestion: ${question}`;

  // Stream Claude's answer
  const stream = client.messages.stream({
    model: 'claude-haiku-4-5',
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
