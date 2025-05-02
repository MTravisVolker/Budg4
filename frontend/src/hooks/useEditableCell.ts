import { useState } from 'react';

export default function useEditableCell(onSave: (editingCell: any) => Promise<void>) {
  const [editingCell, setEditingCell] = useState<{
    rowId: number;
    type: 'DueBill' | 'BankAccountInstance';
    field: string;
    value: string | number;
  } | null>(null);
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

  const handleSaveEdit = async () => {
    if (!editingCell) return;
    setSavingEdit(true);
    try {
      await onSave(editingCell);
      setEditingCell(null);
    } catch {
      // Optionally handle error
    } finally {
      setSavingEdit(false);
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
  };
} 