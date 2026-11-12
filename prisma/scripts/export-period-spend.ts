/**
 * Period spend report.
 *
 * Groups customers exactly as the dashboard does (buildCustomers: matching +
 * merges), sums each customer's spend from orders whose date falls within a
 * window, keeps every customer with at least one order in that window
 * (standard AND bulk/volume), and ranks them by spend, highest first.
 *
 * Outputs a CSV (one row per customer). Default window: 1 Nov 2025 – 31 Oct 2026.
 *
 * Usage (run where the DB is reachable, with the connection string exported as
 * DATABASE_URL_UNPOOLED / DATABASE_URL):
 *
 *   npx tsx prisma/scripts/export-period-spend.ts
 *   npx tsx prisma/scripts/export-period-spend.ts --from=2025-11-01 --to=2026-10-31 --out=period-spend.csv
 */
import { writeFileSync } from 'node:fs';
import { PrismaClient } from '../../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { buildCustomers } from '../../src/lib/dataTransforms';
import type { RawOrder } from '../../src/lib/types';

function arg(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : undefined;
}

// Inclusive window. Defaults to the requested 1 Nov 2025 – 31 Oct 2026.
const FROM = new Date(`${arg('from') ?? '2025-11-01'}T00:00:00`);
const TO = new Date(`${arg('to') ?? '2026-10-31'}T23:59:59.999`);
const OUT = arg('out') ?? `period-spend-${arg('from') ?? '2025-11-01'}_to_${arg('to') ?? '2026-10-31'}.csv`;

const connectionString =
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('No database URL found. Export DATABASE_URL_UNPOOLED (or DATABASE_URL) first.');
}

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`;

async function main() {
  console.log(`Period: ${FROM.toISOString().slice(0, 10)} to ${TO.toISOString().slice(0, 10)}`);

  const [rawRows, mergeRows] = await Promise.all([
    prisma.rawOrderRow.findMany({ orderBy: { salesOrderNumber: 'asc' } }),
    prisma.customerMerge.findMany(),
  ]);
  const rawOrders: RawOrder[] = rawRows.map((r) => ({
    sales_order_number: r.salesOrderNumber,
    customer_name: r.customerName,
    postcode: r.postcode,
    contact_name: r.contactName,
    primary_email: r.primaryEmail,
    secondary_email: r.secondaryEmail,
    order_value: r.orderValue,
    order_date: r.orderDate,
  }));
  const merges = mergeRows.map((m) => ({
    sourceId: m.sourceId,
    canonicalName: m.canonicalName,
    canonicalPostcode: m.canonicalPostcode,
  }));

  const customers = buildCustomers(rawOrders, merges);

  const rows = customers
    .map((c) => {
      const windowOrders = c.orders.filter((o) => o.date >= FROM && o.date <= TO);
      const spend = windowOrders.reduce((s, o) => s + o.value, 0);
      return {
        name: c.name,
        email: c.email,
        postcode: c.postcode,
        region: c.contactName,
        type: c.customerType === 'volume' ? 'Bulk' : 'Standard',
        orders: windowOrders.length,
        spend,
      };
    })
    .filter((r) => r.orders > 0) // only customers who traded in the window
    .sort((a, b) => b.spend - a.spend);

  const header = ['rank', 'customer_name', 'email', 'postcode', 'region', 'customer_type', 'orders_in_period', 'total_spend'];
  const lines = rows.map((r, i) =>
    [
      i + 1,
      esc(r.name),
      esc(r.email),
      esc(r.postcode),
      esc(r.region),
      r.type,
      r.orders,
      r.spend.toFixed(2),
    ].join(','),
  );
  writeFileSync(OUT, [header.join(','), ...lines].join('\n'), 'utf8');

  const total = rows.reduce((s, r) => s + r.spend, 0);
  console.log(`Customers with sales in period: ${rows.length}`);
  console.log(`Total spend across them: £${total.toFixed(2)}`);
  console.log(`Wrote: ${OUT}`);
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
