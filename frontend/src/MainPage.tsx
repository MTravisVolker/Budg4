import React, { useState } from 'react';
import axios from 'axios';
import AddDueBillModal from './components/AddDueBillModal';
import AddBankInstanceModal from './components/AddBankInstanceModal';
import MainTableRow from './components/MainTableRow';
import SubtotalRow from './components/SubtotalRow';
import useMainPageData from './hooks/useMainPageData';
import useEditableCell from './hooks/useEditableCell';

interface MainPageProps {
  token: string;
}

const MainPage = ({ token }: MainPageProps) => {
  // Fetch all main data and provide refresh, loading, error
  const {
    dueBills, bankInstances, accounts, bills, statuses, recurrences, loading, error, refresh
  } = useMainPageData(token);

  // Local state for add modals and forms
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [showAddDueBill, setShowAddDueBill] = useState(false);
  const [showAddBankInstance, setShowAddBankInstance] = useState(false);
  const [addDueBillForm, setAddDueBillForm] = useState({
    bill: '', recurrence: '', amount_due: '', draft_account: '', due_date: '', pay_date: '', status: '', priority: '0',
  });
  const [addDueBillError, setAddDueBillError] = useState<string | null>(null);
  const [addDueBillLoading, setAddDueBillLoading] = useState(false);
  const [addBankInstanceForm, setAddBankInstanceForm] = useState({
    bank_account: '', balance: '', due_date: '', pay_date: '', status: '',
  });
  const [addBankInstanceError, setAddBankInstanceError] = useState<string | null>(null);
  const [addBankInstanceLoading, setAddBankInstanceLoading] = useState(false);

  // Inline cell editing logic (encapsulated in custom hook)
  const {
    editingCell, savingEdit,
    handleCellDoubleClick, handleEditInputChange, handleEditInputBlur, handleEditInputKeyDown
  } = useEditableCell(async (editingCell) => {
    // Save edit handler for both DueBill and BankAccountInstance
    if (!editingCell) return;
    if (editingCell.type === 'DueBill') {
      const row = dueBills.find(d => d.id === editingCell.rowId);
      if (!row) return;
      const payload: Record<string, unknown> = { ...row };
      if (editingCell.field === 'name') {
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
      delete payload.id;
      await axios.patch(`/api/duebills/${row.id}/`, payload, { headers: { Authorization: `Bearer ${token}` } });
    } else {
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
    await refresh();
  });

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
        refresh();
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
        refresh();
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
        <AddDueBillModal
          show={showAddDueBill}
          onClose={() => setShowAddDueBill(false)}
          onSubmit={handleAddDueBill}
          onChange={handleAddDueBillChange}
          form={addDueBillForm}
          error={addDueBillError}
          loading={addDueBillLoading}
          bills={bills}
          recurrences={recurrences}
          accounts={accounts}
          statuses={statuses}
        />
      )}
      {/* Add Bank Account Instance Modal */}
      {showAddBankInstance && (
        <AddBankInstanceModal
          show={showAddBankInstance}
          onClose={() => setShowAddBankInstance(false)}
          onSubmit={handleAddBankInstance}
          onChange={handleAddBankInstanceChange}
          form={addBankInstanceForm}
          error={addBankInstanceError}
          loading={addBankInstanceLoading}
          accounts={accounts}
          statuses={statuses}
        />
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
              {allRowsRaw.map((row, idx) => {
                if (row.accountId == null) return null;
                const isLastForAccount =
                  idx === allRowsRaw.length - 1 ||
                  allRowsRaw[idx + 1].accountId !== row.accountId;
                const renderedRows = [
                  <MainTableRow
                    key={row.type + '-' + row.id}
                    row={row}
                    editingCell={editingCell}
                    savingEdit={savingEdit}
                    handleCellDoubleClick={handleCellDoubleClick}
                    handleEditInputChange={handleEditInputChange}
                    handleEditInputBlur={handleEditInputBlur}
                    handleEditInputKeyDown={handleEditInputKeyDown}
                    bills={bills}
                    accounts={accounts}
                    statuses={statuses}
                  />
                ];
                if (isLastForAccount) {
                  // Subtotal logic for this account (same as before)
                  const accountDueBills = dueBills.filter(db => db.draft_account === row.accountId);
                  const accountBankInstances = bankInstances.filter(bi => bi.bank_account === row.accountId);
                  const sortedBankInstances = [...accountBankInstances].sort((a, b) => {
                    if (!a.pay_date && !b.pay_date) return 0;
                    if (!a.pay_date) return 1;
                    if (!b.pay_date) return -1;
                    return a.pay_date.localeCompare(b.pay_date);
                  });
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
                      const dueBillsInRange = sortedDueBills.filter(db => {
                        if (!db.pay_date) return false;
                        if (startDate && db.pay_date < startDate) return false;
                        if (endDate && db.pay_date >= endDate) return false;
                        return true;
                      });
                      const sumDue = dueBillsInRange.reduce((sum, db) => sum + parseFloat(db.amount_due), 0);
                      const subtotal = parseFloat(instance.balance) - sumDue;
                      renderedRows.push(
                        <SubtotalRow
                          key={`subtotal-${row.accountId}-${instance.id}`}
                          rowKey={`subtotal-${row.accountId}-${instance.id}`}
                          subtotal={subtotal}
                          accountName={accounts.find(a => a.id === row.accountId)?.name || 'Unknown'}
                          fontColor={accounts.find(a => a.id === row.accountId)?.font_color}
                        />
                      );
                    }
                  } else if (sortedDueBills.length > 0) {
                    const sumDue = sortedDueBills.reduce((sum, db) => sum + parseFloat(db.amount_due), 0);
                    renderedRows.push(
                      <SubtotalRow
                        key={`subtotal-${row.accountId}-noinstance`}
                        rowKey={`subtotal-${row.accountId}-noinstance`}
                        subtotal={-sumDue}
                        accountName={accounts.find(a => a.id === row.accountId)?.name || 'Unknown'}
                        fontColor={accounts.find(a => a.id === row.accountId)?.font_color}
                      />
                    );
                  }
                }
                return renderedRows;
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MainPage; 