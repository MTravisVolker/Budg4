import React, { useState } from 'react';
import axios from 'axios';

const MAX_URL_LENGTH = 2083;

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
    total_balance: '0',
    url: '',
    draft_account: '',
    category: '',
    recurrence: '',
    priority: '0',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  if (!show) return null;

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.target.value === '__add__') {
      switch (e.target.name) {
        case 'draft_account':
          onAddAccount && onAddAccount();
          setForm({ ...form, draft_account: '' });
          break;
        case 'category':
          onAddCategory && onAddCategory();
          setForm({ ...form, category: '' });
          break;
        case 'recurrence':
          onAddRecurrence && onAddRecurrence();
          setForm({ ...form, recurrence: '' });
          break;
      }
    } else {
      const { name, value } = e.target;
      setForm({ ...form, [name]: value });
      if (name === 'url' && value.length > MAX_URL_LENGTH) {
        setFieldErrors(errors => ({ ...errors, url: `URL must be no more than ${MAX_URL_LENGTH} characters` }));
      } else {
        setFieldErrors(errors => ({ ...errors, [name]: '' })); // Clear field error on change
      }
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
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
      setFormError('Please fix the errors in the form');
      return;
    }
    setFieldErrors({});
    try {
      await axios.post('/api/bills/', {
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
      });
      setFormLoading(false);
      onClose();
      if (onAdded) onAdded();
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 
        (typeof error.response?.data === 'object' ? 
          Object.values(error.response.data).flat().join(', ') : 
          'Failed to create bill');
      setFormError(errorMessage);
      setFormLoading(false);
    }
  };

  return (
    <div className={`modal ${show ? 'modal-open' : ''} z-50`} onClick={onClose}>
      <div className="modal-box w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
        <button
          type="button"
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
          aria-label="Close"
        >✕</button>
        <h2 className="font-bold text-xl mb-4">Add Bill</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3" data-testid="bill-form">
          {formError && (
            <div className="alert alert-error" data-testid="error-message">
              <span>{
                Object.values(fieldErrors).length > 0
                  ? Object.values(fieldErrors).join(' ')
                  : formError
              }</span>
            </div>
          )}
          <div className="form-control">
            <label className="label" htmlFor="new-bill-name">
              <span className="label-text">Name</span>
            </label>
            <input
              type="text"
              id="new-bill-name"
              name="name"
              value={form.name}
              onChange={handleFormChange}
              className={`input input-bordered ${fieldErrors.name ? 'input-error' : ''}`}
              required
              data-testid="name-input"
            />
            {fieldErrors.name && (
              <span className="text-error text-sm mt-1">{fieldErrors.name}</span>
            )}
          </div>
          <div className="form-control">
            <label className="label" htmlFor="new-bill-amount-due">
              <span className="label-text">Amount Due</span>
            </label>
            <input
              type="number"
              id="new-bill-amount-due"
              name="default_amount_due"
              value={form.default_amount_due}
              onChange={handleFormChange}
              className={`input input-bordered ${fieldErrors.default_amount_due ? 'input-error' : ''}`}
              step="0.01"
              required
              data-testid="amount-input"
            />
            {fieldErrors.default_amount_due && (
              <span className="text-error text-sm mt-1">{fieldErrors.default_amount_due}</span>
            )}
          </div>
          <div className="form-control">
            <label className="label" htmlFor="new-bill-total-balance">
              <span className="label-text">Total Balance</span>
            </label>
            <input
              type="number"
              id="new-bill-total-balance"
              name="total_balance"
              value={form.total_balance}
              onChange={handleFormChange}
              className={`input input-bordered ${fieldErrors.total_balance ? 'input-error' : ''}`}
              step="0.01"
              required
              data-testid="total-balance-input"
            />
            {fieldErrors.total_balance && (
              <span className="text-error text-sm mt-1">{fieldErrors.total_balance}</span>
            )}
          </div>
          <div className="form-control">
            <label className="label" htmlFor="new-bill-url">
              <span className="label-text">URL</span>
              <span className="label-text-alt">{form.url.length} / {MAX_URL_LENGTH}</span>
            </label>
            <input
              type="url"
              id="new-bill-url"
              name="url"
              value={form.url}
              onChange={handleFormChange}
              className={`input input-bordered ${fieldErrors.url ? 'input-error' : ''}`}
              maxLength={MAX_URL_LENGTH}
              data-testid="url-input"
            />
            {fieldErrors.url && (
              <span className="text-error text-sm mt-1" data-testid="url-error">{fieldErrors.url}</span>
            )}
          </div>
          <div className="form-control">
            <label className="label" htmlFor="new-bill-draft-account">
              <span className="label-text">Draft Account</span>
              <button
                type="button"
                className="btn btn-xs btn-link ml-2"
                onClick={() => onAddAccount && onAddAccount()}
                data-testid="add-account-btn"
              >
                Add
              </button>
            </label>
            <select
              id="new-bill-draft-account"
              name="draft_account"
              value={form.draft_account}
              onChange={handleFormChange}
              className="input input-bordered"
              data-testid="draft-account-select"
            >
              <option value="">Select account</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
              <option value="__add__">Add new…</option>
            </select>
          </div>
          <div className="form-control">
            <label className="label" htmlFor="new-bill-category">
              <span className="label-text">Category</span>
              <button
                type="button"
                className="btn btn-xs btn-link ml-2"
                onClick={() => onAddCategory && onAddCategory()}
                data-testid="add-category-btn"
              >
                Add
              </button>
            </label>
            <select
              id="new-bill-category"
              name="category"
              value={form.category}
              onChange={handleFormChange}
              className="input input-bordered"
              data-testid="category-select"
            >
              <option value="">Select category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
              <option value="__add__">Add new…</option>
            </select>
          </div>
          <div className="form-control">
            <label className="label" htmlFor="new-bill-recurrence">
              <span className="label-text">Recurrence</span>
              <button
                type="button"
                className="btn btn-xs btn-link ml-2"
                onClick={() => onAddRecurrence && onAddRecurrence()}
                data-testid="add-recurrence-btn"
              >
                Add
              </button>
            </label>
            <select
              id="new-bill-recurrence"
              name="recurrence"
              value={form.recurrence}
              onChange={handleFormChange}
              className="input input-bordered"
              data-testid="recurrence-select"
            >
              <option value="">Select recurrence</option>
              {recurrences.map(recurrence => (
                <option key={recurrence.id} value={recurrence.id}>
                  {recurrence.name}
                </option>
              ))}
              <option value="__add__">Add new…</option>
            </select>
          </div>
          <div className="form-control">
            <label className="label" htmlFor="new-bill-priority">
              <span className="label-text">Priority</span>
            </label>
            <input
              type="number"
              id="new-bill-priority"
              name="priority"
              value={form.priority}
              onChange={handleFormChange}
              className="input input-bordered"
              min="0"
              step="1"
              data-testid="priority-input"
            />
          </div>
          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={formLoading}
              data-testid="submit-btn"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBillModal; 