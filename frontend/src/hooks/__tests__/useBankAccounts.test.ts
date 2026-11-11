import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useBankAccounts from '../useBankAccounts';
import { GENERIC_API_ERROR } from '../../utils/apiError';
import axios from 'axios';

vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('useBankAccounts', () => {
  const mockToken = 'test-token';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with empty accounts and loading state', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [] });
    const { result } = renderHook(() => useBankAccounts(mockToken));
    
    // Initial state
    expect(result.current.accounts).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();

    // Wait for the effect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // State after effect
    expect(result.current.loading).toBe(false);
  });

  it('fetches accounts successfully', async () => {
    const mockAccounts = [
      { id: 1, name: 'Account 1' },
      { id: 2, name: 'Account 2' }
    ];
    mockedAxios.get.mockResolvedValueOnce({ data: mockAccounts });

    const { result } = renderHook(() => useBankAccounts(mockToken));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.accounts).toEqual(mockAccounts);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles fetch error', async () => {
    const errorMessage = 'Failed to fetch bank accounts';
    mockedAxios.get.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useBankAccounts(mockToken));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.accounts).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(GENERIC_API_ERROR);
  });

  it('refreshes accounts', async () => {
    const mockAccounts = [
      { id: 1, name: 'Account 1' },
      { id: 2, name: 'Account 2' }
    ];
    mockedAxios.get.mockResolvedValueOnce({ data: mockAccounts });

    const { result } = renderHook(() => useBankAccounts(mockToken));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.accounts).toEqual(mockAccounts);

    // Mock new data for refresh
    const newMockAccounts = [
      { id: 1, name: 'Updated Account 1' },
      { id: 2, name: 'Updated Account 2' }
    ];
    mockedAxios.get.mockResolvedValueOnce({ data: newMockAccounts });

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.accounts).toEqual(newMockAccounts);
  });
}); 