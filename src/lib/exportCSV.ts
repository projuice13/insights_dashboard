import { Customer } from './types';

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

export function exportCustomersCSV(customers: Customer[]) {
  const headers = [
    'customer_name',
    'email',
    'postcode',
    'contact_name',
    'customer_type',
    'total_spend',
    'last_order_date',
    'risk_score',
    'risk_level',
  ];

  const rows = customers.map((c) => [
    `"${c.name.replace(/"/g, '""')}"`,
    `"${c.email.replace(/"/g, '""')}"`,
    `"${c.postcode}"`,
    `"${c.contactName.replace(/"/g, '""')}"`,
    c.customerType,
    c.totalSpend.toFixed(2),
    formatDate(c.lastOrderDate),
    c.gapRatio.toFixed(1),
    c.riskLevel,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const today = new Date().toISOString().split('T')[0];
  const a = document.createElement('a');
  a.href = url;
  a.download = `projuice-churn-export-${today}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

