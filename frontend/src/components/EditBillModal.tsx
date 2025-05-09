import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface EditBillModalProps {
  show: boolean;
  onClose: () => void;
  token: string;
  bill: any; // Bill type
  accounts: { id: number; name: string; font_color: string }[];
  categories: { id: number; name: string }[];
  recurrences: { id: number; name: string }[];
  onSaved?: () => void;
}

const EditBillModal: React.FC<EditBillModalProps> = ({ show, onClose, token, bill, accounts, categories, recurrences, onSaved }) => {
  const [form, setForm] = useState({
    name: '',
    default_amount_due: '',
    total_balance: '',
    url: '',
    draft_account: '',
    category: '',
    recurrence: '',
    priority: '0',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (bill) {
      setForm({
        name: bill.name || '',
        default_amount_due: bill.default_amount_due?.toString() || '',
        total_balance: bill.total_balance?.toString() || '',
        url: bill.url || '',
        draft_account: bill.draft_account?.toString() || '',
        category: bill.category?.toString() || '',
        recurrence: bill.recurrence?.toString() || '',
        priority: bill.priority?.toString() || '0',
      });
    }
  }, [bill]);

  if (!show) return null;

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);
    if (!form.name || !form.default_amount_due || !form.total_balance) {
      setFormError('Name, Amount Due, and Total Balance are required');
      setFormLoading(false);
      return;
    }
    axios.put(`/api/bills/${bill.id}/`, {
      ...form,
      default_amount_due: parseFloat(form.default_amount_due),
      total_balance: parseFloat(form.total_balance),
      draft_account: form.draft_account ? parseInt(form.draft_account) : null,
      category: form.category ? parseInt(form.category) : null,
      recurrence: form.recurrence ? parseInt(form.recurrence) : null,
      priority: form.priority ? parseInt(form.priority) : 0,
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        setFormLoading(false);
        onClose();
        onSaved && onSaved();
      })
      .catch(() => {
        setFormError('Failed to update bill');
        setFormLoading(false);
      });
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
        <h2 className="font-bold text-xl mb-4">Edit Bill</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Name</span>
            </label>
            <input name="name" value={form.name} onChange={handleFormChange} required className="input input-bordered" />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Amount Due</span>
            </label>
            <input name="default_amount_due" value={form.default_amount_due} onChange={handleFormChange} required type="number" step="0.01" className="input input-bordered" />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Total Balance</span>
            </label>
            <input name="total_balance" value={form.total_balance} onChange={handleFormChange} required type="number" step="0.01" className="input input-bordered" />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">URL</span>
            </label>
            <input name="url" value={form.url} onChange={handleFormChange} className="input input-bordered" />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Draft Account</span>
            </label>
            <select name="draft_account" value={form.draft_account} onChange={handleFormChange} className="input input-bordered">
              <option value="">Select account</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Category</span>
            </label>
            <select name="category" value={form.category} onChange={handleFormChange} className="input input-bordered">
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Recurrence</span>
            </label>
            <select name="recurrence" value={form.recurrence} onChange={handleFormChange} className="input input-bordered">
              <option value="">Select recurrence</option>
              {recurrences.map(rec => (
                <option key={rec.id} value={rec.id}>{rec.name}</option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Priority</span>
            </label>
            <input name="priority" value={form.priority} onChange={handleFormChange} type="number" className="input input-bordered" />
          </div>
          <div className="flex gap-2 mt-2">
            <button type="submit" disabled={formLoading} className="btn btn-primary w-full">Save</button>
          </div>
          {formError && <div className="text-error text-center">{formError}</div>}
        </form>
      </div>
    </div>
  );
};

export default EditBillModal; 