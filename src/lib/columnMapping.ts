export const REQUIRED_SOURCE_COLUMNS = [
  'SalesOrder.Number',
  'SalesOrder.AccountName',
  'SalesOrder.DeliveryAddressLine5',
  'SalesOrder.ContactName',
  'SalesOrder.AmountWithCarriageNet',
  'SalesOrder.Date',
] as const;

export const OPTIONAL_SOURCE_COLUMNS = [
  'SalesOrder.CustomField1',
  'CustomerRecord.Email1',
] as const;

export function validateColumns(headers: string[]): string[] {
  const missing: string[] = [];
  for (const col of REQUIRED_SOURCE_COLUMNS) {
    if (!headers.includes(col)) {
      missing.push(col);
    }
  }
  return missing;
}

export function mapRow(row: Record<string, string>) {
  return {
    sales_order_number: row['SalesOrder.Number']?.trim() ?? '',
    customer_name: row['SalesOrder.AccountName']?.trim() ?? '',
    postcode: row['SalesOrder.DeliveryAddressLine5']?.trim() ?? '',
    contact_name: row['SalesOrder.ContactName']?.trim() ?? '',
    primary_email: row['SalesOrder.CustomField1']?.trim() || null,
    secondary_email: row['CustomerRecord.Email1']?.trim() || null,
    order_value: parseFloat(row['SalesOrder.AmountWithCarriageNet']) || 0,
    order_date: row['SalesOrder.Date']?.trim() ?? '',
  };
}
