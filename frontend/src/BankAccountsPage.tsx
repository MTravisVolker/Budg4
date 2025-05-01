import { useEffect, useState } from 'react';
import axios from 'axios';

// Bank Accounts management page for Budg SPA

interface BankAccount {
  id: number;
  name: string;
  font_color: string;
}

interface BankAccountsPageProps {
  token: string;
}

const BankAccountsPage = ({ token }: BankAccountsPageProps) => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editAccount, setEditAccount] = useState<BankAccount | null>(null);
  const [form, setForm] = useState({ name: '', font_color: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    axios.get('/api/bankaccounts/', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setAccounts(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch bank accounts');
        setLoading(false);
      });
  }, [token]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);
    const req = editAccount
      ? axios.put(`/api/bankaccounts/${editAccount.id}/`, form, { headers: { Authorization: `Bearer ${token}` } })
      : axios.post('/api/bankaccounts/', form, { headers: { Authorization: `Bearer ${token}` } });
    req.then(() => {
      setShowModal(false);
      setEditAccount(null);
      setForm({ name: '', font_color: '' });
      setFormLoading(false);
      setLoading(true);
      axios.get('/api/bankaccounts/', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          setAccounts(res.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    })
      .catch(() => {
        setFormError('Failed to save bank account');
        setFormLoading(false);
      });
  };
  const handleEdit = (account: BankAccount) => {
    setEditAccount(account);
    setForm({ name: account.name, font_color: account.font_color });
    setShowModal(true);
  };
  const handleDelete = (id: number) => {
    if (!window.confirm('Delete this bank account?')) return;
    setLoading(true);
    axios.delete(`/api/bankaccounts/${id}/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        setAccounts(accounts.filter(a => a.id !== id));
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to delete bank account');
        setLoading(false);
      });
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold">Bank Accounts</h2>
        <button className="btn btn-primary btn-sm" onClick={() => { setShowModal(true); setEditAccount(null); setForm({ name: '', font_color: '' }); }}>Add Bank Account</button>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="alert alert-error mb-2">{error}</div>}
      {!loading && !error && (
        <div className="overflow-x-auto rounded-lg shadow mb-2">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th className="font-bold">Name</th>
                <th className="font-bold">Font Color</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map(account => (
                <tr key={account.id}>
                  <td style={{ color: account.font_color || '#000000', fontWeight: 'bold' }}>{account.name}</td>
                  <td>
                    <span style={{ background: account.font_color || '#000000', padding: '0.2em 0.8em', borderRadius: '4px', color: '#fff', fontWeight: 'bold' }}>{account.font_color}</span>
                  </td>
                  <td>
                    <button className="btn btn-xs btn-outline btn-info mr-2" onClick={() => handleEdit(account)}>Edit</button>
                    <button className="btn btn-xs btn-outline btn-error" onClick={() => handleDelete(account.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Bank Account Modal */}
      {showModal && (
        <div className="modal modal-open z-50" onClick={() => setShowModal(false)}>
          <div className="modal-box w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >✕</button>
            <h2 className="font-bold text-xl mb-4">{editAccount ? 'Edit Bank Account' : 'Add Bank Account'}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input name="name" value={form.name} onChange={handleFormChange} required className="input input-bordered" />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Font Color</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    name="font_color"
                    type="color"
                    value={form.font_color || '#000000'}
                    onChange={handleFormChange}
                    className="input input-bordered w-12 h-12 p-0 border-none bg-transparent"
                    style={{ minWidth: '3rem' }}
                  />
                  <input
                    name="font_color"
                    type="text"
                    value={form.font_color}
                    onChange={handleFormChange}
                    placeholder="#000000"
                    className="input input-bordered w-32"
                    maxLength={20}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <button type="submit" disabled={formLoading} className="btn btn-primary w-full">{editAccount ? 'Save' : 'Add'}</button>
              </div>
              {formError && <div className="text-error text-center">{formError}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankAccountsPage; 