import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import { useRecurrences } from '../useRecurrences';

const mockedAxios = axios as unknown as ReturnType<typeof vi.fn>;

describe('useRecurrences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch recurrences successfully', async () => {
    const mockRecurrences = [
      { id: 1, name: 'Monthly' },
      { id: 2, name: 'Weekly' }
    ];

    (axios.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: mockRecurrences });
    const { result } = renderHook(() => useRecurrences());

    expect(result.current.recurrences).toEqual([]);
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.recurrences).toEqual(mockRecurrences);
  });

  it('should handle fetch error', async () => {
    (axios.get as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Failed to fetch'));
    const { result } = renderHook(() => useRecurrences());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
  });
}); 