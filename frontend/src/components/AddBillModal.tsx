import React, { useState } from 'react';
import axios from 'axios';

interface AddBillModalProps {
  show: boolean;
  onClose: () => void;
  token: string;
  accounts: { id: number; name: string; font_color: string }[];
  categories: { id: number; name: string }[];
  recurrences: { id: number; name: string }[];
  onAdded?: () => void;
  onAddAccount?: () => void;
  onAddCategory?: () => void;
  onAddRecurrence?: () => void;
}

const AddBillModal: React.FC<AddBillModalProps> = ({ show, onClose, token, accounts, categories, recurrences, onAdded, onAddAccount, onAddCategory, onAddRecurrence }) => {
  const [form, setForm] = useState({
    name: '',
    default_amount_due: '',
    url: '',
    draft_account: '',
    category: '',
    recurrence: '',
    priority: '0',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  if (!show) return null;

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);
    if (!form.name || !form.default_amount_due) {
      setFormError('Name and Amount Due are required');
      setFormLoading(false);
      return;
    }
    axios.post('/api/bills/', {
      ...form,
      default_amount_due: parseFloat(form.default_amount_due),
      draft_account: form.draft_account ? parseInt(form.draft_account) : null,
      category: form.category ? parseInt(form.category) : null,
      recurrence: form.recurrence ? parseInt(form.recurrence) : null,
      priority: form.priority ? parseInt(form.priority) : 0,
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        setForm({
          name: '',
          default_amount_due: '',
          url: '',
          draft_account: '',
          category: '',
          recurrence: '',
          priority: '0',
        });
        setFormLoading(false);
        onClose();
        if (onAdded) onAdded();
      })
      .catch(() => {
        setFormError('Failed to add bill');
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
        <h2 className="font-bold text-xl mb-4">Add Bill</h2>
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
              <span className="label-text">URL</span>
            </label>
            <input name="url" value={form.url} onChange={handleFormChange} className="input input-bordered" />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Draft Account</span>
              <button type="button" className="btn btn-xs btn-link ml-2" onClick={onAddAccount}>Add</button>
            </label>
            <select name="draft_account" value={form.draft_account} onChange={e => {
              if (e.target.value === '__add__') {
                if (onAddAccount) onAddAccount();
                setForm({ ...form, draft_account: '' });
              } else {
                handleFormChange(e);
              }
            }} className="input input-bordered">
              <option value="">Select account</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
              <option value="__add__">Add new…</option>
            </select>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Category</span>
              <button type="button" className="btn btn-xs btn-link ml-2" onClick={onAddCategory}>Add</button>
            </label>
            <select name="category" value={form.category} onChange={e => {
              if (e.target.value === '__add__') {
                if (onAddCategory) onAddCategory();
                setForm({ ...form, category: '' });
              } else {
                handleFormChange(e);
              }
            }} className="input input-bordered">
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
              <option value="__add__">Add new…</option>
            </select>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Recurrence</span>
              <button type="button" className="btn btn-xs btn-link ml-2" onClick={onAddRecurrence}>Add</button>
            </label>
            <select name="recurrence" value={form.recurrence} onChange={e => {
              if (e.target.value === '__add__') {
                if (onAddRecurrence) onAddRecurrence();
                setForm({ ...form, recurrence: '' });
              } else {
                handleFormChange(e);
              }
            }} className="input input-bordered">
              <option value="">Select recurrence</option>
              {recurrences.map(rec => (
                <option key={rec.id} value={rec.id}>{rec.name}</option>
              ))}
              <option value="__add__">Add new…</option>
            </select>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Priority</span>
            </label>
            <input name="priority" value={form.priority} onChange={handleFormChange} type="number" className="input input-bordered" />
          </div>
          <div className="flex gap-2 mt-2">
            <button type="submit" disabled={formLoading} className="btn btn-primary w-full">Add</button>
          </div>
          {formError && <div className="text-error text-center">{formError}</div>}
        </form>
      </div>
    </div>
  );
};

export default AddBillModal; 