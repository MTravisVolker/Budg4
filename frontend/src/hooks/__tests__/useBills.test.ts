import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useBills from '../useBills';
import axios from 'axios';

vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('useBills', () => {
  const mockToken = 'test-token';
  const mockBills = [
    { id: 1, name: 'Bill 1', default_amount_due: '10', url: '', draft_account: 1, category: 1, recurrence: 1, priority: 1 },
    { id: 2, name: 'Bill 2', default_amount_due: '20', url: '', draft_account: 2, category: 2, recurrence: 2, priority: 2 }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockedAxios.get.mockResolvedValue({ data: [] });
  });

  it('initializes with loading state', () => {
    const { result } = renderHook(() => useBills(mockToken));
    expect(result.current.loading).toBe(true);
    expect(result.current.bills).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('fetches bills successfully', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockBills });
    const { result } = renderHook(() => useBills(mockToken));
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/bills/', { headers: { Authorization: `Bearer ${mockToken}` } });
    expect(result.current.bills).toEqual(mockBills);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles fetch error', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Failed to fetch'));
    const { result } = renderHook(() => useBills(mockToken));
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    expect(result.current.bills).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Failed to fetch bills');
  });

  it('refreshes bills when refresh is called', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockBills });
    const { result } = renderHook(() => useBills(mockToken));
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    mockedAxios.get.mockResolvedValueOnce({ data: [ ...mockBills, { id: 3, name: 'Bill 3', default_amount_due: '30', url: '', draft_account: 3, category: 3, recurrence: 3, priority: 3 } ] });
    await act(async () => {
      result.current.refresh();
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    expect(result.current.bills).toHaveLength(3);
  });
}); 