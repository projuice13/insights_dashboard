import { Order, YoYComparison, MonthlyComparison } from './types';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function calculateYoY(orders: Order[], today: Date = new Date()): YoYComparison {
  const thisYear = today.getFullYear();
  const lastYear = thisYear - 1;
  const currentMonth = today.getMonth(); // 0-indexed

  const thisYearOrders = orders.filter((o) => o.date.getFullYear() === thisYear);
  const lastYearOrders = orders.filter((o) => o.date.getFullYear() === lastYear);

  const isNewCustomer = lastYearOrders.length === 0;

  // Full last year totals
  const lastYearFullSpend = lastYearOrders.reduce((s, o) => s + o.value, 0);
  const lastYearFullAvgOrder = lastYearOrders.length > 0 ? lastYearFullSpend / lastYearOrders.length : 0;

  // YTD: Jan through current month for both years
  const thisYtdOrders = thisYearOrders.filter((o) => o.date.getMonth() <= currentMonth);
  const lastYtdOrders = lastYearOrders.filter((o) => o.date.getMonth() <= currentMonth);

  const thisYtdSpend = thisYtdOrders.reduce((s, o) => s + o.value, 0);
  const lastYtdSpend = lastYtdOrders.reduce((s, o) => s + o.value, 0);

  const thisAvg = thisYtdOrders.length > 0 ? thisYtdSpend / thisYtdOrders.length : 0;
  const lastAvg = lastYtdOrders.length > 0 ? lastYtdSpend / lastYtdOrders.length : 0;

  function pctChange(current: number, previous: number): number {
    if (previous === 0 && current === 0) return 0;
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
  }

  const orderCountChange =
    thisYtdOrders.length === 0 && lastYtdOrders.length === 0
      ? 0
      : lastYtdOrders.length === 0
      ? 100
      : pctChange(thisYtdOrders.length, lastYtdOrders.length);

  const spendChange =
    thisYtdSpend === 0 && lastYtdSpend === 0
      ? 0
      : lastYtdSpend === 0
      ? 100
      : pctChange(thisYtdSpend, lastYtdSpend);

  const avgOrderChange = pctChange(thisAvg, lastAvg);

  // Monthly breakdown for all 12 months
  const monthlyBreakdown: MonthlyComparison[] = MONTH_NAMES.map((month, idx) => {
    const tyOrders = thisYearOrders.filter((o) => o.date.getMonth() === idx);
    const lyOrders = lastYearOrders.filter((o) => o.date.getMonth() === idx);
    return {
      month,
      monthIndex: idx,
      lastYearOrders: lyOrders.length,
      thisYearOrders: idx <= currentMonth ? tyOrders.length : 0,
      lastYearSpend: lyOrders.reduce((s, o) => s + o.value, 0),
      thisYearSpend: idx <= currentMonth ? tyOrders.reduce((s, o) => s + o.value, 0) : 0,
    };
  });

  return {
    lastYearFullOrders: lastYearOrders.length,
    lastYearFullSpend,
    lastYearFullAvgOrder,
    lastYearOrders: lastYtdOrders.length,
    lastYearSpend: lastYtdSpend,
    lastYearAvgOrder: lastAvg,
    thisYearOrders: thisYtdOrders.length,
    thisYearSpend: thisYtdSpend,
    thisYearAvgOrder: thisAvg,
    orderCountChange,
    spendChange,
    avgOrderChange,
    monthlyBreakdown,
    isNewCustomer,
  };
}
