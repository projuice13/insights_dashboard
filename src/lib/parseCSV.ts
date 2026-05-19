'use client';

import Papa from 'papaparse';
import { validateColumns, mapRow, REQUIRED_SOURCE_COLUMNS } from './columnMapping';
import { RawOrder } from './types';

export interface ParseResult {
  orders: RawOrder[];
  error: string | null;
}

export function parseCSV(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    // Read as text first so we can skip any preamble rows (e.g. Sage title/metadata lines)
    // before the actual column headers
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = (e.target?.result as string) ?? '';
      const lines = text.split(/\r?\n/);

      // Find the first line that contains one of the required column names
      const headerLineIndex = lines.findIndex((line) =>
        REQUIRED_SOURCE_COLUMNS.some((col) => line.includes(col)),
      );

      if (headerLineIndex === -1) {
        resolve({
          orders: [],
          error: 'Could not find the required column headers in the CSV. Please check the file format.',
        });
        return;
      }

      // Re-join from the header row onward and hand to PapaParse
      const csvContent = lines.slice(headerLineIndex).join('\n');

      Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        complete(results) {
          if (!results.data || results.data.length === 0) {
            resolve({ orders: [], error: 'The CSV file is empty.' });
            return;
          }

          const headers = results.meta.fields ?? [];
          const missing = validateColumns(headers);

          if (missing.length > 0) {
            resolve({
              orders: [],
              error: `Missing required columns: ${missing.join(', ')}`,
            });
            return;
          }

          const orders = (results.data as Record<string, string>[]).map(mapRow);
          resolve({ orders, error: null });
        },
        error(err: { message: string }) {
          resolve({ orders: [], error: `Failed to parse CSV: ${err.message}` });
        },
      });
    };

    reader.onerror = () => {
      resolve({ orders: [], error: 'Failed to read the CSV file.' });
    };

    reader.readAsText(file);
  });
}
