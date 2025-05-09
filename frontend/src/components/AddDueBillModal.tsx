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
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div className="form-control">
            <label className="label"><span className="label-text">Bill</span>
              <button type="button" className="btn btn-xs btn-link ml-2" onClick={onAddBill}>Add</button>
            </label>
            <select name="bill" value={form.bill} onChange={e => {
              if (e.target.value === '__add__') {
                onAddBill && onAddBill();
              } else {
                onChange(e);
              }
            }} required className="input input-bordered">
              <option value="">Select bill</option>
              {bills.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              <option value="__add__">Add new…</option>
            </select>
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Recurrence</span>
              <button type="button" className="btn btn-xs btn-link ml-2" onClick={onAddRecurrence}>Add</button>
            </label>
            <select name="recurrence" value={form.recurrence} onChange={e => {
              if (e.target.value === '__add__') {
                onAddRecurrence && onAddRecurrence();
              } else {
                onChange(e);
              }
            }} className="input input-bordered">
              <option value="">Select recurrence</option>
              {recurrences?.map?.(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              <option value="__add__">Add new…</option>
            </select>
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Amount Due</span></label>
            <input name="amount_due" value={form.amount_due} onChange={onChange} required type="number" step="0.01" className="input input-bordered" />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Total Balance</span></label>
            <input name="total_balance" value={form.total_balance} onChange={onChange} required type="number" step="0.01" className="input input-bordered" />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Draft Account</span>
              <button type="button" className="btn btn-xs btn-link ml-2" onClick={onAddAccount}>Add</button>
            </label>
            <select name="draft_account" value={form.draft_account} onChange={e => {
              if (e.target.value === '__add__') {
                onAddAccount && onAddAccount();
              } else {
                onChange(e);
              }
            }} className="input input-bordered">
              <option value="">Select account</option>
              {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
              <option value="__add__">Add new…</option>
            </select>
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Due Date</span></label>
            <input name="due_date" value={form.due_date} onChange={onChange} required type="date" className="input input-bordered" />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Pay Date</span></label>
            <input name="pay_date" value={form.pay_date} onChange={onChange} type="date" className="input input-bordered" />
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
          <div className="form-control">
            <label className="label"><span className="label-text">Priority</span></label>
            <input name="priority" value={form.priority} onChange={onChange} type="number" className="input input-bordered" />
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

export default AddDueBillModal; 