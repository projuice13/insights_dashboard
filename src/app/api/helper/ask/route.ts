import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { verifySession } from '@/lib/dal';
import { prisma } from '@/lib/db';

export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM = `You are a helpful internal assistant for Projuice, a food service company.
Answer questions using ONLY the website content provided below.
Be concise and friendly. Use bullet points when listing multiple items.
If the answer isn't covered by the provided content, say: "I don't have specific information about that — please check projuice.co.uk directly or ask the team."
Never make up prices, product details, or delivery terms that aren't in the content.`;

export async function POST(req: NextRequest) {
  await verifySession(); // any logged-in user can ask

  const { question } = (await req.json()) as { question: string };
  if (!question?.trim()) {
    return new Response('Question is required', { status: 400 });
  }

  // Full-text search for relevant chunks
  type Row = { id: string; url: string; title: string; content: string; pageType: string };
  const chunks = await prisma.$queryRaw<Row[]>`
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

  // If no chunks found, return a helpful no-data message
  if (chunks.length === 0) {
    return new Response(
      "I don't have specific information about that in my knowledge base. The website may not have been indexed yet, or this topic isn't covered in the pages I've crawled. Please check projuice.co.uk directly or ask the team.",
      { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
    );
  }

  // Build context string
  const context = chunks
    .map((c) => `[Source: ${c.title} (${c.url})]\n${c.content}`)
    .join('\n\n---\n\n');

  const userMessage = `Website content:\n\n${context}\n\n---\n\nQuestion: ${question}`;

  // Stream Claude's response
  const stream = client.messages.stream({
    model: 'claude-3-5-haiku-20241022',
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
      } catch {
        controller.enqueue(encoder.encode('\n\n[Error generating response]'));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
