import { NextResponse } from 'next/server';

function slugToName(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export async function GET() {
  try {
    // Revalidate every hour — no per-request sitemap fetches
    const res = await fetch('https://www.projuice.co.uk/product-sitemap.xml', {
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`Sitemap fetch failed: ${res.status}`);

    const xml = await res.text();

    // Extract every product URL from <loc> tags
    const matches = xml.match(
      /<loc>(https:\/\/(?:www\.)?projuice\.co\.uk\/product\/[^<]+)<\/loc>/g,
    ) ?? [];

    const names = matches
      .map((m) => {
        const url = m.replace(/<\/?loc>/g, '').trim();
        const slug = url
          .replace(/https?:\/\/(?:www\.)?projuice\.co\.uk\/product\//, '')
          .replace(/\/$/, '');
        return slugToName(slug);
      })
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    // Deduplicate
    const unique = [...new Set(names)];

    return NextResponse.json(unique, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600' },
    });
  } catch (err) {
    console.error('[/api/products]', err);
    return NextResponse.json([], { status: 200 }); // graceful empty fallback
  }
}
