import { Order } from './types';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function calculateChurnRisk(orders: Order[], today: Date = new Date()): {
  averageGapDays: number;
  currentGapDays: number;
  gapRatio: number;
  riskLevel: 'high' | 'medium' | 'low';
} {
  if (orders.length === 0) {
    return { averageGapDays: 0, currentGapDays: 0, gapRatio: 0, riskLevel: 'low' };
  }

  const sorted = [...orders].sort((a, b) => a.date.getTime() - b.date.getTime());
  const lastOrder = sorted[sorted.length - 1];
  const currentGapDays = Math.max(
    0,
    Math.floor((today.getTime() - lastOrder.date.getTime()) / MS_PER_DAY)
  );

  if (orders.length === 1) {
    // Single-order customer: use days since that order
    let riskLevel: 'high' | 'medium' | 'low';
    if (currentGapDays >= 90) riskLevel = 'high';
    else if (currentGapDays >= 60) riskLevel = 'medium';
    else riskLevel = 'low';

    return {
      averageGapDays: currentGapDays,
      currentGapDays,
      gapRatio: currentGapDays >= 90 ? 2.0 : currentGapDays >= 60 ? 1.5 : 0.9,
      riskLevel,
    };
  }

  const firstOrder = sorted[0];
  const totalMonths =
    (lastOrder.date.getFullYear() - firstOrder.date.getFullYear()) * 12 +
    (lastOrder.date.getMonth() - firstOrder.date.getMonth());

  const averageGapDays = totalMonths > 0
    ? (totalMonths / orders.length) * 30.44
    : currentGapDays;

  const gapRatio = averageGapDays > 0 ? currentGapDays / averageGapDays : 0;

  let riskLevel: 'high' | 'medium' | 'low';
  if (gapRatio >= 2.0) riskLevel = 'high';
  else if (gapRatio >= 1.5) riskLevel = 'medium';
  else riskLevel = 'low';

  return { averageGapDays, currentGapDays, gapRatio, riskLevel };
}
