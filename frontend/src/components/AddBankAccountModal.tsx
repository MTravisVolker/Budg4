import React, { useState } from 'react';
import axios from 'axios';

interface AddBankAccountModalProps {
  show: boolean;
  onClose: () => void;
  token: string;
  onAdded?: () => void;
}

const AddBankAccountModal: React.FC<AddBankAccountModalProps> = ({ show, onClose, token, onAdded }) => {
  const [form, setForm] = useState({ name: '', font_color: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  if (!show) return null;

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);
    axios.post('/api/bankaccounts/', form, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        setForm({ name: '', font_color: '' });
        setFormLoading(false);
        onClose();
        onAdded && onAdded();
      })
      .catch(() => {
        setFormError('Failed to add bank account');
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
        <h2 className="font-bold text-xl mb-4">Add Bank Account</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="form-control">
            <label className="label" htmlFor="bank-account-name">
              <span className="label-text">Name</span>
            </label>
            <input id="bank-account-name" name="name" value={form.name} onChange={handleFormChange} required className="input input-bordered" />
          </div>
          <div className="form-control">
            <label className="label" htmlFor="bank-account-font-color-text">
              <span className="label-text">Font Color</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                id="bank-account-font-color"
                name="font_color"
                type="color"
                value={form.font_color || '#000000'}
                onChange={handleFormChange}
                className="input input-bordered w-12 h-12 p-0 border-none bg-transparent"
                style={{ minWidth: '3rem' }}
                aria-label="Font Color Picker"
              />
              <input
                id="bank-account-font-color-text"
                name="font_color"
                type="text"
                value={form.font_color}
                onChange={handleFormChange}
                placeholder="#000000"
                className="input input-bordered w-32"
                maxLength={20}
                aria-label="Font Color Text"
              />
            </div>
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

export default AddBankAccountModal; 