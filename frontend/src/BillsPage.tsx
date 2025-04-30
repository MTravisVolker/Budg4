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

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
              </tr>
            </thead>
            <tbody>
              {bills.map(bill => (
                <tr key={bill.id}>
                  <td>{bill.name}</td>
                  <td>{bill.default_amount_due}</td>
                  <td>{bill.url ? <a href={bill.url} target="_blank" rel="noopener noreferrer" className="link link-primary">{bill.url}</a> : '-'}</td>
                  <td>{bill.draft_account ?? '-'}</td>
                  <td>{bill.category ?? '-'}</td>
                  <td>{bill.recurrence ?? '-'}</td>
                  <td>{bill.priority}</td>
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
                  <span className="label-text">Draft Account ID</span>
                </label>
                <input name="draft_account" value={addForm.draft_account} onChange={handleAddChange} type="number" className="input input-bordered" />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Category ID</span>
                </label>
                <input name="category" value={addForm.category} onChange={handleAddChange} type="number" className="input input-bordered" />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Recurrence ID</span>
                </label>
                <input name="recurrence" value={addForm.recurrence} onChange={handleAddChange} type="number" className="input input-bordered" />
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
    </div>
  );
};

export default BillsPage; 