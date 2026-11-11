import { describe, it, expect, vi, afterEach } from 'vitest';
import { GENERIC_API_ERROR, NETWORK_API_ERROR, parseApiError } from '../apiError';

describe('parseApiError', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses a server detail string', () => {
    const parsed = parseApiError({ response: { status: 404, data: { detail: 'Not found.' } } });
    expect(parsed.message).toBe('Not found.');
    expect(parsed.fieldErrors).toEqual({});
  });

  it('splits field errors and joins them into the banner message', () => {
    const parsed = parseApiError({
      response: {
        status: 400,
        data: {
          name: ['This field is required.'],
          amount_due: ['A valid number is required.'],
        },
      },
    });
    expect(parsed.fieldErrors).toEqual({
      name: 'This field is required.',
      amount_due: 'A valid number is required.',
    });
    expect(parsed.message).toBe('This field is required. A valid number is required.');
  });

  it('returns no screen message for 401', () => {
    const parsed = parseApiError({ response: { status: 401, data: { detail: 'Token has expired' } } });
    expect(parsed.message).toBeNull();
    expect(parsed.fieldErrors).toEqual({});
  });

  it('uses the network message when the response never arrived', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const parsed = parseApiError({ response: null });
    expect(parsed.message).toBe(NETWORK_API_ERROR);
  });

  it('hides HTML and bare 500 bodies', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(parseApiError({ response: { status: 500, data: '<html><body>traceback</body></html>' } }).message).toBe(GENERIC_API_ERROR);
    expect(parseApiError({ response: { status: 500 } }).message).toBe(GENERIC_API_ERROR);
  });

  it('shows the safe detail from an unhandled server error', () => {
    const parsed = parseApiError({
      response: { status: 500, data: { detail: GENERIC_API_ERROR } },
    });
    expect(parsed.message).toBe(GENERIC_API_ERROR);
  });

  it('uses the generic message for a non-HTTP failure', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(parseApiError(new Error('boom')).message).toBe(GENERIC_API_ERROR);
  });
});
