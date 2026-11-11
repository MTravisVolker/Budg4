import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import { useCategories } from '../useCategories';

const mockedAxios = axios as unknown as ReturnType<typeof vi.fn>;

describe('useCategories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch categories successfully', async () => {
    const mockCategories = [
      { id: 1, name: 'Category 1' },
      { id: 2, name: 'Category 2' }
    ];

    (axios.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: mockCategories });
    const { result } = renderHook(() => useCategories());

    expect(result.current.categories).toEqual([]);
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.categories).toEqual(mockCategories);
  });

  it('should handle fetch error', async () => {
    (axios.get as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Failed to fetch'));
    const { result } = renderHook(() => useCategories());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
  });
}); 