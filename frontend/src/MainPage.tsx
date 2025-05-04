import React, { useState, useRef } from 'react';
import useMainPageData from './hooks/useMainPageData';
import useEditableCell from './hooks/useEditableCell';
import MainTableBody from './components/MainTableBody';
import useAddDueBillModal from './hooks/useAddDueBillModal';
import useAddBankInstanceModal from './hooks/useAddBankInstanceModal';
import useModal from './hooks/useModal';
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

// Custom hook for modal + pending field + form ref
function useModalWithPendingField<TField extends string, TForm>(initialPending: null | TField = null) {
  const [pendingField, setPendingField] = useState<null | TField>(initialPending);
  const formRef = useRef<TForm | null>(null);
  return { pendingField, setPendingField, formRef };
}

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
  const {
    showAddDueBill,
    setShowAddDueBill,
    addDueBillForm,
    setAddDueBillForm,
    addDueBillError,
    addDueBillLoading,
    handleAddDueBillChange,
    handleAddDueBill,
  } = useAddDueBillModal(token, bills, refresh);

  const {
    showAddBankInstance,
    setShowAddBankInstance,
    addBankInstanceForm,
    addBankInstanceError,
    addBankInstanceLoading,
    handleAddBankInstanceChange,
    handleAddBankInstance,
  } = useAddBankInstanceModal(token, refresh);

  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [showAddBillModal, openAddBillModal, closeAddBillModal] = useModal();
  const [showAddAccountModal, openAddAccountModal, closeAddAccountModal] = useModal();
  const [showAddStatusModal, openAddStatusModal, closeAddStatusModal] = useModal();
  const [showAddRecurrenceModal, openAddRecurrenceModal, closeAddRecurrenceModal] = useModal();
  const [showAddCategoryModal, openAddCategoryModal, closeAddCategoryModal] = useModal();

  // Replace old state for AddDueBillModal
  const dueBillModalHelpers = useModalWithPendingField<'bill' | 'recurrence' | 'account' | 'status', AddDueBillForm>(null);
  // Replace old state for AddBillModal
  const billModalHelpers = useModalWithPendingField<'account' | 'category' | 'recurrence', AddBillForm>(null);

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

  // Helper to open the correct modal and close AddDueBillModal
  const handleAddNewFromDueBill = (field: 'bill' | 'recurrence' | 'account' | 'status') => {
    dueBillModalHelpers.formRef.current = { ...addDueBillForm };
    dueBillModalHelpers.setPendingField(field);
    setShowAddDueBill(false);
    if (field === 'bill') openAddBillModal();
    if (field === 'recurrence') openAddRecurrenceModal();
    if (field === 'account') openAddAccountModal();
    if (field === 'status') openAddStatusModal();
  };

  // After adding, re-open AddDueBillModal and pre-select new item
  const handleAddedNewItem = () => {
    // Refresh data first
    refresh();
    setTimeout(() => {
      const newForm = dueBillModalHelpers.formRef.current ? { ...dueBillModalHelpers.formRef.current } : { ...addDueBillForm };
      if (dueBillModalHelpers.pendingField === 'bill' && bills.length > 0) {
        const maxId = Math.max(...bills.map(b => b.id));
        newForm.bill = maxId.toString();
        // Optionally auto-fill recurrence/amount_due from new bill
        const newBill = bills.find(b => b.id === maxId);
        if (newBill) {
          newForm.recurrence = newBill.recurrence ? newBill.recurrence.toString() : '';
          newForm.amount_due = newBill.default_amount_due ? newBill.default_amount_due.toString() : '';
        }
      }
      if (dueBillModalHelpers.pendingField === 'recurrence' && recurrences.length > 0) {
        const maxId = Math.max(...recurrences.map(r => r.id));
        newForm.recurrence = maxId.toString();
      }
      if (dueBillModalHelpers.pendingField === 'account' && accounts.length > 0) {
        const maxId = Math.max(...accounts.map(a => a.id));
        newForm.draft_account = maxId.toString();
      }
      if (dueBillModalHelpers.pendingField === 'status' && statuses.length > 0) {
        const maxId = Math.max(...statuses.map(s => s.id));
        newForm.status = maxId.toString();
      }
      setAddDueBillForm(newForm);
      setShowAddDueBill(true);
      dueBillModalHelpers.setPendingField(null);
      dueBillModalHelpers.formRef.current = null;
    }, 200); // Wait for refresh
  };

  // After adding, re-open AddDueBillModal and pre-select new item
  const handleAddedNewItemForBill = () => {
    refresh();
    setTimeout(() => {
      let newForm = { name: '', default_amount_due: '', url: '', draft_account: '', category: '', recurrence: '', priority: '0' };
      if (billModalHelpers.formRef.current) newForm = { ...billModalHelpers.formRef.current };
      if (billModalHelpers.pendingField === 'account' && accounts.length > 0) {
        const maxId = Math.max(...accounts.map(a => a.id));
        newForm.draft_account = maxId.toString();
      }
      if (billModalHelpers.pendingField === 'category' && categories.length > 0) {
        const maxId = Math.max(...categories.map(c => c.id));
        newForm.category = maxId.toString();
      }
      if (billModalHelpers.pendingField === 'recurrence' && recurrences.length > 0) {
        const maxId = Math.max(...recurrences.map(r => r.id));
        newForm.recurrence = maxId.toString();
      }
      openAddBillModal();
      billModalHelpers.setPendingField(null);
      billModalHelpers.formRef.current = null;
    }, 200);
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
      {/* Modals */}
      <RenderAddDueBillModal
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
        onAddBill={() => handleAddNewFromDueBill('bill')}
        onAddRecurrence={() => handleAddNewFromDueBill('recurrence')}
        onAddAccount={() => handleAddNewFromDueBill('account')}
        onAddStatus={() => handleAddNewFromDueBill('status')}
      />
      <RenderAddBankInstanceModal
        show={showAddBankInstance}
        onClose={() => setShowAddBankInstance(false)}
        onSubmit={handleAddBankInstance}
        onChange={handleAddBankInstanceChange}
        form={addBankInstanceForm}
        error={addBankInstanceError}
        loading={addBankInstanceLoading}
        accounts={accounts}
        statuses={statuses}
        onAddAccount={openAddAccountModal}
        onAddStatus={openAddStatusModal}
      />
      <RenderAddBillModal
        show={showAddBillModal}
        onClose={closeAddBillModal}
        token={token}
        accounts={accounts}
        categories={categories}
        recurrences={recurrences}
        onAdded={refresh}
        onAddAccount={() => {
          billModalHelpers.formRef.current = null;
          billModalHelpers.setPendingField('account');
          closeAddBillModal();
          openAddAccountModal();
        }}
        onAddCategory={() => {
          billModalHelpers.formRef.current = null;
          billModalHelpers.setPendingField('category');
          closeAddBillModal();
          openAddCategoryModal();
        }}
        onAddRecurrence={() => {
          billModalHelpers.formRef.current = null;
          billModalHelpers.setPendingField('recurrence');
          closeAddBillModal();
          openAddRecurrenceModal();
        }}
      />
      <RenderAddBankAccountModal
        show={showAddAccountModal}
        onClose={closeAddAccountModal}
        token={token}
        onAdded={() => {
          closeAddAccountModal();
          handleAddedNewItemForBill();
        }}
      />
      <RenderAddStatusModal
        show={showAddStatusModal}
        onClose={closeAddStatusModal}
        token={token}
        onAdded={() => {
          closeAddStatusModal();
          handleAddedNewItem();
        }}
      />
      <RenderAddRecurrenceModal
        show={showAddRecurrenceModal}
        onClose={closeAddRecurrenceModal}
        token={token}
        onAdded={() => {
          closeAddRecurrenceModal();
          handleAddedNewItemForBill();
        }}
      />
      <RenderAddCategoryModal
        show={showAddCategoryModal}
        onClose={closeAddCategoryModal}
        token={token}
        onAdded={() => {
          closeAddCategoryModal();
          handleAddedNewItemForBill();
        }}
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
                onAddBill={openAddBillModal}
                onAddAccount={openAddAccountModal}
                onAddStatus={openAddStatusModal}
              />
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MainPage; 