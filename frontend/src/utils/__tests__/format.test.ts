import { describe, it, expect } from 'vitest';
import { formatDate, formatCurrency, isFinishedDateEntry, parseMoneyOrZero } from '../format';

describe('Format Utilities', () => {
  describe('formatDate', () => {
    it('formats valid date string correctly', () => {
      expect(formatDate('2024-03-15')).toBe('03/15/2024');
      expect(formatDate('2024-01-01')).toBe('01/01/2024');
      expect(formatDate('2024-12-31')).toBe('12/31/2024');
    });

    it('handles single digit months and days', () => {
      expect(formatDate('2024-1-5')).toBe('01/05/2024');
      expect(formatDate('2024-9-9')).toBe('09/09/2024');
    });

    it('returns dash for null or undefined input', () => {
      expect(formatDate(null)).toBe('-');
      expect(formatDate(undefined)).toBe('-');
    });

    it('returns original string for invalid date format', () => {
      expect(formatDate('invalid-date')).toBe('invalid-date');
      expect(formatDate('2024/03/15')).toBe('2024/03/15');
    });
  });

  describe('isFinishedDateEntry', () => {
    it('accepts a real date once the year has four digits', () => {
      expect(isFinishedDateEntry('2024-03-20')).toBe(true);
      expect(isFinishedDateEntry('2026-12-01')).toBe(true);
    });

    it('rejects partial years produced while typing', () => {
      expect(isFinishedDateEntry('')).toBe(false);
      expect(isFinishedDateEntry('0004-03-20')).toBe(false);
      expect(isFinishedDateEntry('0040-03-20')).toBe(false);
      expect(isFinishedDateEntry('0402-03-20')).toBe(false);
      expect(isFinishedDateEntry('2024-02-31')).toBe(false);
    });
  });

  describe('parseMoneyOrZero', () => {
    it('keeps a typed amount, including a whole number', () => {
      expect(parseMoneyOrZero('100')).toBe(100);
      expect(parseMoneyOrZero('100.5')).toBe(100.5);
      expect(parseMoneyOrZero(0)).toBe(0);
    });

    it('defaults blank or invalid input to 0', () => {
      expect(parseMoneyOrZero('')).toBe(0);
      expect(parseMoneyOrZero('   ')).toBe(0);
      expect(parseMoneyOrZero(null)).toBe(0);
      expect(parseMoneyOrZero(undefined)).toBe(0);
      expect(parseMoneyOrZero('notanumber')).toBe(0);
    });
  });

  describe('formatCurrency', () => {
    it('formats valid numbers correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
    });

    it('formats valid string numbers correctly', () => {
      expect(formatCurrency('1234.56')).toBe('$1,234.56');
      expect(formatCurrency('0')).toBe('$0.00');
      expect(formatCurrency('-1234.56')).toBe('-$1,234.56');
    });

    it('returns empty string for null or undefined input', () => {
      expect(formatCurrency(null)).toBe('');
      expect(formatCurrency(undefined)).toBe('');
    });

    it('returns original string for invalid number format', () => {
      expect(formatCurrency('invalid')).toBe('invalid');
      expect(formatCurrency('abc')).toBe('abc');
    });
  });
}); 