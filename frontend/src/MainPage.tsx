import React, { useState } from 'react';
import useMainPageData from './hooks/useMainPageData';
import useEditableCell from './hooks/useEditableCell';
import MainTableBody from './components/MainTableBody';
import { editDueBill, editBankAccountInstance, deleteDueBill, deleteBankAccountInstance } from './api/dueBillApi';
import { DueBill, BankAccountInstance, BankAccount, Bill, Status } from './types';
import RenderAddDueBillModal from './components/RenderAddDueBillModal';
import RenderAddBankInstanceModal from './components/RenderAddBankInstanceModal';
import RenderAddBillModal from './components/RenderAddBillModal';
import RenderAddBankAccountModal from './components/RenderAddBankAccountModal';
import RenderAddStatusModal from './components/RenderAddStatusModal';
import RenderAddRecurrenceModal from './components/RenderAddRecurrenceModal';
import RenderAddCategoryModal from './components/RenderAddCategoryModal';

interface MainPageProps {
  token: string;
}

// Add form types for AddBill and AddDueBill
export type AddBillForm = {
  name: string;
  default_amount_due: string;
  url: string;
  draft_account: string;
  category: string;
  recurrence: string;
  priority: string;
};

export type AddDueBillForm = {
  bill: string;
  recurrence: string;
  amount_due: string;
  draft_account: string;
  due_date: string;
  pay_date: string;
  status: string;
  priority: string;
};

// Utility function to prepare and sort all rows for the main table
function getAllRowsRaw(
  dueBills: DueBill[],
  bankInstances: BankAccountInstance[],
  accounts: BankAccount[],
  bills: Bill[],
  statuses: Status[]
) {
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
      priority: 0,
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

  return allRowsRaw;
}

