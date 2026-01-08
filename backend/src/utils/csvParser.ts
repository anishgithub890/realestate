/**
 * CSV Parser Utility
 * Handles parsing of CSV/Excel files for bulk data import
 */

export const parseCsvText = (text: string): string[][] => {
  const rows: string[][] = [];
  let current = '';
  let row: string[] = [];
  let insideQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (char === '"') {
      const nextChar = text[i + 1];
      if (insideQuotes && nextChar === '"') {
        current += '"';
        i += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (char === ',' && !insideQuotes) {
      row.push(current);
      current = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && text[i + 1] === '\n') {
        i += 1;
      }
      row.push(current);
      rows.push(row);
      row = [];
      current = '';
      continue;
    }

    current += char;
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current);
    rows.push(row);
  }

  return rows
    .map((cols) => cols.map((col) => (col ?? '').trim()))
    .filter((cols) => cols.some((col) => col.length > 0));
};

/**
 * Build header map from CSV header row
 */
export const buildHeaderMap = (headerRow: string[]): Map<string, number> => {
  const headerMap = new Map<string, number>();

  headerRow.forEach((rawHeader, index) => {
    const cleaned = rawHeader.replace(/^\ufeff/, '').toLowerCase().trim();
    headerMap.set(cleaned, index);
  });

  return headerMap;
};

/**
 * Get value from row using header map with multiple possible keys
 */
export const getValueFromRow = (
  row: string[],
  headerMap: Map<string, number>,
  keys: string[]
): string | undefined => {
  for (const key of keys) {
    const index = headerMap.get(key);
    if (index !== undefined && row[index] !== undefined) {
      const value = row[index]?.trim();
      if (value) {
        return value;
      }
    }
  }
  return undefined;
};

/**
 * Validate required fields in CSV row
 */
export const validateRequiredFields = (
  row: string[],
  headerMap: Map<string, number>,
  requiredFields: Array<{ keys: string[]; name: string }>
): { valid: boolean; missing: string[] } => {
  const missing: string[] = [];

  for (const field of requiredFields) {
    const hasValue = field.keys.some((key) => {
      const index = headerMap.get(key);
      return index !== undefined && row[index]?.trim();
    });

    if (!hasValue) {
      missing.push(field.name);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
};

