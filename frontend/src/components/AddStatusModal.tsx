import React, { useState } from 'react';
import axios from 'axios';

interface AddStatusModalProps {
  show: boolean;
  onClose: () => void;
  token: string;
  onAdded?: () => void;
}

const AddStatusModal: React.FC<AddStatusModalProps> = ({ show, onClose, token, onAdded }) => {
  const [form, setForm] = useState({ name: '', highlight_color: '' });
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
    axios.post('/api/statuses/', form, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        setForm({ name: '', highlight_color: '' });
        setFormLoading(false);
        onClose();
        onAdded && onAdded();
      })
      .catch(() => {
        setFormError('Failed to add status');
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
        <h2 className="font-bold text-xl mb-4">Add Status</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="form-control">
            <label className="label" htmlFor="status-name">
              <span className="label-text">Name</span>
            </label>
            <input id="status-name" name="name" value={form.name} onChange={handleFormChange} required className="input input-bordered" />
          </div>
          <div className="form-control">
            <label className="label" htmlFor="status-color">
              <span className="label-text">Highlight Color</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                id="status-color-picker"
                name="highlight_color"
                type="color"
                value={form.highlight_color || '#000000'}
                onChange={handleFormChange}
                className="input input-bordered w-12 h-12 p-0 border-none bg-transparent"
                style={{ minWidth: '3rem' }}
                aria-label="Color Picker"
              />
              <input
                id="status-color-text"
                name="highlight_color"
                type="text"
                value={form.highlight_color}
                onChange={handleFormChange}
                placeholder="#000000"
                className="input input-bordered w-32"
                maxLength={20}
                aria-label="Highlight Color Text"
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

export default AddStatusModal; 