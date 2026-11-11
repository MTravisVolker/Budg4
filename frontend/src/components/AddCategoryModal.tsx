import React, { useState } from 'react';
import axios from 'axios';
import { parseApiError, withInputError, type ApiFieldErrors } from '../utils/apiError';
import FieldHint from './FieldHint';

interface AddCategoryModalProps {
  show: boolean;
  onClose: () => void;
  token: string;
  onAdded?: () => void;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ show, onClose, token, onAdded }) => {
  const [form, setForm] = useState({ name: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ApiFieldErrors>({});
  const [formLoading, setFormLoading] = useState(false);

  if (!show) return null;

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors(errors => ({ ...errors, [e.target.name]: '' }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setFormLoading(true);
    axios.post('/api/categories/', form, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        setForm({ name: '' });
        setFormLoading(false);
        onClose();
        onAdded && onAdded();
      })
      .catch((error) => {
        const parsed = parseApiError(error);
        setFieldErrors(parsed.fieldErrors);
        if (parsed.message) setFormError(parsed.message);
        setFormLoading(false);
      });
  };

  return (
    <div className="modal modal-open z-50" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-box w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
        <button
          type="button"
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
          aria-label="Close"
        >✕</button>
        <h2 id="modal-title" className="font-bold text-xl mb-4">Add Category</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="form-control">
            <label className="label" htmlFor="category-name">
              <span className="label-text">Name</span>
            </label>
            <input id="category-name" name="name" value={form.name} onChange={handleFormChange} required className={withInputError(fieldErrors, 'name')} />
            <FieldHint message={fieldErrors.name} />
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

export default AddCategoryModal; 