import { Customer } from './types';

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function esc(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function exportCustomersCSV(
  customers: Customer[],
  latestNotes: Record<string, { text: string; createdAt: string; userName: string }> = {},
) {
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
    'latest_note',
    'latest_note_by',
    'latest_note_date',
  ];

  const rows = customers.map((c) => {
    const note = latestNotes[c.id];
    return [
      esc(c.name),
      esc(c.email),
      esc(c.postcode),
      esc(c.contactName),
      c.customerType,
      c.totalSpend.toFixed(2),
      formatDate(c.lastOrderDate),
      c.gapRatio.toFixed(1),
      c.riskLevel,
      note ? esc(note.text) : '""',
      note ? esc(note.userName) : '""',
      note ? note.createdAt.split('T')[0] : '""',
    ];
  });

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
