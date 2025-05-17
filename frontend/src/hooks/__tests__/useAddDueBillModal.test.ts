import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useAddDueBillModal from '../useAddDueBillModal';
import axios from 'axios';

vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('useAddDueBillModal', () => {
  const mockToken = 'test-token';
  const mockBills = [
    { id: 1, name: 'Bill 1', recurrence: 1, default_amount_due: 10, total_balance: 100, draft_account: 1, priority: 1 },
    { id: 2, name: 'Bill 2', recurrence: 2, default_amount_due: 20, total_balance: 200, draft_account: 2, priority: 2 }
  ];
  const mockRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes modal state correctly', () => {
    const { result } = renderHook(() => useAddDueBillModal(mockToken, mockBills, mockRefresh));
    expect(result.current.showAddDueBill).toBe(false);
    expect(result.current.addDueBillForm).toBeDefined();
    expect(result.current.addDueBillError).toBeNull();
    expect(result.current.addDueBillLoading).toBe(false);
  });

  it('opens and closes the modal', () => {
    const { result } = renderHook(() => useAddDueBillModal(mockToken, mockBills, mockRefresh));
    act(() => result.current.setShowAddDueBill(true));
    expect(result.current.showAddDueBill).toBe(true);
    act(() => result.current.setShowAddDueBill(false));
    expect(result.current.showAddDueBill).toBe(false);
  });

  it('updates form state on input change', () => {
    const { result } = renderHook(() => useAddDueBillModal(mockToken, mockBills, mockRefresh));
    act(() => {
      result.current.handleAddDueBillChange({ target: { name: 'amount_due', value: '123.45' } } as any);
    });
    expect(result.current.addDueBillForm.amount_due).toBe('123.45');
  });

  it('updates form state when bill is selected', () => {
    const { result } = renderHook(() => useAddDueBillModal(mockToken, mockBills, mockRefresh));
    act(() => {
      result.current.handleAddDueBillChange({ target: { name: 'bill', value: '1' } } as any);
    });
    expect(result.current.addDueBillForm.bill).toBe('1');
    expect(result.current.addDueBillForm.amount_due).toBe('10');
    expect(result.current.addDueBillForm.recurrence).toBe('1');
    expect(result.current.addDueBillForm.draft_account).toBe('1');
    expect(result.current.addDueBillForm.priority).toBe('1');
  });

  it('shows error if required fields are missing', () => {
    const { result } = renderHook(() => useAddDueBillModal(mockToken, mockBills, mockRefresh));
    act(() => {
      result.current.handleAddDueBill({ preventDefault: () => {} } as any);
    });
    expect(result.current.addDueBillError).toBeDefined();
    expect(result.current.addDueBillLoading).toBe(false);
  });

  it('shows error if priority is less than 1', () => {
    const { result } = renderHook(() => useAddDueBillModal(mockToken, mockBills, mockRefresh));
    act(() => {
      result.current.setAddDueBillForm({
        bill: '1',
        amount_due: '10',
        due_date: '2024-01-01',
        priority: '0',
        recurrence: '1',
        total_balance: '100',
        draft_account: '1',
        pay_date: '2024-01-02',
        status: '1',
      });
      result.current.handleAddDueBill({ preventDefault: () => {} } as any);
    });
    expect(result.current.addDueBillError).toBe('Priority must be at least 1');
    expect(result.current.addDueBillLoading).toBe(false);
  });

  it('shows error if total_balance is invalid', () => {
    const { result } = renderHook(() => useAddDueBillModal(mockToken, mockBills, mockRefresh));
    act(() => {
      result.current.setAddDueBillForm({
        bill: '1',
        amount_due: '10',
        due_date: '2024-01-01',
        priority: '2',
        recurrence: '1',
        total_balance: 'notanumber',
        draft_account: '1',
        pay_date: '2024-01-02',
        status: '1',
      });
    });
    act(() => {
      result.current.handleAddDueBill({ preventDefault: () => {} } as any);
    });
    expect(result.current.addDueBillError).toBe('Total Balance must be a valid number');
    expect(result.current.addDueBillLoading).toBe(false);
  });

  it('submits the form successfully', async () => {
    mockedAxios.post = vi.fn().mockResolvedValueOnce({ data: {} }) as any;
    const { result } = renderHook(() => useAddDueBillModal(mockToken, mockBills, mockRefresh));
    act(() => {
      result.current.setAddDueBillForm({
        bill: '1',
        recurrence: '1',
        amount_due: '10',
        total_balance: '100',
        draft_account: '1',
        due_date: '2024-01-01',
        pay_date: '2024-01-02',
        status: '1',
        priority: '1',
      });
    });
    await act(async () => {
      result.current.handleAddDueBill({ preventDefault: () => {} } as any);
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    expect(mockedAxios.post).toHaveBeenCalled();
    expect(result.current.addDueBillError).toBeNull();
    expect(result.current.addDueBillLoading).toBe(false);
    expect(result.current.showAddDueBill).toBe(false);
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('handles API error on submission', async () => {
    mockedAxios.post = vi.fn().mockRejectedValueOnce(new Error('Failed to add')) as any;
    const { result } = renderHook(() => useAddDueBillModal(mockToken, mockBills, mockRefresh));
    act(() => {
      result.current.setAddDueBillForm({
        bill: '1',
        recurrence: '1',
        amount_due: '10',
        total_balance: '100',
        draft_account: '1',
        due_date: '2024-01-01',
        pay_date: '2024-01-02',
        status: '1',
        priority: '1',
      });
    });
    await act(async () => {
      result.current.handleAddDueBill({ preventDefault: () => {} } as any);
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    expect(result.current.addDueBillError).toBe('Failed to add due bill');
    expect(result.current.addDueBillLoading).toBe(false);
  });
}); 