/**
 * Parses an order date string into a local-midnight Date.
 *
 * Order dates arrive as free-form strings (mostly UK `DD/MM/YYYY`). Using the
 * native `new Date(str)` on those is unsafe — `new Date("25/09/2026")` is an
 * Invalid Date — so anything that needs to compare order dates MUST go through
 * this parser rather than `new Date` directly.
 */
export function parseOrderDate(dateStr: string): Date {
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
