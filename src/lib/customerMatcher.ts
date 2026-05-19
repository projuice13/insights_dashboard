import { RawOrder } from './types';

function normalizeName(name: string): string {
  let n = name.toLowerCase();
  // Strip accents/diacritics
  n = n.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  // Remove common business suffixes
  n = n.replace(/\b(ltd|limited|plc|inc|llc|co|company)\b/g, '');
  // Remove all punctuation
  n = n.replace(/[^\w\s]/g, '');
  // Collapse spaces
  n = n.replace(/\s+/g, ' ').trim();
  return n;
}

function normalizePostcode(postcode: string): string {
  return postcode.replace(/\s+/g, '').toUpperCase();
}

function resolveEmail(primary: string | null, secondary: string | null): string {
  return primary || secondary || '';
}

export interface MergedCustomer {
  orders: RawOrder[];
  displayName: string;
  postcode: string;
  contactName: string;
  email: string;
}

export function matchAndMergeCustomers(orders: RawOrder[]): MergedCustomer[] {
  // We use Union-Find to group orders belonging to the same customer
  const n = orders.length;
  const parent = Array.from({ length: n }, (_, i) => i);

  function find(x: number): number {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }

  function union(x: number, y: number) {
    const px = find(x);
    const py = find(y);
    if (px !== py) parent[px] = py;
  }

  // Build lookup maps
  const namePostcodeMap = new Map<string, number>();
  const emailMap = new Map<string, number>();

  for (let i = 0; i < n; i++) {
    const o = orders[i];
    const key = `${normalizeName(o.customer_name)}|${normalizePostcode(o.postcode)}`;
    const emails = [o.primary_email, o.secondary_email].filter(Boolean) as string[];

    // Check name+postcode match
    if (namePostcodeMap.has(key)) {
      union(i, namePostcodeMap.get(key)!);
    } else {
      namePostcodeMap.set(key, i);
    }

    // Check email matches
    for (const email of emails) {
      const lc = email.toLowerCase();
      if (emailMap.has(lc)) {
        union(i, emailMap.get(lc)!);
      } else {
        emailMap.set(lc, i);
      }
    }
  }

  // After all unions, rebuild the maps so root always points to the canonical group
  // (re-run find to path-compress)
  for (let i = 0; i < n; i++) find(i);

  // Group orders by root
  const groups = new Map<number, number[]>();
  for (let i = 0; i < n; i++) {
    const root = find(i);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root)!.push(i);
  }

  const merged: MergedCustomer[] = [];

  for (const [, indices] of groups) {
    const groupOrders = indices.map((i) => orders[i]);

    // Find most recent order for display name / contact / postcode
    const sorted = [...groupOrders].sort(
      (a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
    );
    const mostRecent = sorted[0];

    // Resolve email: use primary if any row has it, else secondary
    const primaryEmail = groupOrders.find((o) => o.primary_email)?.primary_email ?? null;
    const secondaryEmail = groupOrders.find((o) => o.secondary_email)?.secondary_email ?? null;

    merged.push({
      orders: groupOrders,
      displayName: mostRecent.customer_name,
      postcode: mostRecent.postcode,
      contactName: mostRecent.contact_name,
      email: resolveEmail(primaryEmail, secondaryEmail),
    });
  }

  return merged;
}
