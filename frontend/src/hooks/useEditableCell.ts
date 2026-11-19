import { useRef, useState } from 'react';
import { parseApiError } from '../utils/apiError';
import { useToast } from '../components/ToastProvider';

export type EditableCell = {
  rowId: number;
  type: 'DueBill' | 'BankAccountInstance';
  field: string;
  value: string | number;
};

function isSameCell(current: EditableCell | null, cell: EditableCell) {
  return !!current
    && current.rowId === cell.rowId
    && current.type === cell.type
    && current.field === cell.field;
}

export default function useEditableCell(onSave: (editingCell: EditableCell) => Promise<void>) {
  const showToast = useToast();
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;
  const queueRef = useRef<Promise<void>>(Promise.resolve());
  const [editingCell, setEditingCell] = useState<EditableCell | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const handleCellDoubleClick = (
    row: { id: number; type: 'DueBill' | 'BankAccountInstance' },
    type: 'DueBill' | 'BankAccountInstance',
    field: string,
    value: string | number
  ) => {
    setEditingCell({ rowId: row.id, type, field, value });
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editingCell) return;
    setEditingCell({ ...editingCell, value: e.target.value });
  };

  const saveCell = (cell: EditableCell) => {
    const run = queueRef.current.then(async () => {
      setSavingEdit(true);
      try {
        await onSaveRef.current(cell);
        setEditingCell(current => isSameCell(current, cell) ? null : current);
      } catch (error) {
        const { message } = parseApiError(error);
        if (message) showToast(message);
        setEditingCell(current => isSameCell(current, cell) ? null : current);
        throw error;
      } finally {
        setSavingEdit(false);
      }
    });
    queueRef.current = run.then(() => undefined, () => undefined);
    return run;
  };

  const handleSaveEdit = () => {
    if (!editingCell) return;
    return saveCell(editingCell).catch(() => undefined);
  };

  const handleEditInputBlur = () => {
    handleSaveEdit();
  };

  const handleEditInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  return {
    editingCell,
    setEditingCell,
    savingEdit,
    handleCellDoubleClick,
    handleEditInputChange,
    handleEditInputBlur,
    handleEditInputKeyDown,
    handleSaveEdit,
    saveCell,
  };
} 