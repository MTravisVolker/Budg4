import { useEffect, useState } from 'react';
import axios from 'axios';
import { parseApiError, withInputError, type ApiFieldErrors } from './utils/apiError';
import { useToast } from './components/ToastProvider';
import FieldHint from './components/FieldHint';

// Categories management page for Budg SPA

interface Category {
  id: number;
  name: string;
}

interface CategoriesPageProps {
  token: string;
}

const CategoriesPage = ({ token }: CategoriesPageProps) => {
  const showToast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [formFieldErrors, setFormFieldErrors] = useState<ApiFieldErrors>({});
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    axios.get('/api/categories/', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setCategories(res.data);
        setLoading(false);
      })
      .catch((error) => {
        setError(parseApiError(error).message);
        setLoading(false);
      });
  }, [token]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormFieldErrors(errors => ({ ...errors, [e.target.name]: '' }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormFieldErrors({});
    setFormLoading(true);
    const req = editCategory
      ? axios.put(`/api/categories/${editCategory.id}/`, form, { headers: { Authorization: `Bearer ${token}` } })
      : axios.post('/api/categories/', form, { headers: { Authorization: `Bearer ${token}` } });
    req.then(() => {
      setShowModal(false);
      setEditCategory(null);
      setForm({ name: '' });
      setFormLoading(false);
      setLoading(true);
      setError(null);
      axios.get('/api/categories/', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          setCategories(res.data);
          setLoading(false);
        })
        .catch((error) => {
          setError(parseApiError(error).message);
          setLoading(false);
        });
    })
      .catch((error) => {
        const parsed = parseApiError(error);
        setFormFieldErrors(parsed.fieldErrors);
        if (parsed.message) setFormError(parsed.message);
        setFormLoading(false);
      });
  };
  const handleEdit = (category: Category) => {
    setEditCategory(category);
    setForm({ name: category.name });
    setShowModal(true);
  };
  const handleDelete = (id: number) => {
    if (!window.confirm('Delete this category?')) return;
    setLoading(true);
    axios.delete(`/api/categories/${id}/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        setCategories(categories.filter(c => c.id !== id));
        setLoading(false);
      })
      .catch((error) => {
        const { message } = parseApiError(error);
        if (message) showToast(message);
        setLoading(false);
      });
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold">Categories</h2>
        <button className="btn btn-primary btn-sm" onClick={() => { setShowModal(true); setEditCategory(null); setForm({ name: '' }); }}>Add Category</button>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="alert alert-error mb-2">{error}</div>}
      {!loading && !error && (
        <div className="overflow-x-auto rounded-lg shadow mb-2">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(category => (
                <tr key={category.id}>
                  <td>{category.name}</td>
                  <td>
                    <button className="btn btn-xs btn-outline btn-info mr-2" onClick={() => handleEdit(category)}>Edit</button>
                    <button className="btn btn-xs btn-outline btn-error" onClick={() => handleDelete(category.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Category Modal */}
      {showModal && (
        <div className="modal modal-open z-50" onClick={() => setShowModal(false)}>
          <div className="modal-box w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >✕</button>
            <h2 className="font-bold text-xl mb-4">{editCategory ? 'Edit Category' : 'Add Category'}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input name="name" value={form.name} onChange={handleFormChange} required className={withInputError(formFieldErrors, 'name')} />
                <FieldHint message={formFieldErrors.name} />
              </div>
              <div className="flex gap-2 mt-2">
                <button type="submit" disabled={formLoading} className="btn btn-primary w-full">{editCategory ? 'Save' : 'Add'}</button>
              </div>
              {formError && <div className="text-error text-center">{formError}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage; 