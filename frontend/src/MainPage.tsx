import { useEffect, useState } from 'react';
import axios from 'axios';
import React from 'react';

// Interfaces for the union table
interface DueBill {
  id: number;
  bill: number; // Bill id
  recurrence: number | null;
  amount_due: string;
  draft_account: number | null;
  due_date: string;
  pay_date: string | null;
  status: number | null;
  priority: number;
}

interface BankAccountInstance {
  id: number;
  bank_account: number;
  balance: string;
  due_date: string;
  pay_date: string | null;
  status: number | null;
}

interface BankAccount {
  id: number;
  name: string;
  font_color: string;
}

interface Bill {
  id: number;
  name: string;
  recurrence?: number | null;
  default_amount_due?: string;
}

interface Status {
  id: number;
  name: string;
  highlight_color: string;
}

interface Recurrence {
  id: number;
  name: string;
  calculation?: string;
}

interface MainPageProps {
  token: string;
}

const MainPage = ({ token }: MainPageProps) => {
  const [dueBills, setDueBills] = useState<DueBill[]>([]);
  const [bankInstances, setBankInstances] = useState<BankAccountInstance[]>([]);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [recurrences, setRecurrences] = useState<Recurrence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });
  const [showAddDueBill, setShowAddDueBill] = useState(false);
  const [showAddBankInstance, setShowAddBankInstance] = useState(false);
  const [addDueBillForm, setAddDueBillForm] = useState({
    bill: '',
    recurrence: '',
    amount_due: '',
    draft_account: '',
    due_date: '',
    pay_date: '',
    status: '',
    priority: '0',
  });
  const [addDueBillError, setAddDueBillError] = useState<string | null>(null);
  const [addDueBillLoading, setAddDueBillLoading] = useState(false);
  const [addBankInstanceForm, setAddBankInstanceForm] = useState({
    bank_account: '',
    balance: '',
    due_date: '',
    pay_date: '',
    status: '',
  });
  const [addBankInstanceError, setAddBankInstanceError] = useState<string | null>(null);
  const [addBankInstanceLoading, setAddBankInstanceLoading] = useState(false);
  const [editingCell, setEditingCell] = useState<{
    rowId: number;
    type: 'DueBill' | 'BankAccountInstance';
    field: string;
    value: string | number;
  } | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Fetch all data
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([
      axios.get('/api/duebills/', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('/api/bankaccountinstances/', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('/api/bankaccounts/', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('/api/bills/', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('/api/statuses/', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('/api/recurrences/', { headers: { Authorization: `Bearer ${token}` } }),
    ])
      .then(([dueBillsRes, bankInstancesRes, accountsRes, billsRes, statusesRes, recurrencesRes]) => {
        setDueBills(dueBillsRes.data);
        setBankInstances(bankInstancesRes.data);
        setAccounts(accountsRes.data);
        setBills(billsRes.data);
        setStatuses(statusesRes.data);
        setRecurrences(recurrencesRes.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch data');
        setLoading(false);
      });
  }, [token]);

  // Prepare globally sorted rows and insert subtotal rows after each account's last record
  const allRowsRaw = [
    ...dueBills.map(row => ({
      ...row,
      type: 'DueBill' as const,
      name: bills.find(b => b.id === row.bill)?.name || 'Unknown',
      statusObj: statuses.find(s => s.id === row.status),
      accountObj: accounts.find(a => a.id === row.draft_account),
      accountId: row.draft_account,
    })),
    ...bankInstances.map(row => ({
      ...row,
      type: 'BankAccountInstance' as const,
      name: accounts.find(a => a.id === row.bank_account)?.name || 'Unknown',
      statusObj: statuses.find(s => s.id === row.status),
      accountObj: accounts.find(a => a.id === row.bank_account),
      accountId: row.bank_account,
    })),
  ];

  // Sort globally by payDate, Priority, DueDate, Account
  allRowsRaw.sort((a, b) => {
    // payDate
    const aPay = a.pay_date || '';
    const bPay = b.pay_date || '';
    if (aPay !== bPay) return aPay.localeCompare(bPay);
    // Priority (DueBill only, fallback 0)
    const aPriority = (a.type === 'DueBill' ? a.priority : 0);
    const bPriority = (b.type === 'DueBill' ? b.priority : 0);
    if (aPriority !== bPriority) return aPriority - bPriority;
    // DueDate
    const aDue = a.due_date || '';
    const bDue = b.due_date || '';
    if (aDue !== bDue) return aDue.localeCompare(bDue);
    // Account (by name for tie-breaker)
    const aName = a.accountObj?.name || '';
    const bName = b.accountObj?.name || '';
    return aName.localeCompare(bName);
  });

  // Prepare for rendering with subtotals
  const rowsWithSubtotals: Array<React.ReactNode> = [];
  const accountIdsInOrder: number[] = [];
  const accountRowMap: Record<number, typeof allRowsRaw> = {};

  // Group rows by account in the order they appear
  allRowsRaw.forEach(row => {
    if (row.accountId == null) return; // skip no-account
    if (!accountRowMap[row.accountId]) {
      accountRowMap[row.accountId] = [];
      accountIdsInOrder.push(row.accountId);
    }
    accountRowMap[row.accountId].push(row);
  });

  // Helper: get account name by id
  const getAccountName = (id: number) => accounts.find(a => a.id === id)?.name || 'Unknown';
  const getAccountFontColor = (id: number) => accounts.find(a => a.id === id)?.font_color || undefined;

  // Handle edit input change
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editingCell) return;
    setEditingCell({ ...editingCell, value: e.target.value });
  };

  // Handle blur or Enter
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

  // For each row in global order, render, and after the last row for an account, insert subtotal row
  allRowsRaw.forEach((row, idx) => {
    if (row.accountId == null) return; // skip no-account
    // Render the row
    rowsWithSubtotals.push(
      <tr
        key={row.type + '-' + row.id}
        style={{
          background: row.statusObj?.highlight_color || undefined,
          color: row.accountObj?.font_color || undefined,
        }}
      >
        {/* Type */}
        <td style={row.type === 'BankAccountInstance' ? { fontWeight: 'bold' } : {}}>{row.type === 'DueBill' ? 'Due Bill' : 'Account Instance'}</td>
        {/* Name */}
        <td
          style={row.type === 'BankAccountInstance' ? { fontWeight: 'bold' } : {}}
          onDoubleClick={() => handleCellDoubleClick(row, row.type, 'name', row.type === 'DueBill' ? row.bill : row.bank_account)}
        >
          {editingCell && editingCell.rowId === row.id && editingCell.type === row.type && editingCell.field === 'name' ? (
            <select
              value={editingCell.value}
              onChange={handleEditInputChange}
              onBlur={handleEditInputBlur}
              onKeyDown={handleEditInputKeyDown}
              autoFocus
              className="input input-bordered"
              disabled={savingEdit}
            >
              <option value="">Select</option>
              {(row.type === 'DueBill' ? bills : accounts).map(opt => (
                <option key={opt.id} value={opt.id}>{opt.name}</option>
              ))}
            </select>
          ) : (
            row.name
          )}
        </td>
        {/* Pay Date */}
        <td
          style={row.type === 'BankAccountInstance' ? { fontWeight: 'bold' } : {}}
          onDoubleClick={() => handleCellDoubleClick(row, row.type, 'pay_date', row.pay_date || '')}
        >
          {editingCell && editingCell.rowId === row.id && editingCell.type === row.type && editingCell.field === 'pay_date' ? (
            <input
              type="date"
              value={editingCell.value || ''}
              onChange={handleEditInputChange}
              onBlur={handleEditInputBlur}
              onKeyDown={handleEditInputKeyDown}
              autoFocus
              className="input input-bordered"
              disabled={savingEdit}
            />
          ) : (
            row.pay_date
              ? (() => {
                  const [year, month, day] = row.pay_date.split('-');
                  if (year && month && day) {
                    return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
                  }
                  return row.pay_date;
                })()
              : '-'
          )}
        </td>
        {/* Due Date */}
        <td
          style={row.type === 'BankAccountInstance' ? { fontWeight: 'bold' } : {}}
          onDoubleClick={() => handleCellDoubleClick(row, row.type, 'due_date', row.due_date)}
        >
          {editingCell && editingCell.rowId === row.id && editingCell.type === row.type && editingCell.field === 'due_date' ? (
            <input
              type="date"
              value={editingCell.value}
              onChange={handleEditInputChange}
              onBlur={handleEditInputBlur}
              onKeyDown={handleEditInputKeyDown}
              autoFocus
              className="input input-bordered"
              disabled={savingEdit}
            />
          ) : (
            (() => {
              const [year, month, day] = row.due_date.split('-');
              if (year && month && day) {
                return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
              }
              return row.due_date;
            })()
          )}
        </td>
        {/* Status */}
        <td
          style={row.type === 'BankAccountInstance' ? { fontWeight: 'bold' } : {}}
          onDoubleClick={() => handleCellDoubleClick(row, row.type, 'status', row.statusObj?.id || '')}
        >
          {editingCell && editingCell.rowId === row.id && editingCell.type === row.type && editingCell.field === 'status' ? (
            <select
              value={editingCell.value}
              onChange={handleEditInputChange}
              onBlur={handleEditInputBlur}
              onKeyDown={handleEditInputKeyDown}
              autoFocus
              className="input input-bordered"
              disabled={savingEdit}
            >
              <option value="">Select status</option>
              {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          ) : (
            row.statusObj?.name || '-'
          )}
        </td>
        {/* Account */}
        <td
          style={row.type === 'BankAccountInstance' ? { fontWeight: 'bold' } : {}}
          onDoubleClick={() => handleCellDoubleClick(row, row.type, 'account', row.accountObj?.id || '')}
        >
          {editingCell && editingCell.rowId === row.id && editingCell.type === row.type && editingCell.field === 'account' ? (
            <select
              value={editingCell.value}
              onChange={handleEditInputChange}
              onBlur={handleEditInputBlur}
              onKeyDown={handleEditInputKeyDown}
              autoFocus
              className="input input-bordered"
              disabled={savingEdit}
            >
              <option value="">Select account</option>
              {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
            </select>
          ) : (
            row.accountObj?.name || '-'
          )}
        </td>
        {/* Amount/Balance */}
        <td
          style={{
            ...(row.type === 'BankAccountInstance' ? { fontWeight: 'bold' } : {}),
            textAlign: 'right',
          }}
          onDoubleClick={() => handleCellDoubleClick(row, row.type, row.type === 'DueBill' ? 'amount_due' : 'balance', row.type === 'DueBill' ? row.amount_due : row.balance)}
        >
          {editingCell && editingCell.rowId === row.id && editingCell.type === row.type && editingCell.field === (row.type === 'DueBill' ? 'amount_due' : 'balance') ? (
            <input
              type="number"
              value={editingCell.value}
              onChange={handleEditInputChange}
              onBlur={handleEditInputBlur}
              onKeyDown={handleEditInputKeyDown}
              autoFocus
              className="input input-bordered"
              disabled={savingEdit}
            />
          ) : (
            (() => {
              const value = row.type === 'DueBill' ? row.amount_due : row.balance;
              const num = Number(value);
              if (!isNaN(num)) {
                return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
              }
              return value;
            })()
          )}
        </td>
      </tr>
    );
    // If this is the last row for this account, insert subtotal row
    const isLastForAccount =
      idx === allRowsRaw.length - 1 ||
      allRowsRaw[idx + 1].accountId !== row.accountId;
    if (isLastForAccount) {
      // Subtotal logic for this account (same as before)
      // Get all DueBills and BankAccountInstances for this account
      const accountDueBills = dueBills.filter(db => db.draft_account === row.accountId);
      const accountBankInstances = bankInstances.filter(bi => bi.bank_account === row.accountId);
      // Sort BankAccountInstances by pay_date (ascending, nulls last)
      const sortedBankInstances = [...accountBankInstances].sort((a, b) => {
        if (!a.pay_date && !b.pay_date) return 0;
        if (!a.pay_date) return 1;
        if (!b.pay_date) return -1;
        return a.pay_date.localeCompare(b.pay_date);
      });
      // Sort DueBills by pay_date, then priority, then due_date
      const sortedDueBills = [...accountDueBills].sort((a, b) => {
        if (!a.pay_date && !b.pay_date) return 0;
        if (!a.pay_date) return 1;
        if (!b.pay_date) return -1;
        if (a.pay_date !== b.pay_date) return a.pay_date.localeCompare(b.pay_date);
        if (a.priority !== b.priority) return a.priority - b.priority;
        return a.due_date.localeCompare(b.due_date);
      });
      if (sortedBankInstances.length > 0) {
        for (let i = 0; i < sortedBankInstances.length; i++) {
          const instance = sortedBankInstances[i];
          const nextInstance = sortedBankInstances[i + 1];
          const startDate = instance.pay_date;
          const endDate = nextInstance?.pay_date;
          // DueBills in [startDate, endDate)
          const dueBillsInRange = sortedDueBills.filter(db => {
            if (!db.pay_date) return false;
            if (startDate && db.pay_date < startDate) return false;
            if (endDate && db.pay_date >= endDate) return false;
            return true;
          });
          const sumDue = dueBillsInRange.reduce((sum, db) => sum + parseFloat(db.amount_due), 0);
          const subtotal = parseFloat(instance.balance) - sumDue;
          rowsWithSubtotals.push(
            <tr key={`subtotal-${row.accountId}-${instance.id}`} style={{ fontWeight: 'bold', background: '#f3f4f6', color: getAccountFontColor(row.accountId) }}>
              <td colSpan={6} style={{ textAlign: 'right' }}>{`Subtotal ${getAccountName(row.accountId)}`}</td>
              <td style={{ textAlign: 'right' }}>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(subtotal)}</td>
            </tr>
          );
        }
      } else if (sortedDueBills.length > 0) {
        // No BankAccountInstance, but DueBills exist
        const sumDue = sortedDueBills.reduce((sum, db) => sum + parseFloat(db.amount_due), 0);
        rowsWithSubtotals.push(
          <tr key={`subtotal-${row.accountId}-noinstance`} style={{ fontWeight: 'bold', background: '#f3f4f6', color: getAccountFontColor(row.accountId) }}>
            <td colSpan={6} style={{ textAlign: 'right' }}>{`Subtotal ${getAccountName(row.accountId)}`}</td>
            <td style={{ textAlign: 'right' }}>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(-sumDue)}</td>
          </tr>
        );
      }
    }
  });

  // Save edit handler
  const handleSaveEdit = async () => {
    if (!editingCell) return;
    setSavingEdit(true);
    try {
      if (editingCell.type === 'DueBill') {
        // Find the original row
        const row = dueBills.find(d => d.id === editingCell.rowId);
        if (!row) return;
        // Prepare payload
        const payload: Record<string, unknown> = { ...row };
        if (editingCell.field === 'name') {
          // Changing bill
          payload.bill = parseInt(editingCell.value as string);
        } else if (editingCell.field === 'account') {
          payload.draft_account = editingCell.value ? parseInt(editingCell.value as string) : null;
        } else if (editingCell.field === 'status') {
          payload.status = editingCell.value ? parseInt(editingCell.value as string) : null;
        } else if (editingCell.field === 'recurrence') {
          payload.recurrence = editingCell.value ? parseInt(editingCell.value as string) : null;
        } else {
          payload[editingCell.field] = editingCell.value;
        }
        // Remove non-editable fields
        delete payload.id;
        // Save
        await axios.patch(`/api/duebills/${row.id}/`, payload, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        // BankAccountInstance
        const row = bankInstances.find(b => b.id === editingCell.rowId);
        if (!row) return;
        const payload: Record<string, unknown> = { ...row };
        if (editingCell.field === 'name' || editingCell.field === 'account') {
          payload.bank_account = parseInt(editingCell.value as string);
        } else if (editingCell.field === 'status') {
          payload.status = editingCell.value ? parseInt(editingCell.value as string) : null;
        } else {
          payload[editingCell.field] = editingCell.value;
        }
        delete payload.id;
        await axios.patch(`/api/bankaccountinstances/${row.id}/`, payload, { headers: { Authorization: `Bearer ${token}` } });
      }
      // Refresh data
      setLoading(true);
      Promise.all([
        axios.get('/api/duebills/', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/bankaccountinstances/', { headers: { Authorization: `Bearer ${token}` } })
      ]).then(([dueBillsRes, bankInstancesRes]) => {
        setDueBills(dueBillsRes.data);
        setBankInstances(bankInstancesRes.data);
        setLoading(false);
      });
      setEditingCell(null);
    } catch {
      // Optionally show error
    } finally {
      setSavingEdit(false);
    }
  };

  // Handle cell double click
  const handleCellDoubleClick = (
    row: {
      id: number;
      type: 'DueBill' | 'BankAccountInstance';
    },
    type: 'DueBill' | 'BankAccountInstance',
    field: string,
    value: string | number
  ) => {
    setEditingCell({ rowId: row.id, type, field, value });
  };

  // Add DueBill handlers
  const handleAddDueBillChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // If the bill is being changed, set defaults for recurrence and amount_due
    if (name === 'bill') {
      const selectedBill = bills.find(b => b.id === parseInt(value));
      setAddDueBillForm(form => ({
        ...form,
        bill: value,
        recurrence: selectedBill?.recurrence ? selectedBill.recurrence.toString() : '',
        amount_due: selectedBill?.default_amount_due ? selectedBill.default_amount_due.toString() : '',
      }));
    } else {
      setAddDueBillForm({ ...addDueBillForm, [name]: value });
    }
  };
  const handleAddDueBill = (e: React.FormEvent) => {
    e.preventDefault();
    setAddDueBillError(null);
    setAddDueBillLoading(true);
    if (!addDueBillForm.bill || !addDueBillForm.amount_due || !addDueBillForm.due_date) {
      setAddDueBillError('Bill, Amount Due, and Due Date are required');
      setAddDueBillLoading(false);
      return;
    }
    axios.post('/api/duebills/', {
      bill: parseInt(addDueBillForm.bill),
      recurrence: addDueBillForm.recurrence ? parseInt(addDueBillForm.recurrence) : null,
      amount_due: parseFloat(addDueBillForm.amount_due),
      draft_account: addDueBillForm.draft_account ? parseInt(addDueBillForm.draft_account) : null,
      due_date: addDueBillForm.due_date,
      pay_date: addDueBillForm.pay_date || null,
      status: addDueBillForm.status ? parseInt(addDueBillForm.status) : null,
      priority: addDueBillForm.priority ? parseInt(addDueBillForm.priority) : 0,
    }, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        setShowAddDueBill(false);
        setAddDueBillForm({ bill: '', recurrence: '', amount_due: '', draft_account: '', due_date: '', pay_date: '', status: '', priority: '0' });
        setAddDueBillLoading(false);
        setLoading(true);
        // Refresh data
        Promise.all([
          axios.get('/api/duebills/', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/bankaccountinstances/', { headers: { Authorization: `Bearer ${token}` } })
        ]).then(([dueBillsRes, bankInstancesRes]) => {
          setDueBills(dueBillsRes.data);
          setBankInstances(bankInstancesRes.data);
          setLoading(false);
        });
      })
      .catch(() => {
        setAddDueBillError('Failed to add due bill');
        setAddDueBillLoading(false);
      });
  };

  // Add BankAccountInstance handlers
  const handleAddBankInstanceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAddBankInstanceForm({ ...addBankInstanceForm, [e.target.name]: e.target.value });
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
    axios.post('/api/bankaccountinstances/', {
      bank_account: parseInt(addBankInstanceForm.bank_account),
      balance: parseFloat(addBankInstanceForm.balance),
      due_date: addBankInstanceForm.due_date,
      pay_date: addBankInstanceForm.pay_date || null,
      status: addBankInstanceForm.status ? parseInt(addBankInstanceForm.status) : null,
    }, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        setShowAddBankInstance(false);
        setAddBankInstanceForm({ bank_account: '', balance: '', due_date: '', pay_date: '', status: '' });
        setAddBankInstanceLoading(false);
        setLoading(true);
        // Refresh data
        Promise.all([
          axios.get('/api/duebills/', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/bankaccountinstances/', { headers: { Authorization: `Bearer ${token}` } })
        ]).then(([dueBillsRes, bankInstancesRes]) => {
          setDueBills(dueBillsRes.data);
          setBankInstances(bankInstancesRes.data);
          setLoading(false);
        });
      })
      .catch(() => {
        setAddBankInstanceError('Failed to add bank account instance');
        setAddBankInstanceLoading(false);
      });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Main Table</h1>
        <div className="flex gap-2 items-center">
          <button className="btn btn-primary" onClick={() => setShowAddDueBill(true)}>Add Due Bill</button>
          <button className="btn btn-secondary" onClick={() => setShowAddBankInstance(true)}>Add Bank Account Instance</button>
          <input
            type="date"
            value={dateRange.start}
            onChange={e => setDateRange(r => ({ ...r, start: e.target.value }))}
            className="input input-bordered"
            placeholder="Start date"
          />
          <input
            type="date"
            value={dateRange.end}
            onChange={e => setDateRange(r => ({ ...r, end: e.target.value }))}
            className="input input-bordered"
            placeholder="End date"
          />
        </div>
      </div>
      {/* Add Due Bill Modal */}
      {showAddDueBill && (
        <div className="modal modal-open z-50" onClick={() => setShowAddDueBill(false)}>
          <div className="modal-box w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setShowAddDueBill(false)}
              aria-label="Close"
            >✕</button>
            <h2 className="font-bold text-xl mb-4">Add Due Bill</h2>
            <form onSubmit={handleAddDueBill} className="flex flex-col gap-3">
              <div className="form-control">
                <label className="label"><span className="label-text">Bill</span></label>
                <select name="bill" value={addDueBillForm.bill} onChange={handleAddDueBillChange} required className="input input-bordered">
                  <option value="">Select bill</option>
                  {bills.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Recurrence</span></label>
                <select name="recurrence" value={addDueBillForm.recurrence} onChange={handleAddDueBillChange} className="input input-bordered">
                  <option value="">Select recurrence</option>
                  {recurrences?.map?.(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Amount Due</span></label>
                <input name="amount_due" value={addDueBillForm.amount_due} onChange={handleAddDueBillChange} required type="number" step="0.01" className="input input-bordered" />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Draft Account</span></label>
                <select name="draft_account" value={addDueBillForm.draft_account} onChange={handleAddDueBillChange} className="input input-bordered">
                  <option value="">Select account</option>
                  {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Due Date</span></label>
                <input name="due_date" value={addDueBillForm.due_date} onChange={handleAddDueBillChange} required type="date" className="input input-bordered" />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Pay Date</span></label>
                <input name="pay_date" value={addDueBillForm.pay_date} onChange={handleAddDueBillChange} type="date" className="input input-bordered" />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Status</span></label>
                <select name="status" value={addDueBillForm.status} onChange={handleAddDueBillChange} className="input input-bordered">
                  <option value="">Select status</option>
                  {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Priority</span></label>
                <input name="priority" value={addDueBillForm.priority} onChange={handleAddDueBillChange} type="number" className="input input-bordered" />
              </div>
              <div className="flex gap-2 mt-2">
                <button type="submit" disabled={addDueBillLoading} className="btn btn-primary w-full">Add</button>
              </div>
              {addDueBillError && <div className="text-error text-center">{addDueBillError}</div>}
            </form>
          </div>
        </div>
      )}
      {/* Add Bank Account Instance Modal */}
      {showAddBankInstance && (
        <div className="modal modal-open z-50" onClick={() => setShowAddBankInstance(false)}>
          <div className="modal-box w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setShowAddBankInstance(false)}
              aria-label="Close"
            >✕</button>
            <h2 className="font-bold text-xl mb-4">Add Bank Account Instance</h2>
            <form onSubmit={handleAddBankInstance} className="flex flex-col gap-3">
              <div className="form-control">
                <label className="label"><span className="label-text">Bank Account</span></label>
                <select name="bank_account" value={addBankInstanceForm.bank_account} onChange={handleAddBankInstanceChange} required className="input input-bordered">
                  <option value="">Select account</option>
                  {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Balance</span></label>
                <input name="balance" value={addBankInstanceForm.balance} onChange={handleAddBankInstanceChange} required type="number" step="0.01" className="input input-bordered" />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Due Date</span></label>
                <input name="due_date" value={addBankInstanceForm.due_date} onChange={handleAddBankInstanceChange} required type="date" className="input input-bordered" />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Pay Date</span></label>
                <input name="pay_date" value={addBankInstanceForm.pay_date} onChange={handleAddBankInstanceChange} type="date" className="input input-bordered" />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Status</span></label>
                <select name="status" value={addBankInstanceForm.status} onChange={handleAddBankInstanceChange} className="input input-bordered">
                  <option value="">Select status</option>
                  {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="flex gap-2 mt-2">
                <button type="submit" disabled={addBankInstanceLoading} className="btn btn-primary w-full">Add</button>
              </div>
              {addBankInstanceError && <div className="text-error text-center">{addBankInstanceError}</div>}
            </form>
          </div>
        </div>
      )}
      {loading && <div className="flex justify-center"><span className="loading loading-spinner loading-lg"></span></div>}
      {error && <div className="alert alert-error mb-4">{error}</div>}
      {!loading && !error && (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Type</th>
                <th>Name</th>
                <th>Pay Date</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Account</th>
                <th>Amount/Balance</th>
              </tr>
            </thead>
            <tbody>
              {rowsWithSubtotals}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MainPage; 