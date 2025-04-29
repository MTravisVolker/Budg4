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
  const [loginError, setLoginError] = useState<string | null>(null);
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
    axios.post('/api/token/', { username, password })
      .then(res => {
        localStorage.setItem('token', res.data.access);
        setToken(res.data.access);
      })
      .catch(() => {
        setLoginError('Invalid username or password');
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
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
      <div className="App">
        <h1>Budg - Login</h1>
        <form onSubmit={handleLogin} style={{ maxWidth: 300, margin: '0 auto' }}>
          <div>
            <label>Username:</label>
            <input value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div>
            <label>Password:</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit">Login</button>
          {loginError && <p style={{ color: 'red' }}>{loginError}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="App">
      <h1>Budg - Bills Table</h1>
      <button onClick={handleLogout} style={{ float: 'right' }}>Logout</button>
      <button onClick={() => setShowAddModal(true)} style={{ marginBottom: 16 }}>Add Bill</button>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <table>
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
                <td><a href={bill.url} target="_blank" rel="noopener noreferrer">{bill.url}</a></td>
                <td>{bill.draft_account}</td>
                <td>{bill.category}</td>
                <td>{bill.recurrence}</td>
                <td>{bill.priority}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ background: 'white', padding: 24, borderRadius: 8, minWidth: 300 }}>
            <h2>Add Bill</h2>
            <form onSubmit={handleAddBill}>
              <div>
                <label>Name:</label>
                <input name="name" value={addForm.name} onChange={handleAddChange} required />
              </div>
              <div>
                <label>Amount Due:</label>
                <input name="default_amount_due" value={addForm.default_amount_due} onChange={handleAddChange} required type="number" step="0.01" />
              </div>
              <div>
                <label>URL:</label>
                <input name="url" value={addForm.url} onChange={handleAddChange} />
              </div>
              <div>
                <label>Draft Account ID:</label>
                <input name="draft_account" value={addForm.draft_account} onChange={handleAddChange} type="number" />
              </div>
              <div>
                <label>Category ID:</label>
                <input name="category" value={addForm.category} onChange={handleAddChange} type="number" />
              </div>
              <div>
                <label>Recurrence ID:</label>
                <input name="recurrence" value={addForm.recurrence} onChange={handleAddChange} type="number" />
              </div>
              <div>
                <label>Priority:</label>
                <input name="priority" value={addForm.priority} onChange={handleAddChange} type="number" />
              </div>
              <button type="submit" disabled={addLoading}>Add</button>
              <button type="button" onClick={() => setShowAddModal(false)} style={{ marginLeft: 8 }}>Cancel</button>
              {addError && <p style={{ color: 'red' }}>{addError}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
