import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useMainPageData from '../useMainPageData';
import axios from 'axios';

vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockToken = 'test-token';
const mockData = {
  dueBills: [{ id: 1 }],
  bankInstances: [{ id: 1, pay_date: '2024-01-01' }],
  accounts: [{ id: 1 }],
  bills: [{ id: 1 }],
  statuses: [{ id: 1 }],
  recurrences: [{ id: 1 }],
  categories: [{ id: 1 }],
};

describe('useMainPageData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('initializes with loading state', () => {
    const { result } = renderHook(() => useMainPageData(mockToken));
    expect(result.current.loading).toBe(true);
  });

  it('fetches all data successfully', async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/api/duebills/')) return Promise.resolve({ data: mockData.dueBills });
      if (url.includes('/api/bankaccountinstances/')) return Promise.resolve({ data: mockData.bankInstances });
      if (url.includes('/api/bankaccounts/')) return Promise.resolve({ data: mockData.accounts });
      if (url.includes('/api/bills/')) return Promise.resolve({ data: mockData.bills });
      if (url.includes('/api/statuses/')) return Promise.resolve({ data: mockData.statuses });
      if (url.includes('/api/recurrences/')) return Promise.resolve({ data: mockData.recurrences });
      if (url.includes('/api/categories/')) return Promise.resolve({ data: mockData.categories });
      return Promise.resolve({ data: [] });
    });

    const { result } = renderHook(() => useMainPageData(mockToken));

    // Wait for loading to be false and error to be null
    await act(async () => {
      for (let i = 0; i < 10; i++) {
        if (!result.current.loading && result.current.error === null) break;
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    });

    expect(result.current.dueBills).toEqual(mockData.dueBills);
    expect(result.current.bankInstances).toEqual(mockData.bankInstances);
    expect(result.current.accounts).toEqual(mockData.accounts);
    expect(result.current.bills).toEqual(mockData.bills);
    expect(result.current.statuses).toEqual(mockData.statuses);
    expect(result.current.recurrences).toEqual(mockData.recurrences);
    expect(result.current.categories).toEqual(mockData.categories);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles fetch error', async () => {
    mockedAxios.get.mockRejectedValueOnce({ response: { status: 500 } });
    const { result } = renderHook(() => useMainPageData(mockToken));
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    expect(result.current.error).toBe('Failed to fetch data');
    expect(result.current.loading).toBe(false);
  });

  it('refreshes data when refresh is called', async () => {
    mockedAxios.get
      .mockResolvedValueOnce({ data: mockData.dueBills })
      .mockResolvedValueOnce({ data: mockData.bankInstances })
      .mockResolvedValueOnce({ data: mockData.accounts })
      .mockResolvedValueOnce({ data: mockData.bills })
      .mockResolvedValueOnce({ data: mockData.statuses })
      .mockResolvedValueOnce({ data: mockData.recurrences })
      .mockResolvedValueOnce({ data: mockData.categories });

    const { result } = renderHook(() => useMainPageData(mockToken));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    mockedAxios.get
      .mockResolvedValueOnce({ data: mockData.dueBills })
      .mockResolvedValueOnce({ data: mockData.bankInstances })
      .mockResolvedValueOnce({ data: mockData.accounts })
      .mockResolvedValueOnce({ data: mockData.bills })
      .mockResolvedValueOnce({ data: mockData.statuses })
      .mockResolvedValueOnce({ data: mockData.recurrences })
      .mockResolvedValueOnce({ data: mockData.categories });

    await act(async () => {
      result.current.refresh();
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.dueBills).toEqual(mockData.dueBills);
  });
}); 