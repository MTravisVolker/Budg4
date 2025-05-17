import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useEditableCell from '../useEditableCell';

describe('useEditableCell', () => {
  let onSave: any;

  beforeEach(() => {
    onSave = vi.fn().mockResolvedValue(undefined);
  });

  it('initializes with no editing cell', () => {
    const { result } = renderHook(() => useEditableCell(onSave));
    expect(result.current.editingCell).toBeNull();
    expect(result.current.savingEdit).toBe(false);
  });

  it('sets editing cell on double click', () => {
    const { result } = renderHook(() => useEditableCell(onSave));
    act(() => {
      result.current.handleCellDoubleClick({ id: 1, type: 'DueBill' }, 'DueBill', 'amount_due', '10');
    });
    expect(result.current.editingCell).toEqual({ rowId: 1, type: 'DueBill', field: 'amount_due', value: '10' });
  });

  it('updates value on input change', () => {
    const { result } = renderHook(() => useEditableCell(onSave));
    act(() => {
      result.current.handleCellDoubleClick({ id: 1, type: 'DueBill' }, 'DueBill', 'amount_due', '10');
    });
    act(() => {
      result.current.handleEditInputChange({ target: { value: '20' } } as any);
    });
    expect(result.current.editingCell?.value).toBe('20');
  });

  it('cancels edit on Escape key', () => {
    const { result } = renderHook(() => useEditableCell(onSave));
    act(() => {
      result.current.handleCellDoubleClick({ id: 1, type: 'DueBill' }, 'DueBill', 'amount_due', '10');
    });
    act(() => {
      result.current.handleEditInputKeyDown({ key: 'Escape' } as any);
    });
    expect(result.current.editingCell).toBeNull();
  });

  it('saves edit on Enter key', async () => {
    const { result } = renderHook(() => useEditableCell(onSave));
    act(() => {
      result.current.handleCellDoubleClick({ id: 1, type: 'DueBill' }, 'DueBill', 'amount_due', '10');
    });
    await act(async () => {
      result.current.handleEditInputKeyDown({ key: 'Enter' } as any);
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    expect(onSave).toHaveBeenCalled();
    expect(result.current.editingCell).toBeNull();
    expect(result.current.savingEdit).toBe(false);
  });

  it('saves edit on blur', async () => {
    const { result } = renderHook(() => useEditableCell(onSave));
    act(() => {
      result.current.handleCellDoubleClick({ id: 1, type: 'DueBill' }, 'DueBill', 'amount_due', '10');
    });
    await act(async () => {
      result.current.handleEditInputBlur();
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    expect(onSave).toHaveBeenCalled();
    expect(result.current.editingCell).toBeNull();
    expect(result.current.savingEdit).toBe(false);
  });
}); 