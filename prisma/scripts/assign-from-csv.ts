/**
 * Assign the customers listed in a CSV to a team member.
 *
 * Built to re-apply an assignment batch that was lost before customer IDs were
 * stabilised. Each CSV row is matched to the CURRENT customer (by name +
 * postcode, falling back to email) and its stable ID is assigned to the given
 * user. Nothing is emailed — these recipients were already notified.
 *
 * The CSV is expected to be a dashboard export: a header row with at least
 * `customer_name`, `postcode` and `email` columns.
 *
 * Usage (run inside an environment that can reach the DB, with the connection
 * string exported as DATABASE_URL_UNPOOLED / DATABASE_URL):
 *
 *   npx tsx prisma/scripts/assign-from-csv.ts --csv=path/to/file.csv --assignee=sophie
 *   npx tsx prisma/scripts/assign-from-csv.ts --csv=path/to/file.csv --assignee=sophie@x.com --apply
 *
 * Dry run by default. BACK UP FIRST, review the dry run, then --apply.
 */
import { readFileSync } from 'node:fs';
import Papa from 'papaparse';
import { PrismaClient } from '../../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { buildCustomers, makeId } from '../../src/lib/dataTransforms';
import type { RawOrder } from '../../src/lib/types';

function arg(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : undefined;
}

const CSV_PATH = arg('csv');
const ASSIGNEE = arg('assignee');
const APPLY = process.argv.includes('--apply');

if (!CSV_PATH || !ASSIGNEE) {
  console.error('Usage: tsx prisma/scripts/assign-from-csv.ts --csv=<file> --assignee=<email-or-name> [--apply]');
  process.exit(1);
}

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

interface CsvRow { customer_name?: string; postcode?: string; email?: string }

const emailKey = (e?: string | null) => (e ?? '').trim().toLowerCase();

async function main() {
  console.log(`\n=== Assign from CSV — ${APPLY ? 'APPLY' : 'DRY RUN'} ===\n`);

  // 1. Parse the CSV
  const text = readFileSync(CSV_PATH!, 'utf8');
  const parsed = Papa.parse<CsvRow>(text, { header: true, skipEmptyLines: true });
  const rows = parsed.data.filter((r) => (r.customer_name ?? '').trim());
  console.log(`CSV rows: ${rows.length}`);

  // 2. Resolve the assignee (exactly one user)
  const users = await prisma.user.findMany({
    where: ASSIGNEE!.includes('@')
      ? { email: { equals: ASSIGNEE!, mode: 'insensitive' } }
      : { OR: [
          { name: { contains: ASSIGNEE!, mode: 'insensitive' } },
          { email: { contains: ASSIGNEE!, mode: 'insensitive' } },
        ] },
    select: { id: true, name: true, email: true, role: true },
  });
  if (users.length !== 1) {
    console.error(`\nExpected exactly one user matching "${ASSIGNEE}", found ${users.length}:`);
    for (const u of users) console.error(`  - ${u.name} <${u.email}> (${u.role})`);
    console.error('Re-run with --assignee set to the exact login email.');
    return;
  }
  const assignee = users[0];
  console.log(`Assignee: ${assignee.name} <${assignee.email}> (${assignee.role})\n`);

  // 3. Build the current customers and lookup indexes
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

  const byNamePostcode = new Map<string, string>(); // makeId(name, postcode) -> stable id
  const byEmail = new Map<string, string>();         // resolved email -> stable id
  for (const c of customers) {
    byNamePostcode.set(makeId(c.name, c.postcode), c.id);
    if (c.email) byEmail.set(emailKey(c.email), c.id);
  }

  // 4. Match each CSV row to a current customer
  const existing = await prisma.assignment.findMany();
  const currentAssignee = new Map(existing.map((a) => [a.customerId, a.userId]));
  const userNameById = new Map((await prisma.user.findMany({ select: { id: true, name: true } })).map((u) => [u.id, u.name]));

  const toAssign = new Map<string, string>(); // stable id -> csv display name
  const unmatched: string[] = [];
  const reassignedFrom: string[] = [];

  for (const r of rows) {
    const name = (r.customer_name ?? '').trim();
    const postcode = (r.postcode ?? '').trim();
    const email = emailKey(r.email);
    const id =
      byNamePostcode.get(makeId(name, postcode)) ??
      (email ? byEmail.get(email) : undefined);
    if (!id) {
      unmatched.push(`${name} | ${postcode} | ${r.email ?? ''}`);
      continue;
    }
    toAssign.set(id, name);
    const cur = currentAssignee.get(id);
    if (cur && cur !== assignee.id) {
      reassignedFrom.push(`${name}  (currently ${userNameById.get(cur) ?? cur})`);
    }
  }

  console.log(`Matched: ${toAssign.size}   Unmatched: ${unmatched.length}\n`);
  for (const [id, name] of toAssign) {
    const cur = currentAssignee.get(id);
    const note = !cur ? '' : cur === assignee.id ? '  (already assigned to them)' : `  (was ${userNameById.get(cur) ?? cur})`;
    console.log(`  ${name}  ->  ${id}${note}`);
  }
  if (reassignedFrom.length) {
    console.log(`\n⚠ ${reassignedFrom.length} were assigned to someone else and would move to ${assignee.name}:`);
    for (const line of reassignedFrom) console.log(`    ${line}`);
  }
  if (unmatched.length) {
    console.log(`\n⚠ ${unmatched.length} CSV rows could not be matched to a current customer (left untouched):`);
    for (const line of unmatched) console.log(`    ${line}`);
  }

  // 5. Apply
  if (APPLY && toAssign.size) {
    await prisma.$transaction(
      [...toAssign.keys()].map((customerId) =>
        prisma.assignment.upsert({
          where: { customerId },
          create: { customerId, userId: assignee.id },
          update: { userId: assignee.id, assignedAt: new Date() },
        }),
      ),
    );
    console.log(`\nDone. ${toAssign.size} customers assigned to ${assignee.name}.\n`);
  } else {
    console.log(APPLY ? '\nNothing to assign.\n' : '\nDry run only — re-run with --apply to write changes.\n');
  }
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
