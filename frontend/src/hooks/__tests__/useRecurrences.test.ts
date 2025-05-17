import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useRecurrences from '../useRecurrences';
import axios from 'axios';

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: [] })
  }
}));

describe('useRecurrences', () => {
  const mockToken = 'test-token';
  const mockRecurrences = [
    { id: 1, name: 'Recurrence 1' },
    { id: 2, name: 'Recurrence 2' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (axios.get as jest.Mock).mockResolvedValue({ data: [] });
  });

  it('initializes with empty recurrences and loading state', () => {
    const { result } = renderHook(() => useRecurrences(mockToken));
    expect(result.current.recurrences).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('fetches recurrences successfully', async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockRecurrences });

    const { result } = renderHook(() => useRecurrences(mockToken));

    // Initial state
    expect(result.current.recurrences).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();

    // Wait for the effect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(axios.get).toHaveBeenCalledWith('/api/recurrences/', {
      headers: { Authorization: `Bearer ${mockToken}` }
    });
    expect(result.current.recurrences).toEqual(mockRecurrences);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles fetch error', async () => {
    (axios.get as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

    const { result } = renderHook(() => useRecurrences(mockToken));

    // Initial state
    expect(result.current.recurrences).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();

    // Wait for the effect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.recurrences).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Failed to fetch recurrences');
  });

  it('refreshes recurrences when refresh is called', async () => {
    (axios.get as jest.Mock)
      .mockResolvedValueOnce({ data: mockRecurrences })
      .mockResolvedValueOnce({ data: [...mockRecurrences, { id: 3, name: 'Recurrence 3' }] });

    const { result } = renderHook(() => useRecurrences(mockToken));

    // Wait for initial fetch
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Call refresh
    await act(async () => {
      result.current.refresh();
    });

    expect(axios.get).toHaveBeenCalledTimes(2);
    expect(result.current.recurrences).toHaveLength(3);
  });

  it('does not fetch if token is not provided', () => {
    renderHook(() => useRecurrences(''));
    expect(axios.get).not.toHaveBeenCalled();
  });
}); 