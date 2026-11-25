export type CsvPrimitive = string | number | boolean | null | undefined;

/**
 * Minimal CSV serialiser following RFC 4180 quoting rules.
 *
 * Fields are quoted when they contain a comma, quote, newline, or leading /
 * trailing whitespace. Quoting whitespace matters here: the raw datasets
 * intentionally contain untrimmed values, and we must not lose them on write.
 */
export function escapeCsvField(value: CsvPrimitive): string {
  if (value === null || value === undefined) {
    return '';
  }

  const text = String(value);
  const needsQuotes = /[",\r\n]/.test(text) || text !== text.trim();

  if (!needsQuotes) {
    return text;
  }

  return `"${text.replace(/"/g, '""')}"`;
}

export function serializeCsv(
  headers: readonly string[],
  rows: readonly (readonly CsvPrimitive[])[],
): string {
  const lines = [headers.map(escapeCsvField).join(',')];
  for (const row of rows) {
    lines.push(row.map(escapeCsvField).join(','));
  }
  return `${lines.join('\n')}\n`;
}

/**
 * Parse RFC 4180 CSV (quoted fields, escaped quotes, CRLF or LF).
 * Whitespace inside quoted fields is preserved on purpose.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let index = 0;

  const pushField = (): void => {
    row.push(field);
    field = '';
  };

  const pushRow = (): void => {
    pushField();
    rows.push(row);
    row = [];
  };

  while (index < text.length) {
    const char = text[index];

    if (inQuotes) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 2;
          continue;
        }
        inQuotes = false;
        index += 1;
        continue;
      }
      field += char;
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      index += 1;
      continue;
    }

    if (char === ',') {
      pushField();
      index += 1;
      continue;
    }

    if (char === '\r') {
      if (text[index + 1] === '\n') {
        index += 1;
      }
      pushRow();
      index += 1;
      continue;
    }

    if (char === '\n') {
      pushRow();
      index += 1;
      continue;
    }

    field += char;
    index += 1;
  }

  if (field.length > 0 || row.length > 0) {
    pushRow();
  }

  return rows.filter((candidate) => candidate.some((value) => value.length > 0));
}
