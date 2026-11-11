import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { DateRange, Range, RangeKeyDict } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import useMainPageData from './hooks/useMainPageData';
import useEditableCell from './hooks/useEditableCell';
import MainTableBody from './components/MainTableBody';
import { editDueBill, editBankAccountInstance, deleteDueBill, deleteBankAccountInstance } from './api/dueBillApi';
import RenderAddDueBillModal from './components/RenderAddDueBillModal';
import RenderAddBankInstanceModal from './components/RenderAddBankInstanceModal';
import RenderAddBillModal from './components/RenderAddBillModal';
import RenderAddBankAccountModal from './components/RenderAddBankAccountModal';
import RenderAddStatusModal from './components/RenderAddStatusModal';
import RenderAddRecurrenceModal from './components/RenderAddRecurrenceModal';
import RenderAddCategoryModal from './components/RenderAddCategoryModal';
import PlanMonthModal from './components/PlanMonthModal';
import { useToast } from './components/ToastProvider';
import { isFinishedDateEntry, parseMoneyOrZero } from './utils/format';
import { parseApiError, type ApiFieldErrors } from './utils/apiError';

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
  total_balance: string;
  draft_account: string;
  due_date: string;
  pay_date: string;
  status: string;
  priority: string;
};

const MainPage = ({ token }: MainPageProps) => {
  // Fetch all main data and provide refresh, loading, error
  const {
    dueBills, bankInstances, accounts, bills, statuses, recurrences, categories, loading, error, refresh, dateRange, setDateRange
  } = useMainPageData(token);
  const showToast = useToast();

  // Local state for add modals and forms
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [dateRangeState, setDateRangeState] = useState<Range[]>([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);
  const [showAddDueBillModal, setShowAddDueBillModal] = useState(false);
  const [showAddBankInstanceModal, setShowAddBankInstanceModal] = useState(false);
  const [showAddBillModal, setShowAddBillModal] = useState(false);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showAddStatusModal, setShowAddStatusModal] = useState(false);
  const [showAddRecurrenceModal, setShowAddRecurrenceModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showPlanMonthModal, setShowPlanMonthModal] = useState(false);

  // Modal stack for navigation and restoration
  const setModalStack: React.Dispatch<React.SetStateAction<Array<{ modal: string; form: unknown; pendingField: string | null }>>> = useState<Array<{ modal: string; form: unknown; pendingField: string | null }>>([])[1];

  // Form states for each modal
  const [addDueBillForm, setAddDueBillForm] = useState<AddDueBillForm>({
    bill: '', recurrence: '', amount_due: '', total_balance: '0.00', draft_account: '', due_date: '', pay_date: '', status: '', priority: '0',
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
  const [addDueBillError, setAddDueBillError] = useState<string | null>(null);
  const [addDueBillFieldErrors, setAddDueBillFieldErrors] = useState<ApiFieldErrors>({});
  const [addDueBillLoading, setAddDueBillLoading] = useState(false);
  const [addBankInstanceError, setAddBankInstanceError] = useState<string | null>(null);
  const [addBankInstanceFieldErrors, setAddBankInstanceFieldErrors] = useState<ApiFieldErrors>({});
  const [addBankInstanceLoading, setAddBankInstanceLoading] = useState(false);

  const dateRangeRef = useRef<HTMLDivElement>(null);

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateRangeRef.current && !dateRangeRef.current.contains(event.target as Node)) {
        setShowDateRangePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Format date for display
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

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
    } catch (error) {
      const { message } = parseApiError(error);
      if (message) showToast(message);
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
    if (modal === 'AddDueBill') {
      setShowAddDueBillModal(false);
      setAddDueBillError(null);
      setAddDueBillFieldErrors({});
    }
    if (modal === 'AddBill') setShowAddBillModal(false);
    if (modal === 'AddBankAccount') setShowAddAccountModal(false);
    if (modal === 'AddStatus') setShowAddStatusModal(false);
    if (modal === 'AddRecurrence') setShowAddRecurrenceModal(false);
    if (modal === 'AddCategory') setShowAddCategoryModal(false);
    if (modal === 'AddBankInstance') {
      setShowAddBankInstanceModal(false);
      setAddBankInstanceError(null);
      setAddBankInstanceFieldErrors({});
    }
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
        draft_account: selectedBill?.draft_account ? selectedBill.draft_account.toString() : '',
        priority: selectedBill?.priority ? selectedBill.priority.toString() : '0',
      }));
    } else if (name === 'due_date') {
      setAddDueBillForm(form => ({
        ...form,
        due_date: value,
        pay_date: form.pay_date.trim() === '' && isFinishedDateEntry(value) ? value : form.pay_date,
      }));
    } else {
      setAddDueBillForm(form => ({ ...form, [name]: value }));
    }
  };

  const handleAddDueBill = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddDueBillError(null);
    setAddDueBillFieldErrors({});
    const clientErrors: ApiFieldErrors = {};
    if (!addDueBillForm.bill) clientErrors.bill = 'Bill is required';
    if (!addDueBillForm.amount_due) clientErrors.amount_due = 'Amount Due is required';
    if (!addDueBillForm.due_date) clientErrors.due_date = 'Due Date is required';
    const priorityValue = addDueBillForm.priority ? parseInt(addDueBillForm.priority) : 0;
    if (priorityValue < 1) clientErrors.priority = 'Priority must be at least 1';
    if (Object.keys(clientErrors).length > 0) {
      setAddDueBillFieldErrors(clientErrors);
      setAddDueBillError('Please fix the errors in the form');
      return;
    }
    setAddDueBillLoading(true);
    try {
      const { addDueBill } = await import('./api/dueBillApi');
      await addDueBill({
        bill: parseInt(addDueBillForm.bill),
        recurrence: addDueBillForm.recurrence ? parseInt(addDueBillForm.recurrence) : null,
        amount_due: parseFloat(addDueBillForm.amount_due),
        total_balance: parseMoneyOrZero(addDueBillForm.total_balance),
        draft_account: addDueBillForm.draft_account ? parseInt(addDueBillForm.draft_account) : null,
        due_date: addDueBillForm.due_date,
        pay_date: addDueBillForm.pay_date || null,
        status: addDueBillForm.status ? parseInt(addDueBillForm.status) : null,
        priority: priorityValue,
      }, token);
      
      setShowAddDueBillModal(false);
      setAddDueBillForm({ bill: '', recurrence: '', amount_due: '', total_balance: '0.00', draft_account: '', due_date: '', pay_date: '', status: '', priority: '0' });
      await refresh();
    } catch (error) {
      const parsed = parseApiError(error);
      setAddDueBillFieldErrors(parsed.fieldErrors);
      if (parsed.message) setAddDueBillError(parsed.message);
    } finally {
      setAddDueBillLoading(false);
    }
  };

  // AddBankInstance handlers
  const handleAddBankInstanceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.target.name === 'due_date') {
      setAddBankInstanceForm(form => ({ ...form, due_date: e.target.value, pay_date: e.target.value }));
    } else {
      setAddBankInstanceForm(form => ({ ...form, [e.target.name]: e.target.value }));
    }
  };

  const handleAddBankInstance = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddBankInstanceError(null);
    setAddBankInstanceFieldErrors({});
    const clientErrors: ApiFieldErrors = {};
    if (!addBankInstanceForm.bank_account) clientErrors.bank_account = 'Bank Account is required';
    if (!addBankInstanceForm.balance) clientErrors.balance = 'Balance is required';
    if (!addBankInstanceForm.due_date) clientErrors.due_date = 'Due Date is required';
    if (Object.keys(clientErrors).length > 0) {
      setAddBankInstanceFieldErrors(clientErrors);
      setAddBankInstanceError('Please fix the errors in the form');
      return;
    }
    setAddBankInstanceLoading(true);
    try {
      const { addBankAccountInstance } = await import('./api/dueBillApi');
      await addBankAccountInstance({
        bank_account: parseInt(addBankInstanceForm.bank_account),
        balance: parseFloat(addBankInstanceForm.balance),
        due_date: addBankInstanceForm.due_date,
        pay_date: addBankInstanceForm.pay_date || null,
        status: addBankInstanceForm.status ? parseInt(addBankInstanceForm.status) : null,
        priority: (() => {
          const val = parseInt(addBankInstanceForm.priority, 10);
          return isNaN(val) ? 0 : val;
        })(),
      }, token);
      
      setShowAddBankInstanceModal(false);
      setAddBankInstanceForm({ bank_account: '', balance: '', due_date: '', pay_date: '', status: '', priority: '0' });
      await refresh();
    } catch (error) {
      const parsed = parseApiError(error);
      setAddBankInstanceFieldErrors(parsed.fieldErrors);
      if (parsed.message) setAddBankInstanceError(parsed.message);
    } finally {
      setAddBankInstanceLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Main Table</h1>
        <div className="flex gap-2 items-center">
          <button className="btn btn-accent" onClick={() => setShowPlanMonthModal(true)}>Plan next month</button>
          <button className="btn btn-primary" onClick={() => setShowAddDueBillModal(true)}>Add Due Bill</button>
          <button className="btn btn-secondary" onClick={() => setShowAddBankInstanceModal(true)}>Add Bank Account Instance</button>
          <div className="relative" ref={dateRangeRef}>
            <button 
              className="btn btn-outline min-w-[200px] flex items-center justify-between"
              onClick={() => setShowDateRangePicker(!showDateRangePicker)}
            >
              <span>
                {dateRange.start && dateRange.end 
                  ? `${formatDisplayDate(dateRange.start)} - ${formatDisplayDate(dateRange.end)}`
                  : 'Select Date Range'}
              </span>
              <svg 
                className={`w-4 h-4 transition-transform ${showDateRangePicker ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showDateRangePicker && (
              <div className="absolute right-0 mt-2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg">
                <DateRange
                  onChange={(ranges: RangeKeyDict) => {
                    const selection = ranges.selection;
                    setDateRangeState([selection]);
                    if (selection.startDate && selection.endDate) {
                      setDateRange({
                        start: selection.startDate.toISOString().split('T')[0],
                        end: selection.endDate.toISOString().split('T')[0]
                      });
                      // Close the picker when both dates are selected
                      setShowDateRangePicker(false);
                    }
                  }}
                  moveRangeOnFirstSelection={false}
                  months={2}
                  ranges={dateRangeState}
                  direction="horizontal"
                  preventSnapRefocus={true}
                  calendarFocus="forwards"
                  showDateDisplay={false}
                  showMonthAndYearPickers={true}
                  rangeColors={['#3b82f6']}
                  minDate={new Date(2000, 0, 1)}
                  maxDate={new Date(2100, 11, 31)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <PlanMonthModal
        show={showPlanMonthModal}
        token={token}
        onClose={() => setShowPlanMonthModal(false)}
        onCreated={(range) => {
          setDateRange(range);
          setShowPlanMonthModal(false);
          refresh();
        }}
      />
      {/* Modals */}
      <RenderAddDueBillModal
        show={showAddDueBillModal}
        onClose={() => closeModal('AddDueBill')}
        onSubmit={handleAddDueBill}
        onChange={handleAddDueBillChange}
        form={addDueBillForm}
        error={addDueBillError}
        fieldErrors={addDueBillFieldErrors}
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
        fieldErrors={addBankInstanceFieldErrors}
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
      {error && <div className="alert alert-error mb-4">{error}</div>}
      {loading && <div className="flex justify-center"><span className="loading loading-spinner loading-lg"></span></div>}
      {!loading && (
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
                <th className="text-right">Payment</th>
                <th className="text-right">Total Balance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <MainTableBody
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
                onAddBill={() => handleAddNewFromModal('AddBill', 'bill', addBillForm)}
                onAddAccount={() => handleAddNewFromModal('AddBankAccount', 'account', addBankInstanceForm)}
                onAddStatus={() => handleAddNewFromModal('AddStatus', 'status', addBankInstanceForm)}
              />
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MainPage; 