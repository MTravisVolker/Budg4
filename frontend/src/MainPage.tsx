import React, { useState } from 'react';
import axios from 'axios';
import AddDueBillModal from './components/AddDueBillModal';
import AddBankInstanceModal from './components/AddBankInstanceModal';
import MainTableRow from './components/MainTableRow';
import SubtotalRow from './components/SubtotalRow';
import useMainPageData from './hooks/useMainPageData';
import useEditableCell from './hooks/useEditableCell';
import AddBankAccountModal from './components/AddBankAccountModal';
import AddCategoryModal from './components/AddCategoryModal';
import AddRecurrenceModal from './components/AddRecurrenceModal';
import AddStatusModal from './components/AddStatusModal';
import AddBillModal from './components/AddBillModal';

interface MainPageProps {
  token: string;
}

const MainPage = ({ token }: MainPageProps) => {
  // Fetch all main data and provide refresh, loading, error
  const {
    dueBills, bankInstances, accounts, bills, statuses, recurrences, categories, loading, error, refresh
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
  const [showAddBillModal, setShowAddBillModal] = useState(false);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showAddStatusModal, setShowAddStatusModal] = useState(false);
  const [showAddRecurrenceModal, setShowAddRecurrenceModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

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

  // Sort globally by payDate, Account, Priority, DueDate
  allRowsRaw.sort((a, b) => {
    // payDate
    const aPay = a.pay_date || '';
    const bPay = b.pay_date || '';
    if (aPay !== bPay) return aPay.localeCompare(bPay);
    // Account (by name)
    const aName = a.accountObj?.name || '';
    const bName = b.accountObj?.name || '';
    if (aName !== bName) return aName.localeCompare(bName);
    // Priority (DueBill only, fallback 0)
    const aPriority = (a.type === 'DueBill' ? a.priority : 0);
    const bPriority = (b.type === 'DueBill' ? b.priority : 0);
    if (aPriority !== bPriority) return aPriority - bPriority;
    // DueDate
    const aDue = a.due_date || '';
    const bDue = b.due_date || '';
    return aDue.localeCompare(bDue);
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
    if (e.target.name === 'due_date') {
      setAddBankInstanceForm({ ...addBankInstanceForm, due_date: e.target.value, pay_date: e.target.value });
    } else {
      setAddBankInstanceForm({ ...addBankInstanceForm, [e.target.name]: e.target.value });
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

  // Delete row handler
  const handleDeleteRow = async (type: 'DueBill' | 'BankAccountInstance', id: number) => {
    if (!window.confirm('Are you sure you want to delete this row?')) return;
    try {
      if (type === 'DueBill') {
        await axios.delete(`/api/duebills/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.delete(`/api/bankaccountinstances/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
      }
      await refresh();
    } catch {
      alert('Failed to delete row.');
    }
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
          onAddBill={() => setShowAddBillModal(true)}
          onAddRecurrence={() => setShowAddRecurrenceModal(true)}
          onAddAccount={() => setShowAddAccountModal(true)}
          onAddStatus={() => setShowAddStatusModal(true)}
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
          onAddAccount={() => setShowAddAccountModal(true)}
          onAddStatus={() => setShowAddStatusModal(true)}
        />
      )}
      {showAddBillModal && (
        <AddBillModal
          show={showAddBillModal}
          onClose={() => setShowAddBillModal(false)}
          token={token}
          accounts={accounts}
          categories={categories}
          recurrences={recurrences}
          onAdded={refresh}
        />
      )}
      {showAddAccountModal && (
        <AddBankAccountModal
          show={showAddAccountModal}
          onClose={() => setShowAddAccountModal(false)}
          token={token}
          onAdded={refresh}
        />
      )}
      {showAddStatusModal && (
        <AddStatusModal
          show={showAddStatusModal}
          onClose={() => setShowAddStatusModal(false)}
          token={token}
          onAdded={refresh}
        />
      )}
      {showAddRecurrenceModal && (
        <AddRecurrenceModal
          show={showAddRecurrenceModal}
          onClose={() => setShowAddRecurrenceModal(false)}
          token={token}
          onAdded={refresh}
        />
      )}
      {showAddCategoryModal && (
        <AddCategoryModal
          show={showAddCategoryModal}
          onClose={() => setShowAddCategoryModal(false)}
          token={token}
          onAdded={refresh}
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
              {(() => {
                // Globally sorted rows (already sorted above)
                const renderedRows: React.ReactNode[] = [];
                const subtotalInsertedForAccount: Record<number, boolean> = {};
                // For each account, collect due bills for subtotaling
                const dueBillsByAccount: Record<number, typeof dueBills> = {};
                dueBills.forEach((db) => {
                  const draftAccount: number | undefined = db.draft_account === null ? undefined : db.draft_account;
                  if (typeof draftAccount === 'number') {
                    if (!dueBillsByAccount[draftAccount]) dueBillsByAccount[draftAccount] = [];
                    dueBillsByAccount[draftAccount].push(db);
                  }
                });
                // For each account, collect bank instances for subtotaling
                const bankInstancesByAccount: Record<number, typeof bankInstances> = {};
                bankInstances.forEach((bi) => {
                  const bankAccount: number | undefined = bi.bank_account === null ? undefined : bi.bank_account;
                  if (typeof bankAccount === 'number') {
                    if (!bankInstancesByAccount[bankAccount]) bankInstancesByAccount[bankAccount] = [];
                    bankInstancesByAccount[bankAccount].push(bi);
                  }
                });
                // Track which due bills have been rendered (for subtotaling)
                const renderedDueBillIds = new Set<number>();
                // Iterate through globally sorted rows
                for (let i = 0; i < allRowsRaw.length; i++) {
                  const r = allRowsRaw[i];
                  const isBankInstance = r.type === 'BankAccountInstance';
                  const isDueBill = r.type === 'DueBill';
                  // Render the row
                  renderedRows.push(
                    <MainTableRow
                      key={r.type + '-' + r.id}
                      row={r}
                      editingCell={editingCell}
                      savingEdit={savingEdit}
                      handleCellDoubleClick={handleCellDoubleClick}
                      handleEditInputChange={handleEditInputChange}
                      handleEditInputBlur={handleEditInputBlur}
                      handleEditInputKeyDown={handleEditInputKeyDown}
                      bills={bills}
                      accounts={accounts}
                      statuses={statuses}
                      onDelete={handleDeleteRow}
                      onAddBill={() => setShowAddBillModal(true)}
                      onAddAccount={() => setShowAddAccountModal(true)}
                      onAddStatus={() => setShowAddStatusModal(true)}
                    />
                  );
                  // For due bills, mark as rendered
                  if (isDueBill) {
                    renderedDueBillIds.add(r.id);
                  }
                  // If this is a bank instance, insert subtotal after all due bills with pay_date >= this instance's pay_date and < next instance's pay_date
                  if (isBankInstance) {
                    const accountId: number | undefined = r.accountId === null ? undefined : r.accountId;
                    if (typeof accountId === 'number') {
                      const thisPayDate = r.pay_date || '';
                      // Find next bank instance for this account
                      const accountBankInstances = bankInstancesByAccount[accountId] || [];
                      const thisIndex = accountBankInstances.findIndex((bi) => bi.id === r.id);
                      const nextInstance = accountBankInstances[thisIndex + 1];
                      const nextPayDate = nextInstance ? nextInstance.pay_date || '' : null;
                      // Find due bills in this range
                      const dueBillsInRange = (dueBillsByAccount[accountId] || []).filter((db) => {
                        if (!db.pay_date) return false;
                        if (db.pay_date < thisPayDate) return false;
                        if (nextPayDate && db.pay_date >= nextPayDate) return false;
                        return true;
                      });
                      const sumDue = dueBillsInRange.reduce((sum: number, db) => sum + parseFloat(db.amount_due), 0);
                      const subtotal = parseFloat(r.balance) - sumDue;
                      renderedRows.push(
                        <SubtotalRow
                          key={`subtotal-${accountId}-${r.id}`}
                          rowKey={`subtotal-${accountId}-${r.id}`}
                          subtotal={subtotal}
                          accountName={accounts.find(a => a.id === accountId)?.name || 'Unknown'}
                          fontColor={accounts.find(a => a.id === accountId)?.font_color}
                        />
                      );
                    }
                  }
                  // If this is the last row for an account and there are due bills not covered by any bank instance, insert subtotal for those
                  const nextRow = allRowsRaw[i + 1];
                  const accountId: number | undefined = r.accountId === null ? undefined : r.accountId;
                  const isLastForAccount = typeof accountId === 'number' && (!nextRow || nextRow.accountId !== accountId);
                  if (isLastForAccount && typeof accountId === 'number' && !subtotalInsertedForAccount[accountId]) {
                    // Find due bills for this account not covered by any bank instance
                    const accountDueBills = (dueBillsByAccount[accountId] || []).filter((db) => db.pay_date && !renderedDueBillIds.has(db.id));
                    if (accountDueBills.length > 0) {
                      const sumDue = accountDueBills.reduce((sum: number, db) => sum + parseFloat(db.amount_due), 0);
                      renderedRows.push(
                        <SubtotalRow
                          key={`subtotal-${accountId}-noinstance`}
                          rowKey={`subtotal-${accountId}-noinstance`}
                          subtotal={-sumDue}
                          accountName={accounts.find(a => a.id === accountId)?.name || 'Unknown'}
                          fontColor={accounts.find(a => a.id === accountId)?.font_color}
                        />
                      );
                    }
                    subtotalInsertedForAccount[accountId] = true;
                  }
                }
                return renderedRows;
              })()}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MainPage; 