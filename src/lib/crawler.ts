import * as cheerio from 'cheerio';

// The site uses www — sitemaps return www URLs so we must match both
const BASE = 'https://www.projuice.co.uk';
const SITEMAP_BASE = 'https://projuice.co.uk'; // canonical sitemap index entry point
const FETCH_TIMEOUT = 12_000;

// ── URL discovery ────────────────────────────────────────────────────────────

/** Fetch text with a timeout so a slow page never hangs the whole job. */
async function fetchText(url: string): Promise<string> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'Projuice-Bot/1.0' } });
    if (!res.ok) return '';
    return await res.text();
  } catch {
    return '';
  } finally {
    clearTimeout(id);
  }
}

async function fetchBuffer(url: string): Promise<Buffer | null> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'Projuice-Bot/1.0' } });
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  } finally {
    clearTimeout(id);
  }
}

/** Parse a sitemap XML string and return all <loc> URLs. */
function parseSitemapUrls(xml: string): string[] {
  const matches = xml.match(/<loc>(.*?)<\/loc>/g) ?? [];
  return matches.map((m) => m.replace(/<\/?loc>/g, '').trim());
}

// Only crawl these specific sitemaps — others (post_tag, product_tag, etc.) aren't useful
const WANTED_SITEMAPS = ['product-sitemap.xml', 'product_cat-sitemap.xml', 'page-sitemap.xml'];

// Pages that must always be indexed even if absent from the sitemap
const ALWAYS_CRAWL = [
  'https://www.projuice.co.uk/delivery-information/',
  'https://resources.projuice.co.uk/allergen-information/',
];

/** Fetch the sitemap index and return crawlable page URLs. */
export async function discoverUrls(): Promise<string[]> {
  const indexXml = await fetchText(`${SITEMAP_BASE}/sitemap_index.xml`);
  const sitemapUrls = parseSitemapUrls(indexXml).filter(
    (u) => u.endsWith('.xml') && WANTED_SITEMAPS.some((w) => u.includes(w)),
  );

  const allPageUrls: string[] = [];

  for (const sitemapUrl of sitemapUrls) {
    const xml = await fetchText(sitemapUrl);
    // Accept both www and non-www URLs from the sitemap
    const urls = parseSitemapUrls(xml).filter(
      (u) => u.includes('projuice.co.uk') && !u.endsWith('.xml'),
    );
    allPageUrls.push(...urls);
  }

  // Always include hardcoded pages even if missing from sitemaps
  allPageUrls.push(...ALWAYS_CRAWL);

  return [...new Set(allPageUrls)];
}

// ── Content extraction ───────────────────────────────────────────────────────

function pageType(url: string): 'product' | 'category' | 'page' {
  if (url.includes('/product-category/') || url.includes('/product_cat/')) return 'category';
  if (url.includes('/product/')) return 'product';
  return 'page';
}

