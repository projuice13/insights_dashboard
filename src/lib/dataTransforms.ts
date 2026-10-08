import { RawOrder, Customer, Order } from './types';
import { matchAndMergeCustomers } from './customerMatcher';
import { classifyCustomerType } from './volumeClassifier';
import { calculateChurnRisk } from './churnScoring';
import { calculateYoY } from './yoyComparison';
import { parseOrderDate } from './dateParse';

// Re-exported for existing importers.
export { parseOrderDate };

/** Returns the most frequently occurring value in an array. */
function mostCommon(values: string[]): string {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  let best = values[0];
  let bestCount = 0;
  for (const [v, c] of counts) {
    if (c > bestCount) { best = v; bestCount = c; }
  }
  return best;
}

/** Per-row ID key: normalised name + postcode, so branches stay distinct. */
export function makeId(name: string, postcode: string): string {
  return `${name.trim().toLowerCase()}|${postcode.replace(/\s+/g, '').toUpperCase()}`;
}

/**
 * A customer's stable ID — the key every assignment, status, comment and
 * churn-list row is stored against.
 *
 * It MUST be a pure function of the group's membership and nothing else:
 * independent of the order the raw rows arrive in, and unchanged when a new
 * order lands for an existing customer. We therefore take the lexicographically
 * smallest per-row `makeId` across the whole group rather than reading it off
 * whichever order happens to look "most recent" — the latter changes between
 * page loads (the raw-order query is unordered and the date sort was a no-op),
 * which silently orphaned assignments when the derived ID drifted.
 */
export function canonicalCustomerId(
  groupOrders: { customer_name: string; postcode: string }[],
): string {
  let best: string | null = null;
  for (const o of groupOrders) {
    const key = makeId(o.customer_name, o.postcode);
    if (best === null || key < best) best = key;
  }
  return best ?? '';
}

/**
 * Formats a region/contact name for display.
 * Title-cases each word, but preserves short all-uppercase words as acronyms
 * (e.g. "FSP" → "FSP", "DHL" → "DHL", "devon" → "Devon").
 * A word is treated as an acronym if it is all uppercase letters and ≤ 4 characters.
 */
export function formatRegion(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => {
      // Preserve acronyms: already all-caps, purely alphabetic, 2–4 chars
      if (/^[A-Z]{2,4}$/.test(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

export interface MergeMapping {
  sourceId: string;
  canonicalName: string;
  canonicalPostcode: string;
}

/** Rewrite rows whose natural ID has been merged into another customer. */
function applyMerges(rawOrders: RawOrder[], merges: MergeMapping[]): RawOrder[] {
  const mergeMap = new Map(merges.map((m) => [m.sourceId, { name: m.canonicalName, postcode: m.canonicalPostcode }]));
  if (mergeMap.size === 0) return rawOrders;
  return rawOrders.map((row) => {
    const canonical = mergeMap.get(makeId(row.customer_name, row.postcode));
    return canonical ? { ...row, customer_name: canonical.name, postcode: canonical.postcode } : row;
  });
}

/**
 * Maps each raw order (by sales order number) to the stable ID of the customer
 * it belongs to, applying the same grouping and merge logic as buildCustomers.
 * Used where we need a customer's ID from a raw order without rebuilding every
 * customer (e.g. the CSV importer) and by the ID-remap recovery script.
 */
export function customerIdByOrderNumber(
  rawOrders: RawOrder[],
  merges: MergeMapping[] = [],
): Map<string, string> {
  const merged = matchAndMergeCustomers(applyMerges(rawOrders, merges));
  const map = new Map<string, string>();
  for (const m of merged) {
    const id = canonicalCustomerId(m.orders);
    for (const o of m.orders) map.set(o.sales_order_number, id);
  }
  return map;
}

export function buildCustomers(
  rawOrders: RawOrder[],
  merges: MergeMapping[] = [],
  today: Date = new Date(),
): Customer[] {
  const merged = matchAndMergeCustomers(applyMerges(rawOrders, merges));

  return merged.map((m) => {
    const orders: Order[] = m.orders.map((o) => ({
      date: parseOrderDate(o.order_date),
      value: o.order_value,
    }));

    // Total spend covers the last 12 months (rolling), not the full history.
    const spendWindowStart = new Date(today.getFullYear(), today.getMonth() - 12, today.getDate());
    const totalSpend = orders.reduce((s, o) => s + (o.date >= spendWindowStart ? o.value : 0), 0);
    const sortedOrders = [...orders].sort((a, b) => b.date.getTime() - a.date.getTime());
    const lastOrderDate = sortedOrders[0]?.date ?? today;

    // Use the most common contact name across all orders for both display and classification.
    // This prevents a single outlier order (e.g. one "Direct" order among many "Devon" orders)
    // from flipping the customer type or the displayed region.
    const allContactNames = m.orders.map((o) => o.contact_name).filter(Boolean);
    const rawContactName = allContactNames.length > 0 ? mostCommon(allContactNames) : m.contactName;
    const customerType = classifyCustomerType(rawContactName);
    const contactName = formatRegion(rawContactName);

    const churn = calculateChurnRisk(orders, today);
    const yoy = calculateYoY(orders, today);

    return {
      // Stable, order-independent identity (see canonicalCustomerId). Display
      // fields below still follow the most-recent order.
      id: canonicalCustomerId(m.orders),
      name: m.displayName,
      postcode: m.postcode,
      contactName,
      email: m.email,
      customerType,
      orders: sortedOrders,
      totalSpend,
      totalOrders: orders.length,
      lastOrderDate,
      averageGapDays: churn.averageGapDays,
      currentGapDays: churn.currentGapDays,
      gapRatio: churn.gapRatio,
      riskLevel: churn.riskLevel,
      yoyComparison: yoy,
    };
  });
}
