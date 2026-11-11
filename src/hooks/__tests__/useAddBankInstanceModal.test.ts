import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import { useAddBankInstanceModal } from '../useAddBankInstanceModal';

const mockToken = 'test-token';
const mockRefresh = vi.fn();

describe('useAddBankInstanceModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle successful bank instance addition', async () => {
    const mockResponse = {
      data: {},
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any
    };

    vi.spyOn(dueBillApi, 'addBankAccountInstance').mockResolvedValueOnce(mockResponse);
    const { result } = renderHook(() => useAddBankInstanceModal(mockToken, mockRefresh));

    await result.current.handleSubmit({ preventDefault: vi.fn() } as any);

    expect(mockRefresh).toHaveBeenCalled();
  });

  // ... rest of the tests ...
}); 