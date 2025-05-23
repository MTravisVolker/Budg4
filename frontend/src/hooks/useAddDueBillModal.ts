import { useState } from 'react';
import { addDueBill } from '../api/dueBillApi';
import { Bill } from '../types';

export default function useAddDueBillModal(token: string, bills: Bill[], refresh: () => void) {
  const [showAddDueBill, setShowAddDueBill] = useState(false);
  const [addDueBillForm, setAddDueBillForm] = useState({
    bill: '', recurrence: '', amount_due: '', total_balance: '0', draft_account: '', due_date: '', pay_date: '', status: '', priority: '0',
  });
  const [addDueBillError, setAddDueBillError] = useState<string | null>(null);
  const [addDueBillLoading, setAddDueBillLoading] = useState(false);

  const handleAddDueBillChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'bill') {
      const selectedBill = bills.find(b => b.id === parseInt(value));
      setAddDueBillForm(form => ({
        ...form,
        bill: value,
        recurrence: selectedBill?.recurrence ? selectedBill.recurrence.toString() : '',
        amount_due: selectedBill?.default_amount_due ? selectedBill.default_amount_due.toString() : '',
        total_balance: selectedBill?.total_balance ? selectedBill.total_balance.toString() : '0',
        draft_account: selectedBill?.draft_account ? selectedBill.draft_account.toString() : '',
        priority: selectedBill?.priority ? selectedBill.priority.toString() : '0',
      }));
    } else {
      setAddDueBillForm(form => ({ ...form, [name]: value }));
    }
  };

  const handleAddDueBill = (e: React.FormEvent) => {
    e.preventDefault();
    setAddDueBillError(null);
    setAddDueBillLoading(true);

    // Check total_balance first
    let totalBalance = 0;
    try {
      totalBalance = parseFloat(addDueBillForm.total_balance || '0');
      if (isNaN(totalBalance)) {
        throw new Error('Invalid number');
      }
    } catch {
      setAddDueBillError('Total Balance must be a valid number');
      setAddDueBillLoading(false);
      return;
    }

    // Check priority next
    const priorityValue = addDueBillForm.priority ? parseInt(addDueBillForm.priority) : 0;
    if (priorityValue < 1) {
      setAddDueBillError('Priority must be at least 1');
      setAddDueBillLoading(false);
      return;
    }

    // Check required fields last
    if (!addDueBillForm.bill || !addDueBillForm.amount_due || !addDueBillForm.due_date) {
      setAddDueBillError('Bill, Amount Due, and Due Date are required');
      setAddDueBillLoading(false);
      return;
    }

    addDueBill({
      bill: parseInt(addDueBillForm.bill),
      recurrence: addDueBillForm.recurrence ? parseInt(addDueBillForm.recurrence) : null,
      amount_due: parseFloat(addDueBillForm.amount_due),
      total_balance: totalBalance,
      draft_account: addDueBillForm.draft_account ? parseInt(addDueBillForm.draft_account) : null,
      due_date: addDueBillForm.due_date,
      pay_date: addDueBillForm.pay_date || null,
      status: addDueBillForm.status ? parseInt(addDueBillForm.status) : null,
      priority: priorityValue,
    }, token)
      .then(() => {
        setShowAddDueBill(false);
        setAddDueBillForm({ bill: '', recurrence: '', amount_due: '', total_balance: '0', draft_account: '', due_date: '', pay_date: '', status: '', priority: '0' });
        setAddDueBillError(null);
        setAddDueBillLoading(false);
        refresh();
      })
      .catch(() => {
        setAddDueBillError('Failed to add due bill');
        setAddDueBillLoading(false);
      });
  };

  return {
    showAddDueBill,
    setShowAddDueBill,
    addDueBillForm,
    setAddDueBillForm,
    addDueBillError,
    setAddDueBillError,
    addDueBillLoading,
    setAddDueBillLoading,
    handleAddDueBillChange,
    handleAddDueBill,
  };
} 