const MainPage = ({ token }: MainPageProps) => {
  // Fetch all main data and provide refresh, loading, error
  const {
    dueBills, bankInstances, accounts, bills, statuses, recurrences, categories, loading, error, refresh
  } = useMainPageData(token);

  // Local state for add modals and forms
  const [addDueBillError, setAddDueBillError] = useState<string | null>(null);
  const [addDueBillLoading, setAddDueBillLoading] = useState(false);
  const [addBankInstanceError, setAddBankInstanceError] = useState<string | null>(null);
  const [addBankInstanceLoading, setAddBankInstanceLoading] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [showAddDueBillModal, setShowAddDueBillModal] = useState(false);
  const [showAddBankInstanceModal, setShowAddBankInstanceModal] = useState(false);
  const [showAddBillModal, setShowAddBillModal] = useState(false);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showAddStatusModal, setShowAddStatusModal] = useState(false);
  const [showAddRecurrenceModal, setShowAddRecurrenceModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

  // Modal stack for navigation and restoration
  const setModalStack: React.Dispatch<React.SetStateAction<Array<{ modal: string; form: unknown; pendingField: string | null }>>> = useState<Array<{ modal: string; form: unknown; pendingField: string | null }>>([])[1];

  // Form states for each modal
  const [addDueBillForm, setAddDueBillForm] = useState<AddDueBillForm>({
    bill: '', recurrence: '', amount_due: '', draft_account: '', due_date: '', pay_date: '', status: '', priority: '0',
  });
  type AddBankInstanceForm = {
    bank_account: string;
    balance: string;
    due_date: string;
    pay_date: string;
    status: string;
    priority: string;
  };
  const [addBankInstanceForm, setAddBankInstanceForm] = useState<AddBankInstanceForm>({
    bank_account: '', balance: '', due_date: '', pay_date: '', status: '', priority: '0',
  });
  const [addBillForm, setAddBillForm] = useState<AddBillForm>({
    name: '', default_amount_due: '', url: '', draft_account: '', category: '', recurrence: '', priority: '0',
  });

  // Inline cell editing logic (encapsulated in custom hook)
  const {
    editingCell, savingEdit,
    handleCellDoubleClick, handleEditInputChange, handleEditInputBlur, handleEditInputKeyDown
  } = useEditableCell(async (editingCell) => {
    // Save edit handler for both DueBill and BankAccountInstance
    if (!editingCell) return;
    const { rowId, type, field, value } = editingCell;
    if (type === 'DueBill') {
      const row = dueBills.find(d => d.id === rowId);
      if (!row) return;
      const payload: Record<string, unknown> = { ...row };
      if (field === 'name') {
        payload.bill = parseInt(value as string);
      } else if (field === 'account') {
        payload.draft_account = value ? parseInt(value as string) : null;
      } else if (field === 'status') {
        payload.status = value ? parseInt(value as string) : null;
      } else if (field === 'recurrence') {
        payload.recurrence = value ? parseInt(value as string) : null;
      } else {
        payload[field] = value;
      }
      delete payload.id;
      await editDueBill(row.id, payload, token);
    } else {
      const row = bankInstances.find(b => b.id === rowId);
      if (!row) return;
      const payload: Record<string, unknown> = { ...row };
      if (field === 'name' || field === 'account') {
        payload.bank_account = parseInt(value as string);
      } else if (field === 'status') {
        payload.status = value ? parseInt(value as string) : null;
      } else {
        payload[field] = value;
      }
      delete payload.id;
      await editBankAccountInstance(row.id, payload, token);
    }
    await refresh();
  });

  // Prepare globally sorted rows and insert subtotal rows after each account's last record
  const allRowsRaw = getAllRowsRaw(dueBills, bankInstances, accounts, bills, statuses);

  // Delete row handler
  const handleDeleteRow = async (type: 'DueBill' | 'BankAccountInstance', id: number) => {
    if (!window.confirm('Are you sure you want to delete this row?')) return;
    try {
      if (type === 'DueBill') {
        await deleteDueBill(id, token);
      } else {
        await deleteBankAccountInstance(id, token);
      }
      await refresh();
    } catch {
      alert('Failed to delete row.');
    }
  };

  // Helper to open a modal and push to stack
  const openModal = (modal: string, form: unknown, pendingField: string | null = null) => {
    setModalStack(stack => [...stack, { modal, form, pendingField }]);
    if (modal === 'AddDueBill') setShowAddDueBillModal(true);
    if (modal === 'AddBill') setShowAddBillModal(true);
    if (modal === 'AddBankAccount') setShowAddAccountModal(true);
    if (modal === 'AddStatus') setShowAddStatusModal(true);
    if (modal === 'AddRecurrence') setShowAddRecurrenceModal(true);
    if (modal === 'AddCategory') setShowAddCategoryModal(true);
    if (modal === 'AddBankInstance') setShowAddBankInstanceModal(true);
  };

  // Helper to close a modal and pop from stack
  const closeModal = (modal: string) => {
    setModalStack(stack => stack.slice(0, -1));
    if (modal === 'AddDueBill') setShowAddDueBillModal(false);
    if (modal === 'AddBill') setShowAddBillModal(false);
    if (modal === 'AddBankAccount') setShowAddAccountModal(false);
    if (modal === 'AddStatus') setShowAddStatusModal(false);
    if (modal === 'AddRecurrence') setShowAddRecurrenceModal(false);
    if (modal === 'AddCategory') setShowAddCategoryModal(false);
    if (modal === 'AddBankInstance') setShowAddBankInstanceModal(false);
  };

  // Handler to open "add new" from any modal
  const handleAddNewFromModal = (fromModal: string, field: string, form: unknown) => {
    // Save current form and pending field
    openModal(fromModal, form, field);
    // Open the new modal
    if (field === 'bill') openModal('AddBill', {});
    if (field === 'recurrence') openModal('AddRecurrence', {});
    if (field === 'account') openModal('AddBankAccount', {});
    if (field === 'status') openModal('AddStatus', {});
    if (field === 'category') openModal('AddCategory', {});
  };

  // Handler after adding a new item
  const handleAddedNewItem = (newItemType: string, newItemId: number) => {
    refresh();
    setTimeout(() => {
      setModalStack(stack => {
        const newStack = stack.slice(0, -1);
        if (newStack.length === 0) return newStack;
        const prev = newStack[newStack.length - 1];
        // Restore previous modal and form state
        if (prev.modal === 'AddDueBill') {
          const newForm = { ...addDueBillForm };
          if (prev.pendingField === 'bill' && newItemType === 'bill') newForm.bill = newItemId.toString();
          if (prev.pendingField === 'recurrence' && newItemType === 'recurrence') newForm.recurrence = newItemId.toString();
          if (prev.pendingField === 'account' && newItemType === 'account') newForm.draft_account = newItemId.toString();
          if (prev.pendingField === 'status' && newItemType === 'status') newForm.status = newItemId.toString();
          setAddDueBillForm(newForm);
          setShowAddDueBillModal(true);
        } else if (prev.modal === 'AddBill') {
          const newForm = { ...addBillForm };
          if (prev.pendingField === 'account' && newItemType === 'account') newForm.draft_account = newItemId.toString();
          if (prev.pendingField === 'category' && newItemType === 'category') newForm.category = newItemId.toString();
          if (prev.pendingField === 'recurrence' && newItemType === 'recurrence') newForm.recurrence = newItemId.toString();
          setAddBillForm(newForm);
          setShowAddBillModal(true);
        }
        // Add similar logic for other modals if needed
        return newStack;
      });
    }, 200);
  };

  // AddDueBill handlers
  const handleAddDueBillChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'bill') {
      const selectedBill = bills.find(b => b.id === parseInt(value));
      setAddDueBillForm(form => ({
        ...form,
        bill: value,
        recurrence: selectedBill?.recurrence ? selectedBill.recurrence.toString() : '',
        amount_due: selectedBill?.default_amount_due ? selectedBill.default_amount_due.toString() : '',
      }));
    } else {
      setAddDueBillForm(form => ({ ...form, [name]: value }));
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
    const priorityValue = addDueBillForm.priority ? parseInt(addDueBillForm.priority) : 0;
    if (priorityValue < 1) {
      setAddDueBillError('Priority must be at least 1');
      setAddDueBillLoading(false);
      return;
    }
    import('./api/dueBillApi').then(({ addDueBill }) => {
      addDueBill({
        bill: parseInt(addDueBillForm.bill),
        recurrence: addDueBillForm.recurrence ? parseInt(addDueBillForm.recurrence) : null,
        amount_due: parseFloat(addDueBillForm.amount_due),
        draft_account: addDueBillForm.draft_account ? parseInt(addDueBillForm.draft_account) : null,
        due_date: addDueBillForm.due_date,
        pay_date: addDueBillForm.pay_date || null,
        status: addDueBillForm.status ? parseInt(addDueBillForm.status) : null,
        priority: priorityValue,
      }, token)
        .then(() => {
          setShowAddDueBillModal(false);
          setAddDueBillForm({ bill: '', recurrence: '', amount_due: '', draft_account: '', due_date: '', pay_date: '', status: '', priority: '0' });
          setAddDueBillLoading(false);
          refresh();
        })
        .catch(() => {
          setAddDueBillError('Failed to add due bill');
          setAddDueBillLoading(false);
        });
    });
  };

  // AddBankInstance handlers
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
    import('./api/dueBillApi').then(({ addBankAccountInstance }) => {
      addBankAccountInstance({
        bank_account: parseInt(addBankInstanceForm.bank_account),
        balance: parseFloat(addBankInstanceForm.balance),
        due_date: addBankInstanceForm.due_date,
        pay_date: addBankInstanceForm.pay_date || null,
        status: addBankInstanceForm.status ? parseInt(addBankInstanceForm.status) : null,
        priority: (() => {
          const val = parseInt(addBankInstanceForm.priority, 10);
          return isNaN(val) ? 0 : val;
        })(),
      }, token)
        .then(() => {
          setShowAddBankInstanceModal(false);
          setAddBankInstanceForm({ bank_account: '', balance: '', due_date: '', pay_date: '', status: '', priority: '0' });
          setAddBankInstanceLoading(false);
          refresh();
        })
        .catch(() => {
          setAddBankInstanceError('Failed to add bank account instance');
          setAddBankInstanceLoading(false);
        });
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Main Table</h1>
        <div className="flex gap-2 items-center">
          <button className="btn btn-primary" onClick={() => setShowAddDueBillModal(true)}>Add Due Bill</button>
          <button className="btn btn-secondary" onClick={() => setShowAddBankInstanceModal(true)}>Add Bank Account Instance</button>
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
      {/* Modals */}
      <RenderAddDueBillModal
        show={showAddDueBillModal}
        onClose={() => closeModal('AddDueBill')}
        onSubmit={handleAddDueBill}
        onChange={handleAddDueBillChange}
        form={addDueBillForm}
        error={addDueBillError}
        loading={addDueBillLoading}
        bills={bills}
        recurrences={recurrences}
        accounts={accounts}
        statuses={statuses}
        onAddBill={() => handleAddNewFromModal('AddDueBill', 'bill', addDueBillForm)}
        onAddRecurrence={() => handleAddNewFromModal('AddDueBill', 'recurrence', addDueBillForm)}
        onAddAccount={() => handleAddNewFromModal('AddDueBill', 'account', addDueBillForm)}
        onAddStatus={() => handleAddNewFromModal('AddDueBill', 'status', addDueBillForm)}
      />
      <RenderAddBankInstanceModal
        show={showAddBankInstanceModal}
        onClose={() => closeModal('AddBankInstance')}
        onSubmit={handleAddBankInstance}
        onChange={handleAddBankInstanceChange}
        form={addBankInstanceForm}
        error={addBankInstanceError}
        loading={addBankInstanceLoading}
        accounts={accounts}
        statuses={statuses}
        onAddAccount={() => handleAddNewFromModal('AddBankInstance', 'account', addBankInstanceForm)}
        onAddStatus={() => handleAddNewFromModal('AddBankInstance', 'status', addBankInstanceForm)}
      />
      <RenderAddBillModal
        show={showAddBillModal}
        onClose={() => closeModal('AddBill')}
        token={token}
        accounts={accounts}
        categories={categories}
        recurrences={recurrences}
        onAdded={() => handleAddedNewItem('bill', bills.length > 0 ? Math.max(...bills.map(b => b.id)) : 0)}
        onAddAccount={() => handleAddNewFromModal('AddBill', 'account', addBillForm)}
        onAddCategory={() => handleAddNewFromModal('AddBill', 'category', addBillForm)}
        onAddRecurrence={() => handleAddNewFromModal('AddBill', 'recurrence', addBillForm)}
      />
      <RenderAddBankAccountModal
        show={showAddAccountModal}
        onClose={() => closeModal('AddBankAccount')}
        token={token}
        onAdded={() => handleAddedNewItem('account', accounts.length > 0 ? Math.max(...accounts.map(a => a.id)) : 0)}
      />
      <RenderAddStatusModal
        show={showAddStatusModal}
        onClose={() => closeModal('AddStatus')}
        token={token}
        onAdded={() => handleAddedNewItem('status', statuses.length > 0 ? Math.max(...statuses.map(s => s.id)) : 0)}
      />
      <RenderAddRecurrenceModal
        show={showAddRecurrenceModal}
        onClose={() => closeModal('AddRecurrence')}
        token={token}
        onAdded={() => handleAddedNewItem('recurrence', recurrences.length > 0 ? Math.max(...recurrences.map(r => r.id)) : 0)}
      />
      <RenderAddCategoryModal
        show={showAddCategoryModal}
        onClose={() => closeModal('AddCategory')}
        token={token}
        onAdded={() => handleAddedNewItem('category', categories.length > 0 ? Math.max(...categories.map(c => c.id)) : 0)}
      />
      {/* End Modals */}
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
                <th>Priority</th>
                <th>Amount/Balance</th>
              </tr>
            </thead>
            <tbody>
              <MainTableBody
                allRowsRaw={allRowsRaw}
                dueBills={dueBills}
                bankInstances={bankInstances}
                accounts={accounts}
                bills={bills}
                statuses={statuses}
                editingCell={editingCell}
                savingEdit={savingEdit}
                handleCellDoubleClick={handleCellDoubleClick}
                handleEditInputChange={handleEditInputChange}
                handleEditInputBlur={handleEditInputBlur}
                handleEditInputKeyDown={handleEditInputKeyDown}
                onDelete={handleDeleteRow}
              />
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MainPage; 