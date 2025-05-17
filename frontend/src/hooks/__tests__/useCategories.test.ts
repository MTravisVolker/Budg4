import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useCategories from '../useCategories';
import axios from 'axios';

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: [] })
  }
}));

describe('useCategories', () => {
  const mockToken = 'test-token';
  const mockCategories = [
    { id: 1, name: 'Category 1' },
    { id: 2, name: 'Category 2' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (axios.get as jest.Mock).mockResolvedValue({ data: [] });
  });

  it('initializes with empty categories and loading state', () => {
    const { result } = renderHook(() => useCategories(mockToken));
    expect(result.current.categories).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('fetches categories successfully', async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockCategories });

    const { result } = renderHook(() => useCategories(mockToken));

    // Initial state
    expect(result.current.categories).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();

    // Wait for the effect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(axios.get).toHaveBeenCalledWith('/api/categories/', {
      headers: { Authorization: `Bearer ${mockToken}` }
    });
    expect(result.current.categories).toEqual(mockCategories);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles fetch error', async () => {
    (axios.get as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

    const { result } = renderHook(() => useCategories(mockToken));

    // Initial state
    expect(result.current.categories).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();

    // Wait for the effect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.categories).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Failed to fetch categories');
  });

  it('refreshes categories when refresh is called', async () => {
    (axios.get as jest.Mock)
      .mockResolvedValueOnce({ data: mockCategories })
      .mockResolvedValueOnce({ data: [...mockCategories, { id: 3, name: 'Category 3' }] });

    const { result } = renderHook(() => useCategories(mockToken));

    // Wait for initial fetch
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Call refresh
    await act(async () => {
      result.current.refresh();
    });

    expect(axios.get).toHaveBeenCalledTimes(2);
    expect(result.current.categories).toHaveLength(3);
  });

  it('does not fetch if token is not provided', () => {
    renderHook(() => useCategories(''));
    expect(axios.get).not.toHaveBeenCalled();
  });
}); 