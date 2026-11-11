const FINISHED_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * A typed date is finished once it is a real calendar day with a 4-digit year.
 * Date fields emit earlier values while the year is still being typed (0004, 0040, 0402).
 */
export function isFinishedDateEntry(value: string): boolean {
  const match = FINISHED_DATE.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1000 || month < 1 || month > 12 || day < 1 || day > 31) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  const [year, month, day] = dateStr.split('-');
  if (year && month && day) {
    return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
  }
  return dateStr;
}

/** Blank or non-numeric money input becomes 0 so a save can still be written. */
export function parseMoneyOrZero(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'string' && value.trim() === '') return 0;
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : 0;
}

export function formatCurrency(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const num = Number(value);
  if (!isNaN(num)) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  }
  return value.toString();
} 