import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

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

function App() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem('refreshToken'));
  const [loginError, setLoginError] = useState<string | null>(null);
  const [authMessage] = useState<string | null>(sessionStorage.getItem('authMessage'));
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

  // Axios interceptor for silent refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;
        if (
          error.response &&
          error.response.status === 401 &&
          !originalRequest._retry &&
          refreshToken
        ) {
          originalRequest._retry = true;
          try {
            const res = await axios.post('/api/token/refresh/', { refresh: refreshToken });
            localStorage.setItem('token', res.data.access);
            setToken(res.data.access);
            originalRequest.headers['Authorization'] = `Bearer ${res.data.access}`;
            return axios(originalRequest);
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            setToken(null);
            setRefreshToken(null);
            setBills([]);
            sessionStorage.setItem('authMessage', 'Your session has expired. Please log in again.');
            window.location.reload();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [refreshToken]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    axios.get('/api/bills/', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        console.log('API Success:', res);
        setBills(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('API Error:', err);
        setError('Failed to fetch bills');
        setLoading(false);
      });
  }, [token]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    sessionStorage.removeItem('authMessage');
    axios.post('/api/token/', { username, password })
      .then(res => {
        localStorage.setItem('token', res.data.access);
        localStorage.setItem('refreshToken', res.data.refresh);
        setToken(res.data.access);
        setRefreshToken(res.data.refresh);
      })
      .catch(() => {
        setLoginError('Invalid username or password');
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setRefreshToken(null);
    setBills([]);
  };

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value });
  };

  const handleAddBill = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setAddLoading(true);
    // Minimal validation
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
        // Refresh bills
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

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="card w-full max-w-md shadow-xl bg-base-100">
          <div className="card-body">
            <h1 className="card-title text-3xl mb-4 justify-center">Budg - Login</h1>
            {authMessage && (
              <div className="alert alert-warning mb-2 p-2 text-center">{authMessage}</div>
            )}
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Username</span>
                </label>
                <input className="input input-bordered" value={username} onChange={e => setUsername(e.target.value)} required />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <input className="input input-bordered" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary">Login</button>
              {loginError && <div className="text-error text-center">{loginError}</div>}
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Budg - Bills Table</h1>
          <div className="flex gap-2">
            <button onClick={handleLogout} className="btn btn-outline btn-error">Logout</button>
            <button onClick={() => setShowAddModal(true)} className="btn btn-primary">Add Bill</button>
          </div>
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
        {/* Add Bill Modal */}
        {showAddModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="modal-box w-full max-w-lg">
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
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn w-full">Cancel</button>
                </div>
                {addError && <div className="text-error text-center">{addError}</div>}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
