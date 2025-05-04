import { useState } from 'react';
import { addBankAccountInstance } from '../api/dueBillApi';

export default function useAddBankInstanceModal(token: string, refresh: () => void) {
  const [showAddBankInstance, setShowAddBankInstance] = useState(false);
  const [addBankInstanceForm, setAddBankInstanceForm] = useState({
    bank_account: '', balance: '', due_date: '', pay_date: '', status: '',
  });
  const [addBankInstanceError, setAddBankInstanceError] = useState<string | null>(null);
  const [addBankInstanceLoading, setAddBankInstanceLoading] = useState(false);

  const handleAddBankInstanceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.target.name === 'due_date') {
      setAddBankInstanceForm(form => ({ ...form, due_date: e.target.value, pay_date: e.target.value }));
    } else {
      setAddBankInstanceForm(form => ({ ...form, [e.target.name]: e.target.value }));
    }
  };

  const handleAddBankInstance = (e: React.FormEvent) => {
    e.preventDefault();
    setAddBankInstanceError(null);
    setAddBankInstanceLoading(true);
    if (!addBankInstanceForm.bank_account || !addBankInstanceForm.balance || !addBankInstanceForm.due_date) {
      setAddBankInstanceError('Bank Account, Balance, and Due Date are required');
      setAddBankInstanceLoading(false);
      return;
    }
    addBankAccountInstance({
      bank_account: parseInt(addBankInstanceForm.bank_account),
      balance: parseFloat(addBankInstanceForm.balance),
      due_date: addBankInstanceForm.due_date,
      pay_date: addBankInstanceForm.pay_date || null,
      status: addBankInstanceForm.status ? parseInt(addBankInstanceForm.status) : null,
    }, token)
      .then(() => {
        setShowAddBankInstance(false);
        setAddBankInstanceForm({ bank_account: '', balance: '', due_date: '', pay_date: '', status: '' });
        setAddBankInstanceLoading(false);
        refresh();
      })
      .catch(() => {
        setAddBankInstanceError('Failed to add bank account instance');
        setAddBankInstanceLoading(false);
      });
  };

  return {
    showAddBankInstance,
    setShowAddBankInstance,
    addBankInstanceForm,
    setAddBankInstanceForm,
    addBankInstanceError,
    setAddBankInstanceError,
    addBankInstanceLoading,
    setAddBankInstanceLoading,
    handleAddBankInstanceChange,
    handleAddBankInstance,
  };
} 