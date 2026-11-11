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