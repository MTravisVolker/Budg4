import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useAddBankInstanceModal from '../useAddBankInstanceModal';
import * as dueBillApi from '../../api/dueBillApi';

vi.mock('../../api/dueBillApi', () => ({
  addBankAccountInstance: vi.fn(),
}));

describe('useAddBankInstanceModal', () => {
  const mockToken = 'test-token';
  const mockAccounts = [
    { id: 1, name: 'Checking', font_color: '#000000' },
    { id: 2, name: 'Savings', font_color: '#0000FF' }
  ];
  const mockStatuses = [
    { id: 1, name: 'Active', highlight_color: '#00FF00' }
  ];
  const mockRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes modal state correctly', () => {
    const { result } = renderHook(() => useAddBankInstanceModal(mockToken, mockRefresh));
    expect(result.current.showAddBankInstance).toBe(false);
    expect(result.current.addBankInstanceForm).toBeDefined();
    expect(result.current.addBankInstanceError).toBeNull();
    expect(result.current.addBankInstanceLoading).toBe(false);
  });

  it('opens and closes the modal', () => {
    const { result } = renderHook(() => useAddBankInstanceModal(mockToken, mockRefresh));
    act(() => result.current.setShowAddBankInstance(true));
    expect(result.current.showAddBankInstance).toBe(true);
    act(() => result.current.setShowAddBankInstance(false));
    expect(result.current.showAddBankInstance).toBe(false);
  });

  it('updates form state on input change', () => {
    const { result } = renderHook(() => useAddBankInstanceModal(mockToken, mockRefresh));
    act(() => {
      result.current.handleAddBankInstanceChange({ target: { name: 'balance', value: '123.45' } } as any);
    });
    expect(result.current.addBankInstanceForm.balance).toBe('123.45');
  });

  it('shows error if required fields are missing', () => {
    const { result } = renderHook(() => useAddBankInstanceModal(mockToken, mockRefresh));
    act(() => {
      result.current.handleAddBankInstance({ preventDefault: () => {} } as any);
    });
    expect(result.current.addBankInstanceError).toBeDefined();
    expect(result.current.addBankInstanceLoading).toBe(false);
  });

  it('submits the form successfully', async () => {
    vi.spyOn(dueBillApi, 'addBankAccountInstance').mockResolvedValueOnce({});
    const { result } = renderHook(() => useAddBankInstanceModal(mockToken, mockRefresh));
    
    act(() => {
      result.current.setAddBankInstanceForm({
        bank_account: '1',
        balance: '100',
        due_date: '2024-01-01',
        pay_date: '2024-01-02',
        status: '1',
        priority: '1',
      });
    });

    await act(async () => {
      result.current.handleAddBankInstance({ preventDefault: () => {} } as any);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(dueBillApi.addBankAccountInstance).toHaveBeenCalled();
    expect(result.current.addBankInstanceError).toBeNull();
    expect(result.current.addBankInstanceLoading).toBe(false);
    expect(result.current.showAddBankInstance).toBe(false);
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('handles API error on submission', async () => {
    vi.spyOn(dueBillApi, 'addBankAccountInstance').mockRejectedValueOnce(new Error('Failed to add'));
    const { result } = renderHook(() => useAddBankInstanceModal(mockToken, mockRefresh));
    
    act(() => {
      result.current.setAddBankInstanceForm({
        bank_account: '1',
        balance: '100',
        due_date: '2024-01-01',
        pay_date: '2024-01-02',
        status: '1',
        priority: '1',
      });
    });

    await act(async () => {
      result.current.handleAddBankInstance({ preventDefault: () => {} } as any);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.addBankInstanceError).toBe('Failed to add bank account instance');
    expect(result.current.addBankInstanceLoading).toBe(false);
  });
}); 