import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useBankAccounts from '../useBankAccounts';
import axios from 'axios';

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: [] })
  }
}));

describe('useBankAccounts', () => {
  const mockToken = 'test-token';
  const mockAccounts = [
    { id: 1, name: 'Checking', font_color: '#000000' },
    { id: 2, name: 'Savings', font_color: '#0000FF' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (axios.get as jest.Mock).mockResolvedValue({ data: [] });
  });

  it('initializes with empty accounts and loading state', () => {
    const { result } = renderHook(() => useBankAccounts(mockToken));
    expect(result.current.accounts).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('fetches bank accounts successfully', async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockAccounts });

    const { result } = renderHook(() => useBankAccounts(mockToken));

    // Initial state
    expect(result.current.accounts).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();

    // Wait for the effect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(axios.get).toHaveBeenCalledWith('/api/bankaccounts/', {
      headers: { Authorization: `Bearer ${mockToken}` }
    });
    expect(result.current.accounts).toEqual(mockAccounts);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles fetch error', async () => {
    (axios.get as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

    const { result } = renderHook(() => useBankAccounts(mockToken));

    // Initial state
    expect(result.current.accounts).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();

    // Wait for the effect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.accounts).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Failed to fetch bank accounts');
  });

  it('refreshes bank accounts when refresh is called', async () => {
    (axios.get as jest.Mock)
      .mockResolvedValueOnce({ data: mockAccounts })
      .mockResolvedValueOnce({ data: [...mockAccounts, { id: 3, name: 'Credit Card', font_color: '#FF0000' }] });

    const { result } = renderHook(() => useBankAccounts(mockToken));

    // Wait for initial fetch
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Call refresh
    await act(async () => {
      result.current.refresh();
    });

    expect(axios.get).toHaveBeenCalledTimes(2);
    expect(result.current.accounts).toHaveLength(3);
  });

  it('does not fetch if token is not provided', () => {
    renderHook(() => useBankAccounts(''));
    expect(axios.get).not.toHaveBeenCalled();
  });
}); 