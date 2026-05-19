'use client';

interface RiskBadgeProps {
  riskLevel: 'high' | 'medium' | 'low';
  gapRatio: number;
  compact?: boolean;
}

const RISK_STYLES = {
  high: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  medium: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  low: 'bg-green-50 text-green-700 ring-1 ring-green-200',
};

const RISK_LABELS = {
  high: 'High Risk',
  medium: 'Medium Risk',
  low: 'Low Risk',
};

export default function RiskBadge({ riskLevel, gapRatio, compact = false }: RiskBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${RISK_STYLES[riskLevel]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          riskLevel === 'high' ? 'bg-red-500' : riskLevel === 'medium' ? 'bg-amber-500' : 'bg-green-500'
        }`}
      />
      {!compact && <span>{RISK_LABELS[riskLevel]}</span>}
      <span className="font-semibold">{gapRatio.toFixed(1)}×</span>
    </span>
  );
}
