export function classifyCustomerType(contactName: string): 'standard' | 'volume' {
  const cn = contactName.trim().toLowerCase();

  if (cn.startsWith('direct')) return 'volume';
  if (cn === 'fsp') return 'volume';
  if (cn === 'gregory') return 'volume';
  if (cn === 'langdons') return 'volume';
  if (cn.startsWith('pallet')) return 'volume';
  if (cn === 'peter green') return 'volume';

  return 'standard';
}
