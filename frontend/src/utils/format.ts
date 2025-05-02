export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  const [year, month, day] = dateStr.split('-');
  if (year && month && day) {
    return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
  }
  return dateStr;
}

export function formatCurrency(value: string | number | null | undefined): string {
  const num = Number(value);
  if (!isNaN(num)) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  }
  return value?.toString() ?? '';
} 