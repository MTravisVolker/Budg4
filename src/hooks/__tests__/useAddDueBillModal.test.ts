import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import { useAddDueBillModal } from '../useAddDueBillModal';

const mockToken = 'test-token';
const mockRefresh = vi.fn();

const mockBills: Bill[] = [
  {
    id: 1,
    name: 'Test Bill',
    default_amount_due: '100.00',
    total_balance: '1000.00',
    url: 'http://test.com',
    draft_account: 1,
    category: 1,
    recurrence: 1,
    priority: 1
  }
];

describe('useAddDueBillModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useAddDueBillModal(mockToken, mockBills, mockRefresh));
    expect(result.current.form).toEqual({
      bill: '',
      recurrence: '',
      amount_due: '',
      total_balance: '',
      draft_account: '',
      due_date: '',
      pay_date: '',
      status: '',
      priority: ''
    });
  });

  // ... rest of the tests ...
}); 