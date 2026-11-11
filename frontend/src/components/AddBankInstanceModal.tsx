import React from 'react';
import { BankAccount, Status } from '../types';
import { withInputError, type ApiFieldErrors } from '../utils/apiError';
import FieldHint from './FieldHint';

interface AddBankInstanceModalProps {
  show: boolean;
  onClose: () => void;
  form: {
    bank_account: string;
    balance: string;
    due_date: string;
    pay_date: string;
    status: string;
    priority?: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string | null;
  fieldErrors?: ApiFieldErrors;
  accounts: BankAccount[];
  statuses: Status[];
  onAddAccount?: () => void;
  onAddStatus?: () => void;
}

const AddBankInstanceModal: React.FC<AddBankInstanceModalProps> = ({
  show,
  onClose,
  form,
  onChange,
  onSubmit,
  loading,
  error,
  fieldErrors = {},
  accounts,
  statuses,
  onAddAccount,
  onAddStatus,
}) => {
  if (!show) return null;
  return (
    <div className="modal modal-open z-50" onClick={onClose}>
      <div className="modal-box w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
        <button
          type="button"
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
          aria-label="Close"
        >✕</button>
        <h2 className="font-bold text-xl mb-4">Add Bank Account Instance</h2>
        <form onSubmit={onSubmit} className="flex flex-col gap-3" data-testid="bank-instance-form">
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-control">
            <label className="label" htmlFor="bank-instance-account">
              <span className="label-text">Bank Account</span>
              <button type="button" className="btn btn-xs btn-link ml-2" onClick={onAddAccount} data-testid="add-account-btn">Add</button>
            </label>
            <select id="bank-instance-account" name="bank_account" value={form.bank_account} onChange={e => {
              if (e.target.value === '__add__') {
                onAddAccount && onAddAccount();
              } else {
                onChange(e);
              }
            }} required className={withInputError(fieldErrors, 'bank_account')} data-testid="bank-account-select">
              <option value="">Select account</option>
              {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
              <option value="__add__">Add new…</option>
            </select>
            <FieldHint message={fieldErrors.bank_account} />
          </div>
          <div className="form-control">
            <label className="label" htmlFor="bank-instance-balance">
              <span className="label-text">Balance</span>
            </label>
            <input id="bank-instance-balance" name="balance" value={form.balance} onChange={onChange} required type="number" step="0.01" className={withInputError(fieldErrors, 'balance')} data-testid="balance-input" />
            <FieldHint message={fieldErrors.balance} />
          </div>
          <div className="form-control">
            <label className="label" htmlFor="bank-instance-date">
              <span className="label-text">Date</span>
            </label>
            <input id="bank-instance-date" name="due_date" value={form.due_date} onChange={onChange} required type="date" className={withInputError(fieldErrors, 'due_date')} data-testid="date-input" />
            <FieldHint message={fieldErrors.due_date} />
          </div>
          <div className="form-control">
            <label className="label" htmlFor="bank-instance-status">
              <span className="label-text">Status</span>
              <button type="button" className="btn btn-xs btn-link ml-2" onClick={onAddStatus} data-testid="add-status-btn">Add</button>
            </label>
            <select id="bank-instance-status" name="status" value={form.status} onChange={e => {
              if (e.target.value === '__add__') {
                onAddStatus && onAddStatus();
              } else {
                onChange(e);
              }
            }} className={withInputError(fieldErrors, 'status')} data-testid="status-select">
              <option value="">Select status</option>
              {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              <option value="__add__">Add new…</option>
            </select>
            <FieldHint message={fieldErrors.status} />
          </div>
          <div className="form-control">
            <label className="label" htmlFor="bank-instance-priority">
              <span className="label-text">Priority</span>
            </label>
            <input id="bank-instance-priority" name="priority" value={form.priority === undefined || form.priority === '' ? '0' : form.priority} onChange={onChange} type="number" min="0" step="1" className={withInputError(fieldErrors, 'priority')} data-testid="priority-input" />
            <FieldHint message={fieldErrors.priority} />
          </div>
          <div className="flex gap-2 mt-2">
            <button type="submit" disabled={loading} className="btn btn-primary w-full" data-testid="submit-btn">Add</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBankInstanceModal; 