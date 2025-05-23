import React from 'react';
import { Bill, Recurrence, BankAccount, Status } from '../types';

interface AddDueBillModalProps {
  show: boolean;
  onClose: () => void;
  form: {
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
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string | null;
  bills: Bill[];
  recurrences: Recurrence[];
  accounts: BankAccount[];
  statuses: Status[];
  onAddBill?: () => void;
  onAddRecurrence?: () => void;
  onAddAccount?: () => void;
  onAddStatus?: () => void;
}

const AddDueBillModal: React.FC<AddDueBillModalProps> = ({
  show,
  onClose,
  form,
  onChange,
  onSubmit,
  loading,
  error,
  bills,
  recurrences,
  accounts,
  statuses,
  onAddBill,
  onAddRecurrence,
  onAddAccount,
  onAddStatus,
}) => {
  if (!show) return null;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle special __add__ value for select fields
    if (value === '__add__') {
      switch (name) {
        case 'bill':
          onAddBill?.();
          break;
        case 'recurrence':
          onAddRecurrence?.();
          break;
        case 'draft_account':
          onAddAccount?.();
          break;
        case 'status':
          onAddStatus?.();
          break;
      }
      return;
    }
    
    onChange(e);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.bill || !form.amount_due || !form.due_date) {
      return;
    }
    try {
      await onSubmit(e);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const isFormValid = () => {
    return Boolean(form.bill && form.amount_due && form.due_date);
  };

  const handleButtonClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isFormValid()) {
      await handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="modal modal-open z-50" onClick={onClose}>
      <div className="modal-box w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
        <button
          type="button"
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
          aria-label="Close"
        >✕</button>
        <h2 className="font-bold text-xl mb-4">Add Due Bill</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3" data-testid="due-bill-form">
          <div className="form-control">
            <label className="label" htmlFor="due-bill-bill">
              <span className="label-text">Bill</span>
              <button type="button" className="btn btn-xs btn-link ml-2" onClick={onAddBill} data-testid="add-bill-btn">Add</button>
            </label>
            <select id="due-bill-bill" name="bill" value={form.bill} onChange={handleChange} required className="input input-bordered" data-testid="bill-select">
              <option value="">Select bill</option>
              {bills.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              <option value="__add__">Add new…</option>
            </select>
          </div>
          <div className="form-control">
            <label className="label" htmlFor="due-bill-recurrence">
              <span className="label-text">Recurrence</span>
              <button type="button" className="btn btn-xs btn-link ml-2" onClick={onAddRecurrence} data-testid="add-recurrence-btn">Add</button>
            </label>
            <select id="due-bill-recurrence" name="recurrence" value={form.recurrence} onChange={handleChange} className="input input-bordered" data-testid="recurrence-select">
              <option value="">Select recurrence</option>
              {recurrences?.map?.(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              <option value="__add__">Add new…</option>
            </select>
          </div>
          <div className="form-control">
            <label className="label" htmlFor="due-bill-amount">
              <span className="label-text">Amount Due</span>
            </label>
            <input id="due-bill-amount" name="amount_due" value={form.amount_due} onChange={handleChange} required type="number" step="0.01" className="input input-bordered" data-testid="amount-input" />
          </div>
          <div className="form-control">
            <label className="label" htmlFor="due-bill-total-balance">
              <span className="label-text">Total Balance</span>
            </label>
            <input id="due-bill-total-balance" name="total_balance" value={form.total_balance || 0} onChange={handleChange} required type="number" step="0.01" className="input input-bordered" data-testid="total-balance-input" />
          </div>
          <div className="form-control">
            <label className="label" htmlFor="due-bill-draft-account">
              <span className="label-text">Draft Account</span>
              <button type="button" className="btn btn-xs btn-link ml-2" onClick={onAddAccount} data-testid="add-account-btn">Add</button>
            </label>
            <select id="due-bill-draft-account" name="draft_account" value={form.draft_account} onChange={handleChange} className="input input-bordered" data-testid="draft-account-select">
              <option value="">Select account</option>
              {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
              <option value="__add__">Add new…</option>
            </select>
          </div>
          <div className="form-control">
            <label className="label" htmlFor="due-bill-due-date">
              <span className="label-text">Due Date</span>
            </label>
            <input id="due-bill-due-date" name="due_date" value={form.due_date} onChange={handleChange} required type="date" className="input input-bordered" data-testid="due-date-input" />
          </div>
          <div className="form-control">
            <label className="label" htmlFor="due-bill-pay-date">
              <span className="label-text">Pay Date</span>
            </label>
            <input id="due-bill-pay-date" name="pay_date" value={form.pay_date} onChange={handleChange} type="date" className="input input-bordered" data-testid="pay-date-input" />
          </div>
          <div className="form-control">
            <label className="label" htmlFor="due-bill-status">
              <span className="label-text">Status</span>
              <button type="button" className="btn btn-xs btn-link ml-2" onClick={onAddStatus} data-testid="add-status-btn">Add</button>
            </label>
            <select id="due-bill-status" name="status" value={form.status} onChange={handleChange} className="input input-bordered" data-testid="status-select">
              <option value="">Select status</option>
              {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              <option value="__add__">Add new…</option>
            </select>
          </div>
          <div className="form-control">
            <label className="label" htmlFor="due-bill-priority">
              <span className="label-text">Priority</span>
            </label>
            <input id="due-bill-priority" name="priority" value={form.priority} onChange={handleChange} type="number" min="0" step="1" className="input input-bordered" data-testid="priority-input" />
          </div>
          <div className="flex gap-2 mt-2">
            <button 
              type="submit" 
              disabled={loading || !isFormValid()} 
              className="btn btn-primary w-full" 
              data-testid="submit-btn"
              onClick={handleButtonClick}
            >
              Add
            </button>
          </div>
          {error && <div className="text-error text-center" data-testid="error-message">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default AddDueBillModal; 