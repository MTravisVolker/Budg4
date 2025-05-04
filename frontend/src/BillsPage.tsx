import { useEffect, useState } from 'react';
import axios from 'axios';

// Bills management page for Budg SPA

interface Bill {
  id: number;
  name: string;
  default_amount_due: string;
  url: string;
  draft_account: number;
  category: number;
  recurrence: number;
  priority: number;
}

interface BankAccount { id: number; name: string; font_color: string; }
interface Category { id: number; name: string; }
interface Recurrence { id: number; name: string; calculation?: string; }

interface BillsPageProps {
  token: string;
}

const BillsPage = ({ token }: BillsPageProps) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    default_amount_due: '',
    url: '',
    draft_account: '',
    category: '',
    recurrence: '',
    priority: '0',
  });
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [editBill, setEditBill] = useState<Bill | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    default_amount_due: '',
    url: '',
    draft_account: '',
    category: '',
    recurrence: '',
    priority: '0',
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recurrences, setRecurrences] = useState<Recurrence[]>([]);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddRecurrenceModal, setShowAddRecurrenceModal] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    axios.get('/api/bills/', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setBills(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch bills');
        setLoading(false);
      });
  }, [token]);

  useEffect(() => {
    if (!token) return;
    axios.get('/api/bankaccounts/', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setAccounts(res.data))
      .catch(() => setAccounts([]));
    axios.get('/api/categories/', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setCategories(res.data))
      .catch(() => setCategories([]));
    axios.get('/api/recurrences/', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setRecurrences(res.data))
      .catch(() => setRecurrences([]));
  }, [token]);

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value });
  };

  const handleAddBill = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setAddLoading(true);
    if (!addForm.name || !addForm.default_amount_due) {
      setAddError('Name and Amount Due are required');
      setAddLoading(false);
      return;
    }
    axios.post('/api/bills/', {
      ...addForm,
      default_amount_due: parseFloat(addForm.default_amount_due),
      draft_account: addForm.draft_account ? parseInt(addForm.draft_account) : null,
      category: addForm.category ? parseInt(addForm.category) : null,
      recurrence: addForm.recurrence ? parseInt(addForm.recurrence) : null,
      priority: addForm.priority ? parseInt(addForm.priority) : 0,
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        setShowAddModal(false);
        setAddForm({
          name: '',
          default_amount_due: '',
          url: '',
          draft_account: '',
          category: '',
          recurrence: '',
          priority: '0',
        });
        setLoading(true);
        axios.get('/api/bills/', {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(res => {
            setBills(res.data);
            setLoading(false);
          })
          .catch(() => setLoading(false));
      })
      .catch(() => {
        setAddError('Failed to add bill');
        setAddLoading(false);
      });
  };

  const handleEditClick = (bill: Bill) => {
    setEditBill(bill);
    setEditForm({
      name: bill.name,
      default_amount_due: bill.default_amount_due.toString(),
      url: bill.url || '',
      draft_account: bill.draft_account?.toString() || '',
      category: bill.category?.toString() || '',
      recurrence: bill.recurrence?.toString() || '',
      priority: bill.priority?.toString() || '0',
    });
    setShowEditModal(true);
    setEditError(null);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBill) return;
    setEditError(null);
    setEditLoading(true);
    if (!editForm.name || !editForm.default_amount_due) {
      setEditError('Name and Amount Due are required');
      setEditLoading(false);
      return;
    }
    axios.put(`/api/bills/${editBill.id}/`, {
      ...editForm,
      default_amount_due: parseFloat(editForm.default_amount_due),
      draft_account: editForm.draft_account ? parseInt(editForm.draft_account) : null,
      category: editForm.category ? parseInt(editForm.category) : null,
      recurrence: editForm.recurrence ? parseInt(editForm.recurrence) : null,
      priority: editForm.priority ? parseInt(editForm.priority) : 0,
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        setShowEditModal(false);
        setEditBill(null);
        setEditLoading(false);
        setLoading(true);
        axios.get('/api/bills/', { headers: { Authorization: `Bearer ${token}` } })
          .then(res => {
            setBills(res.data);
            setLoading(false);
          })
          .catch(() => setLoading(false));
      })
      .catch(() => {
        setEditError('Failed to update bill');
        setEditLoading(false);
      });
  };

  const handleDeleteBill = (id: number) => {
    if (!window.confirm('Delete this bill?')) return;
    setLoading(true);
    axios.delete(`/api/bills/${id}/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        setBills(bills.filter(b => b.id !== id));
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to delete bill');
        setLoading(false);
      });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Bills Table</h1>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary">Add Bill</button>
      </div>
      {loading && <div className="flex justify-center"><span className="loading loading-spinner loading-lg"></span></div>}
      {error && <div className="alert alert-error mb-4">{error}</div>}
      {!loading && !error && (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Amount Due</th>
                <th>URL</th>
                <th>Draft Account</th>
                <th>Category</th>
                <th>Recurrence</th>
                <th>Priority</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.map(bill => (
                <tr key={bill.id}>
                  <td>{bill.name}</td>
                  <td>{bill.default_amount_due}</td>
                  <td>{bill.url ? <a href={bill.url} target="_blank" rel="noopener noreferrer" className="link link-primary">{bill.url}</a> : '-'}</td>
                  <td>{accounts.find(acc => acc.id === bill.draft_account)
                    ? <span style={{ color: accounts.find(acc => acc.id === bill.draft_account)?.font_color || undefined, fontWeight: 'bold' }}>
                        {accounts.find(acc => acc.id === bill.draft_account)?.name}
                      </span>
                    : '-'}</td>
                  <td>{categories.find(cat => cat.id === bill.category)?.name ?? '-'}</td>
                  <td>{recurrences.find(rec => rec.id === bill.recurrence)?.name ?? '-'}</td>
                  <td>{bill.priority}</td>
                  <td>
                    <button className="btn btn-xs btn-outline btn-info mr-2" onClick={() => handleEditClick(bill)}>Edit</button>
                    <button className="btn btn-xs btn-outline btn-error" onClick={() => handleDeleteBill(bill.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showAddModal && (
        <div className="modal modal-open z-50" onClick={() => setShowAddModal(false)}>
          <div className="modal-box w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setShowAddModal(false)}
              aria-label="Close"
            >
              ✕
            </button>
            <h2 className="font-bold text-xl mb-4">Add Bill</h2>
            <form onSubmit={handleAddBill} className="flex flex-col gap-3">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input name="name" value={addForm.name} onChange={handleAddChange} required className="input input-bordered" />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Amount Due</span>
                </label>
                <input name="default_amount_due" value={addForm.default_amount_due} onChange={handleAddChange} required type="number" step="0.01" className="input input-bordered" />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">URL</span>
                </label>
                <input name="url" value={addForm.url} onChange={handleAddChange} className="input input-bordered" />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Draft Account</span>
                  <button type="button" className="btn btn-xs btn-link ml-2" onClick={() => setShowAddAccountModal(true)}>Add</button>
                </label>
                <select name="draft_account" value={addForm.draft_account} onChange={e => {
                  if (e.target.value === '__add__') {
                    setShowAddAccountModal(true);
                    setAddForm({ ...addForm, draft_account: '' });
                  } else {
                    handleAddChange(e);
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
                  <button type="button" className="btn btn-xs btn-link ml-2" onClick={() => setShowAddCategoryModal(true)}>Add</button>
                </label>
                <select name="category" value={addForm.category} onChange={e => {
                  if (e.target.value === '__add__') {
                    setShowAddCategoryModal(true);
                    setAddForm({ ...addForm, category: '' });
                  } else {
                    handleAddChange(e);
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
                  <button type="button" className="btn btn-xs btn-link ml-2" onClick={() => setShowAddRecurrenceModal(true)}>Add</button>
                </label>
                <select name="recurrence" value={addForm.recurrence} onChange={e => {
                  if (e.target.value === '__add__') {
                    setShowAddRecurrenceModal(true);
                    setAddForm({ ...addForm, recurrence: '' });
                  } else {
                    handleAddChange(e);
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
                <input name="priority" value={addForm.priority} onChange={handleAddChange} type="number" className="input input-bordered" />
              </div>
              <div className="flex gap-2 mt-2">
                <button type="submit" disabled={addLoading} className="btn btn-primary w-full">Add</button>
              </div>
              {addError && <div className="text-error text-center">{addError}</div>}
            </form>
          </div>
        </div>
      )}
      {showEditModal && (
        <div className="modal modal-open z-50" onClick={() => setShowEditModal(false)}>
          <div className="modal-box w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setShowEditModal(false)}
              aria-label="Close"
            >
              ✕
            </button>
            <h2 className="font-bold text-xl mb-4">Edit Bill</h2>
            <form onSubmit={handleEditBill} className="flex flex-col gap-3">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input name="name" value={editForm.name} onChange={handleEditChange} required className="input input-bordered" />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Amount Due</span>
                </label>
                <input name="default_amount_due" value={editForm.default_amount_due} onChange={handleEditChange} required type="number" step="0.01" className="input input-bordered" />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">URL</span>
                </label>
                <input name="url" value={editForm.url} onChange={handleEditChange} className="input input-bordered" />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Draft Account</span>
                </label>
                <select name="draft_account" value={editForm.draft_account} onChange={handleEditChange} className="input input-bordered">
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
                <select name="category" value={editForm.category} onChange={handleEditChange} className="input input-bordered">
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
                <select name="recurrence" value={editForm.recurrence} onChange={handleEditChange} className="input input-bordered">
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
                <input name="priority" value={editForm.priority} onChange={handleEditChange} type="number" className="input input-bordered" />
              </div>
              <div className="flex gap-2 mt-2">
                <button type="submit" disabled={editLoading} className="btn btn-primary w-full">Save</button>
              </div>
              {editError && <div className="text-error text-center">{editError}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillsPage; 