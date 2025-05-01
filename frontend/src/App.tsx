import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import BillsPage from './BillsPage';
import StatusesPage from './StatusesPage';
import RecurrencesPage from './RecurrencesPage';
import CategoriesPage from './CategoriesPage';
import BankAccountsPage from './BankAccountsPage';
import MainPage from './MainPage';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem('refreshToken'));
  const [loginError, setLoginError] = useState<string | null>(null);
  const [authMessage] = useState<string | null>(sessionStorage.getItem('authMessage'));

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
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            setToken(null);
            setRefreshToken(null);
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
    <BrowserRouter>
      <div className="min-h-screen bg-base-200 p-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Budg</h1>
            <button onClick={handleLogout} className="btn btn-outline btn-error">Logout</button>
          </div>
          {/* Tab Navigation */}
          <div className="tabs mb-8">
            <NavLink to="/" className={({ isActive }: { isActive: boolean }) => isActive ? 'tab tab-active' : 'tab'}>Main</NavLink>
            <NavLink to="/bills" className={({ isActive }: { isActive: boolean }) => isActive ? 'tab tab-active' : 'tab'}>Bills</NavLink>
            <NavLink to="/statuses" className={({ isActive }: { isActive: boolean }) => isActive ? 'tab tab-active' : 'tab'}>Statuses</NavLink>
            <NavLink to="/bankaccounts" className={({ isActive }: { isActive: boolean }) => isActive ? 'tab tab-active' : 'tab'}>Bank Accounts</NavLink>
            <NavLink to="/categories" className={({ isActive }: { isActive: boolean }) => isActive ? 'tab tab-active' : 'tab'}>Categories</NavLink>
            <NavLink to="/recurrences" className={({ isActive }: { isActive: boolean }) => isActive ? 'tab tab-active' : 'tab'}>Recurrences</NavLink>
          </div>
          <Routes>
            <Route path="/" element={<MainPage token={token} />} />
            <Route path="/bills" element={<BillsPage token={token} />} />
            <Route path="/statuses" element={<StatusesPage token={token} />} />
            <Route path="/bankaccounts" element={<BankAccountsPage token={token} />} />
            <Route path="/categories" element={<CategoriesPage token={token} />} />
            <Route path="/recurrences" element={<RecurrencesPage token={token} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
