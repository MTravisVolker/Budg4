import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import MainTableBody from '../MainTableBody';

describe('MainTableBody', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockBankInstance: BankAccountInstance = {
    id: 1,
    bank_account: 1,
    balance: '1000.00',
    total_balance: '1000.00',
    due_date: '2024-03-20',
    pay_date: '2024-03-20',
    status: 1,
    priority: 1
  };

  const mockBill: Bill = {
    id: 1,
    name: 'Test Bill',
    default_amount_due: '100.00',
    total_balance: '1000.00',
    url: 'http://test.com',
    draft_account: 1,
    category: 1,
    recurrence: 1,
    priority: 1
  };

  const mockDueBill: DueBill = {
    id: 1,
    bill: 1,
    recurrence: 1,
    amount_due: '100.00',
    total_balance: '1000.00',
    draft_account: 1,
    due_date: '2024-03-20',
    pay_date: '2024-03-20',
    status: 1,
    priority: 1
  };

  // ... rest of the test file ...
}); 