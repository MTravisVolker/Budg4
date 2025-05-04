import React from 'react';
import { BankAccount, Status } from '../types';

interface AddBankInstanceModalProps {
  show: boolean;
  onClose: () => void;
  form: {
    bank_account: string;
    balance: string;
    due_date: string;
    pay_date: string;
    status: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string | null;
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
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div className="form-control">
            <label className="label"><span className="label-text">Bank Account</span>
              <button type="button" className="btn btn-xs btn-link ml-2" onClick={onAddAccount}>Add</button>
            </label>
            <select name="bank_account" value={form.bank_account} onChange={e => {
              if (e.target.value === '__add__') {
                onAddAccount && onAddAccount();
              } else {
                onChange(e);
              }
            }} required className="input input-bordered">
              <option value="">Select account</option>
              {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
              <option value="__add__">Add new…</option>
            </select>
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Balance</span></label>
            <input name="balance" value={form.balance} onChange={onChange} required type="number" step="0.01" className="input input-bordered" />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Date</span></label>
            <input name="due_date" value={form.due_date} onChange={onChange} required type="date" className="input input-bordered" />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Status</span>
              <button type="button" className="btn btn-xs btn-link ml-2" onClick={onAddStatus}>Add</button>
            </label>
            <select name="status" value={form.status} onChange={e => {
              if (e.target.value === '__add__') {
                onAddStatus && onAddStatus();
              } else {
                onChange(e);
              }
            }} className="input input-bordered">
              <option value="">Select status</option>
              {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              <option value="__add__">Add new…</option>
            </select>
          </div>
          <div className="flex gap-2 mt-2">
            <button type="submit" disabled={loading} className="btn btn-primary w-full">Add</button>
          </div>
          {error && <div className="text-error text-center">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default AddBankInstanceModal; 