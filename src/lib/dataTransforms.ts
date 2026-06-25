import { RawOrder, Customer, Order } from './types';
import { matchAndMergeCustomers } from './customerMatcher';
import { classifyCustomerType } from './volumeClassifier';
import { calculateChurnRisk } from './churnScoring';
import { calculateYoY } from './yoyComparison';

function parseOrderDate(dateStr: string): Date {
  const today = new Date();
  const raw = dateStr?.trim();
  if (!raw) return today;

  // Strip any time component so "30/04/2026 09:30:00" or "2026-04-30T09:30:00" become just the date part
  const s = raw.split(/[\sT]/)[0];

  let day: number, month: number, year: number;

  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmy) {
    day = parseInt(dmy[1], 10);
    month = parseInt(dmy[2], 10) - 1;
    year = parseInt(dmy[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  // YYYY-MM-DD (ISO)
  const iso = s.match(/^(\d{4})[\/\-](\d{2})[\/\-](\d{2})$/);
  if (iso) {
    year = parseInt(iso[1], 10);
    month = parseInt(iso[2], 10) - 1;
    day = parseInt(iso[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  // MM/DD/YYYY fallback (US format)
  const mdy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (mdy) {
    month = parseInt(mdy[1], 10) - 1;
    day = parseInt(mdy[2], 10);
    year = parseInt(mdy[3], 10);
    if (year < 100) year += 2000;
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  // Last resort — try native parser but use local midnight to avoid UTC shift
  const native = new Date(s);
  if (!isNaN(native.getTime())) {
    return new Date(native.getFullYear(), native.getMonth(), native.getDate());
  }

  return today;
}

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

/** Stable ID for a customer: normalised name + postcode, so branches stay distinct. */
export function makeId(name: string, postcode: string): string {
  return `${name.trim().toLowerCase()}|${postcode.replace(/\s+/g, '').toUpperCase()}`;
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

export function buildCustomers(
  rawOrders: RawOrder[],
  merges: MergeMapping[] = [],
  today: Date = new Date(),
): Customer[] {
  // Remap rows whose natural ID has been merged into another customer
  const mergeMap = new Map(merges.map((m) => [m.sourceId, { name: m.canonicalName, postcode: m.canonicalPostcode }]));
  const remapped = mergeMap.size === 0 ? rawOrders : rawOrders.map((row) => {
    const rowId = makeId(row.customer_name, row.postcode);
    const canonical = mergeMap.get(rowId);
    return canonical ? { ...row, customer_name: canonical.name, postcode: canonical.postcode } : row;
  });

  const merged = matchAndMergeCustomers(remapped);

  return merged.map((m) => {
    const orders: Order[] = m.orders.map((o) => ({
      date: parseOrderDate(o.order_date),
      value: o.order_value,
    }));

    const totalSpend = orders.reduce((s, o) => s + o.value, 0);
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
      id: makeId(m.displayName, m.postcode),
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
