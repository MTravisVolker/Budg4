import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.withCredentials = true; // Enable sending cookies if needed

interface EditBillModalProps {
  show: boolean;
  onClose: () => void;
  token: string;
  bill: {
    id: number;
    name: string;
    default_amount_due?: number;
    total_balance?: number;
    url?: string;
    draft_account?: number;
    category?: number;
    recurrence?: number;
    priority?: number;
  };
  accounts: { id: number; name: string; font_color: string }[];
  categories: { id: number; name: string }[];
  recurrences: { id: number; name: string }[];
  onSaved?: () => void;
}

const MAX_URL_LENGTH = 2083;

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
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
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
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setFieldErrors(errors => ({ ...errors, [name]: '' })); // Clear field error on change
    if (name === 'url' && value.length > MAX_URL_LENGTH) {
      setFieldErrors(errors => ({ ...errors, url: `URL must be no more than ${MAX_URL_LENGTH} characters` }));
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);
    const errors: { [key: string]: string } = {};
    if (!form.name) errors.name = 'Name is required';
    if (!form.default_amount_due) errors.default_amount_due = 'Amount Due is required';
    if (!form.total_balance) errors.total_balance = 'Total Balance is required';
    if (form.url && form.url.length > MAX_URL_LENGTH) errors.url = `URL must be no more than ${MAX_URL_LENGTH} characters`;
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormLoading(false);
      return;
    }
    setFieldErrors({});
    axios.put(`/api/bills/${bill.id}/`, {
      ...form,
      default_amount_due: parseFloat(form.default_amount_due),
      total_balance: parseFloat(form.total_balance),
      draft_account: form.draft_account ? parseInt(form.draft_account) : null,
      category: form.category ? parseInt(form.category) : null,
      recurrence: form.recurrence ? parseInt(form.recurrence) : null,
      priority: form.priority ? parseInt(form.priority) : 0,
    }, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })
      .then(() => {
        setFormLoading(false);
        onClose();
        if (onSaved) onSaved();
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.detail || 
          (typeof error.response?.data === 'object' ? 
            Object.values(error.response.data).flat().join(', ') : 
            'Failed to update bill');
        setFormError(errorMessage);
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
          {formError && <div className="alert alert-error my-2" role="alert">{formError}</div>}
          <div className="form-control">
            <label className="label" htmlFor="bill-name">
              <span>Name</span>
            </label>
            <input
              type="text"
              id="bill-name"
              name="name"
              className="input input-bordered"
              value={form.name}
              onChange={handleFormChange}
              required
              aria-invalid={!!fieldErrors.name}
              aria-describedby={fieldErrors.name ? 'bill-name-error' : undefined}
              data-testid="name-input"
            />
            {fieldErrors.name && <span id="bill-name-error" className="text-error text-sm mt-1" data-testid="name-error">{fieldErrors.name}</span>}
          </div>
          <div className="form-control">
            <label className="label" htmlFor="bill-amount-due">
              <span>Amount Due</span>
            </label>
            <input
              type="number"
              id="bill-amount-due"
              name="default_amount_due"
              className="input input-bordered"
              value={form.default_amount_due}
              onChange={handleFormChange}
              step="0.01"
              required
              aria-invalid={!!fieldErrors.default_amount_due}
              aria-describedby={fieldErrors.default_amount_due ? 'bill-amount-due-error' : undefined}
              data-testid="amount-due-input"
            />
            {fieldErrors.default_amount_due && <span id="bill-amount-due-error" className="text-error text-sm mt-1" data-testid="amount-due-error">{fieldErrors.default_amount_due}</span>}
          </div>
          <div className="form-control">
            <label className="label" htmlFor="bill-total-balance">
              <span>Total Balance</span>
            </label>
            <input
              type="number"
              id="bill-total-balance"
              name="total_balance"
              className="input input-bordered"
              value={form.total_balance}
              onChange={handleFormChange}
              step="0.01"
              required
              aria-invalid={!!fieldErrors.total_balance}
              aria-describedby={fieldErrors.total_balance ? 'bill-total-balance-error' : undefined}
              data-testid="total-balance-input"
            />
            {fieldErrors.total_balance && <span id="bill-total-balance-error" className="text-error text-sm mt-1" data-testid="total-balance-error">{fieldErrors.total_balance}</span>}
          </div>
          <div className="form-control">
            <label className="label" htmlFor="bill-url">
              <span>URL</span>
              <span className="label-text-alt">{form.url.length} / 2083</span>
            </label>
            <input
              type="text"
              id="bill-url"
              name="url"
              className="input input-bordered"
              value={form.url}
              onChange={handleFormChange}
              maxLength={2083}
              aria-invalid={!!fieldErrors.url}
              aria-describedby={fieldErrors.url ? 'bill-url-error' : undefined}
              data-testid="url-input"
            />
            {fieldErrors.url && <span id="bill-url-error" className="text-error text-sm mt-1" data-testid="url-error">{fieldErrors.url}</span>}
          </div>
          <div className="form-control">
            <label className="label" htmlFor="bill-draft-account">
              <span>Draft Account</span>
            </label>
            <select
              id="bill-draft-account"
              name="draft_account"
              className="input input-bordered"
              value={form.draft_account}
              onChange={handleFormChange}
              data-testid="draft-account-select"
            >
              <option value="">Select account</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label className="label" htmlFor="bill-category">
              <span>Category</span>
            </label>
            <select
              id="bill-category"
              name="category"
              className="input input-bordered"
              value={form.category}
              onChange={handleFormChange}
              data-testid="category-select"
            >
              <option value="">Select category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label className="label" htmlFor="bill-recurrence">
              <span>Recurrence</span>
            </label>
            <select
              id="bill-recurrence"
              name="recurrence"
              className="input input-bordered"
              value={form.recurrence}
              onChange={handleFormChange}
              data-testid="recurrence-select"
            >
              <option value="">Select recurrence</option>
              {recurrences.map(recurrence => (
                <option key={recurrence.id} value={recurrence.id}>
                  {recurrence.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label className="label" htmlFor="bill-priority">
              <span>Priority</span>
            </label>
            <select
              id="bill-priority"
              name="priority"
              className="input input-bordered"
              value={form.priority}
              onChange={handleFormChange}
              data-testid="priority-select"
            >
              <option value="0">Low</option>
              <option value="1">Medium</option>
              <option value="2">High</option>
            </select>
          </div>
          <div className="modal-action">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={formLoading}
              data-testid="submit-button"
              aria-busy={formLoading}
            >
              {formLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBillModal; 