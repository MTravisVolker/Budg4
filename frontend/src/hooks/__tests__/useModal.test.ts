import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useModal from '../useModal';

describe('useModal', () => {
  it('initializes with false by default', () => {
    const { result } = renderHook(() => useModal());
    expect(result.current[0]).toBe(false);
  });

  it('initializes with provided initial value', () => {
    const { result } = renderHook(() => useModal(true));
    expect(result.current[0]).toBe(true);
  });

  it('opens the modal when open is called', () => {
    const { result } = renderHook(() => useModal(false));
    act(() => {
      result.current[1](); // Call open
    });
    expect(result.current[0]).toBe(true);
  });

  it('closes the modal when close is called', () => {
    const { result } = renderHook(() => useModal(true));
    act(() => {
      result.current[2](); // Call close
    });
    expect(result.current[0]).toBe(false);
  });

  it('returns the same functions on re-renders', () => {
    const { result, rerender } = renderHook(() => useModal());
    const [initialShow, initialOpen, initialClose] = result.current;

    rerender();

    const [newShow, newOpen, newClose] = result.current;
    expect(newOpen).toBe(initialOpen);
    expect(newClose).toBe(initialClose);
  });
}); 