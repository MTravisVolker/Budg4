import React, { useState } from 'react';
import axios from 'axios';

interface AddRecurrenceModalProps {
  show: boolean;
  onClose: () => void;
  token: string;
  onAdded?: () => void;
}

const AddRecurrenceModal: React.FC<AddRecurrenceModalProps> = ({ show, onClose, token, onAdded }) => {
  const [form, setForm] = useState({ name: '', interval: '' });
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
    axios.post('/api/recurrences/', form, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        setForm({ name: '', interval: '' });
        setFormLoading(false);
        onClose();
        onAdded && onAdded();
      })
      .catch(() => {
        setFormError('Failed to add recurrence');
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
        <h2 className="font-bold text-xl mb-4">Add Recurrence</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Name</span>
            </label>
            <input name="name" value={form.name} onChange={handleFormChange} required className="input input-bordered" />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Interval</span>
            </label>
            <input name="interval" value={form.interval} onChange={handleFormChange} className="input input-bordered" />
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

export default AddRecurrenceModal; 