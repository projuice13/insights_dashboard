/**
 * One-off recovery + migration for the customer-ID stabilisation.
 *
 * Why this exists
 * ---------------
 * Customer IDs used to be derived from whichever order looked "most recent",
 * which was non-deterministic (unordered query + a broken date sort). The ID
 * for a customer could therefore differ between page loads, which silently
 * orphaned everything keyed by customerId — most visibly assignments, so a
 * team member stopped being able to see customers that had been assigned to
 * them and the admin saw them as unassigned.
 *
 * The code now derives a STABLE id (canonicalCustomerId = the lexicographically
 * smallest per-row makeId across the customer's whole group). This script
 * migrates the stored rows onto those stable IDs — which also restores the
 * lost assignments, because the orphaned rows are still in the database under
 * one of the customer's old candidate IDs.
 *
 * How the mapping is built
 * ------------------------
 * For the current raw orders, every row's per-row makeId is a value the old
 * (drifting) ID could have taken for that customer. We map each such candidate
 * old ID to the customer's new stable ID. Any stored customerId matching a
 * candidate is remapped; anything we can't resolve is reported, never guessed.
 *
 * Usage
 * -----
 *   npx tsx prisma/scripts/remap-customer-ids.ts            # dry run (default)
 *   npx tsx prisma/scripts/remap-customer-ids.ts --apply    # write changes
 *
 * BACK UP THE DATABASE FIRST. Run the dry run, read the summary, then --apply.
 */
import { PrismaClient } from '../../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { makeId, customerIdByOrderNumber } from '../../src/lib/dataTransforms';
import type { RawOrder } from '../../src/lib/types';

const APPLY = process.argv.includes('--apply');

const connectionString =
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('No database URL found. Run: vercel env pull .env.local --environment=production --yes');
}

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function buildOldToNew(): Promise<Map<string, string>> {
  const [rows, mergeRows] = await Promise.all([
    prisma.rawOrderRow.findMany({ orderBy: { salesOrderNumber: 'asc' } }),
    prisma.customerMerge.findMany(),
  ]);
  const rawOrders: RawOrder[] = rows.map((r) => ({
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

  const idByOrder = customerIdByOrderNumber(rawOrders, merges);

  // Candidate old ID (per-row makeId) -> new stable ID for the group.
  const oldToNew = new Map<string, string>();
  for (const o of rawOrders) {
    const newId = idByOrder.get(o.sales_order_number);
    if (!newId) continue;
    oldToNew.set(makeId(o.customer_name, o.postcode), newId);
  }
  // Also map each merge's canonical identity to the group it resolves into.
  for (const m of mergeRows) {
    const canonicalKey = makeId(m.canonicalName, m.canonicalPostcode);
    const newId = oldToNew.get(canonicalKey);
    if (newId) oldToNew.set(m.sourceId, newId);
  }
  return oldToNew;
}

/** Resolve a stored id to its new id, or null if it's already current / unknown. */
function resolve(storedId: string, oldToNew: Map<string, string>, validNew: Set<string>) {
  if (validNew.has(storedId)) return null; // already a current stable id
  const mapped = oldToNew.get(storedId);
  if (!mapped || mapped === storedId) return null;
  return mapped;
}

async function main() {
  console.log(`\n=== Customer ID remap — ${APPLY ? 'APPLY' : 'DRY RUN'} ===\n`);

  const oldToNew = await buildOldToNew();
  const validNew = new Set(oldToNew.values());
  console.log(`Current customers: ${validNew.size}`);
  console.log(`Candidate old IDs mapped: ${oldToNew.size}\n`);

  const unresolved = new Set<string>();
  let remapped = 0;
  let conflicts = 0;

  // --- Tables with customerId as the primary key (rename or merge) ---
  for (const table of ['assignment', 'customerStatus', 'churnEmailContact'] as const) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = (prisma as any)[table];
    const records: { customerId: string; assignedAt?: Date; setAt?: Date }[] = await model.findMany();
    for (const rec of records) {
      const newId = resolve(rec.customerId, oldToNew, validNew);
      if (!newId) {
        if (!validNew.has(rec.customerId) && !oldToNew.has(rec.customerId)) unresolved.add(rec.customerId);
        continue;
      }
      const target = await model.findUnique({ where: { customerId: newId } });
      if (target) {
        // A row already exists under the new id — keep it, drop the stale one.
        conflicts++;
        console.log(`  [${table}] conflict: ${rec.customerId} -> ${newId} (target exists; stale row ${APPLY ? 'deleted' : 'would be deleted'})`);
        if (APPLY) await model.delete({ where: { customerId: rec.customerId } });
      } else {
        remapped++;
        console.log(`  [${table}] ${rec.customerId} -> ${newId}`);
        if (APPLY) await model.update({ where: { customerId: rec.customerId }, data: { customerId: newId } });
      }
    }
  }

  // --- Tables with customerId as a non-unique column (plain update) ---
  for (const table of ['comment', 'notification'] as const) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = (prisma as any)[table];
    const distinct: { customerId: string }[] = await model.findMany({
      select: { customerId: true },
      distinct: ['customerId'],
    });
    for (const { customerId } of distinct) {
      const newId = resolve(customerId, oldToNew, validNew);
      if (!newId) {
        if (!validNew.has(customerId) && !oldToNew.has(customerId)) unresolved.add(customerId);
        continue;
      }
      const res = await (APPLY
        ? model.updateMany({ where: { customerId }, data: { customerId: newId } })
        : model.count({ where: { customerId } }).then((count: number) => ({ count })));
      remapped += res.count ?? 0;
      console.log(`  [${table}] ${customerId} -> ${newId} (${res.count} row(s))`);
    }
  }

  // --- CustomerMerge: both sourceId and canonicalId are customer IDs ---
  const merges = await prisma.customerMerge.findMany();
  for (const m of merges) {
    const newSource = resolve(m.sourceId, oldToNew, validNew);
    const newCanonical = resolve(m.canonicalId, oldToNew, validNew);
    if (!newSource && !newCanonical) continue;
    console.log(`  [customerMerge:${m.id}] source ${m.sourceId}->${newSource ?? '(unchanged)'} canonical ${m.canonicalId}->${newCanonical ?? '(unchanged)'}`);
    if (APPLY) {
      await prisma.customerMerge.update({
        where: { id: m.id },
        data: {
          ...(newSource ? { sourceId: newSource } : {}),
          ...(newCanonical ? { canonicalId: newCanonical } : {}),
        },
      });
    }
    if (newSource) remapped++;
  }

  console.log(`\n--- Summary ---`);
  console.log(`Rows remapped:   ${remapped}`);
  console.log(`Conflicts:       ${conflicts}`);
  console.log(`Unresolved IDs:  ${unresolved.size}`);
  if (unresolved.size > 0) {
    console.log(`  (these stored customerIds match no current customer — no order for them, or a customer that no longer exists; left untouched for manual review)`);
    for (const id of unresolved) console.log(`    ${id}`);
  }
  console.log(APPLY ? `\nDone. Changes written.\n` : `\nDry run only — re-run with --apply to write changes.\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