/** Strip all HTML and return clean text from a CSS selector. */
function textFrom($: cheerio.CheerioAPI, selector: string): string {
  return $(selector)
    .map((_, el) => $(el).text().trim())
    .get()
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract tables in a structured way so header→cell relationships are preserved.
 * e.g. "Product: Mango Smoothie | Gluten: No | Milk: No | Eggs: No"
 * This is critical for allergen tables so the AI can answer "does X contain Y?"
 */
function extractTables($: cheerio.CheerioAPI): string {
  const lines: string[] = [];

  $('table').each((_, table) => {
    // Try <th> in the first row as headers, fall back to first <td> row
    let headers: string[] = [];
    const firstRow = $(table).find('tr').first();
    headers = firstRow.find('th').map((_, th) => $(th).text().trim()).get();
    if (headers.length === 0) {
      headers = firstRow.find('td').map((_, td) => $(td).text().trim()).get();
    }

    $(table).find('tr').each((rowIdx, row) => {
      const cells = $(row).find('td').map((_, td) => $(td).text().trim()).get();
      if (cells.length === 0) return; // header row, skip

      if (headers.length > 0) {
        // Map each cell to its column header
        const parts = cells.map((cell, i) => {
          const header = headers[i] ?? `Col${i + 1}`;
          return `${header}: ${cell}`;
        });
        lines.push(parts.join(' | '));
      } else {
        lines.push(cells.join(' | '));
      }
    });

    lines.push(''); // blank line between tables
  });

  return lines.join('\n').trim();
}

export interface PageContent {
  url: string;
  title: string;
  content: string;
  pageType: 'product' | 'category' | 'page' | 'pdf';
  pdfUrls?: string[];
}

/** Extract meaningful text from a fetched HTML page. */
export function extractContent(url: string, html: string): PageContent {
  const $ = cheerio.load(html);

  // Remove noise
  $('nav, header, footer, script, style, [aria-hidden="true"], .site-header, .site-footer, .woocommerce-breadcrumb, .related, .upsells').remove();

  const type = pageType(url);
  const title =
    $('h1').first().text().trim() ||
    $('title').text().replace(/\s*[–|-].*$/, '').trim() ||
    url;

  let content = '';

  if (type === 'product') {
    const parts: string[] = [];
    parts.push(title);
    // Short description / intro
    parts.push(textFrom($, '.product-description'));
    parts.push(textFrom($, '.woocommerce-product-details__short-description'));
    // Tabs: ingredients, nutrition, delivery info — this is where ingredients live
    parts.push(textFrom($, '.tab-content'));
    parts.push(textFrom($, '.woocommerce-tabs'));
    // Fallback broad selectors
    parts.push(textFrom($, '.entry-content'));
    parts.push(textFrom($, '.summary'));
    parts.push(textFrom($, '.woocommerce-product-attributes'));
    // Catch-all: any element whose class contains 'ingredient', 'nutrition', 'allergen'
    parts.push(textFrom($, '[class*="ingredient"], [class*="nutrition"], [class*="allergen"]'));
    // Structured table extraction (preserves column headers)
    parts.push(extractTables($));
    content = parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  } else if (type === 'category') {
    const parts: string[] = [];
    parts.push(title);
    parts.push(textFrom($, '.woocommerce-archive-description'));
    parts.push(textFrom($, '.woocommerce-products-header'));
    parts.push(textFrom($, '.entry-content'));
    // Grab product names listed in the category
    $('.woocommerce-loop-product__title, .product-title').each((_, el) => {
      parts.push($(el).text().trim());
    });
    content = parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  } else {
    // Generic page — try specific WP/WooCommerce content wrappers first,
    // then fall back to the whole <main> / <body> so nothing is missed.
    const candidates = [
      textFrom($, '.entry-content'),
      textFrom($, '.page-content'),
      textFrom($, 'article'),
      textFrom($, 'main'),
      // Last-resort: everything left after nav/header/footer removal
      textFrom($, 'body'),
    ];
    // Use the first selector that returned meaningful text
    const best = candidates.find((t) => t.length > 100) ?? candidates.join(' ');
    // Always include structured table extraction for pages like the allergen table
    const tables = extractTables($);
    content = [title, best, tables].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  }

  // Find PDF links on product pages
  const pdfUrls: string[] = [];
  if (type === 'product') {
    $('a[href$=".pdf"], a[href*=".pdf?"]').each((_, el) => {
      const href = $(el).attr('href');
      if (!href) return;
      const absolute = href.startsWith('http') ? href : `${BASE}${href}`;
      pdfUrls.push(absolute);
    });
  }

  return { url, title, content, pageType: type, pdfUrls };
}

/** Parse a PDF buffer and return its text content. */
export async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const { extractText } = await import('unpdf');
    const { text } = await extractText(new Uint8Array(buffer), { mergePages: true });
    return text.replace(/\s+/g, ' ').trim();
  } catch (err) {
    console.error('PDF extraction error:', err);
    return '';
  }
}

// ── Chunking ─────────────────────────────────────────────────────────────────

const CHUNK_SIZE = 600;
const OVERLAP = 80;

export interface Chunk {
  url: string;
  title: string;
  content: string;
  pageType: 'product' | 'category' | 'page' | 'pdf';
}

export function chunkText(
  text: string,
  url: string,
  title: string,
  type: Chunk['pageType'],
): Chunk[] {
  if (!text || text.length < 50) return [];
  const chunks: Chunk[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    const content = text.slice(start, end).trim();
    if (content.length > 40) {
      chunks.push({ url, title, content, pageType: type });
    }
    start += CHUNK_SIZE - OVERLAP;
  }
  return chunks;
}

// ── Full page crawl (used by the batch route) ────────────────────────────────

export async function crawlUrl(url: string): Promise<Chunk[]> {
  const html = await fetchText(url);
  if (!html) return [];

  const page = extractContent(url, html);
  const chunks = chunkText(page.content, url, page.title, page.pageType);

  // Crawl any PDFs found on product pages
  for (const pdfUrl of page.pdfUrls ?? []) {
    const buf = await fetchBuffer(pdfUrl);
    if (!buf) continue;
    const pdfText = await extractPdfText(buf);
    if (!pdfText) continue;
    const pdfChunks = chunkText(pdfText, pdfUrl, `${page.title} (PDF)`, 'pdf');
    chunks.push(...pdfChunks);
  }

  return chunks;
}
