import { useEffect, useState } from 'react';
import axios from 'axios';
import React from 'react';

// Interfaces for the union table
interface DueBill {
  id: number;
  bill: number; // Bill id
  recurrence: number | null;
  amount_due: string;
  draft_account: number | null;
  due_date: string;
  pay_date: string | null;
  status: number | null;
  priority: number;
}

interface BankAccountInstance {
  id: number;
  bank_account: number;
  balance: string;
  due_date: string;
  pay_date: string | null;
  status: number | null;
}

interface BankAccount {
  id: number;
  name: string;
  font_color: string;
}

interface Bill {
  id: number;
  name: string;
  recurrence?: number | null;
  default_amount_due?: string;
}

interface Status {
  id: number;
  name: string;
  highlight_color: string;
}

interface Recurrence {
  id: number;
  name: string;
  calculation?: string;
}

interface MainPageProps {
  token: string;
}

const MainPage = ({ token }: MainPageProps) => {
  const [dueBills, setDueBills] = useState<DueBill[]>([]);
  const [bankInstances, setBankInstances] = useState<BankAccountInstance[]>([]);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [recurrences, setRecurrences] = useState<Recurrence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });
  const [showAddDueBill, setShowAddDueBill] = useState(false);
  const [showAddBankInstance, setShowAddBankInstance] = useState(false);
  const [addDueBillForm, setAddDueBillForm] = useState({
    bill: '',
    recurrence: '',
    amount_due: '',
    draft_account: '',
    due_date: '',
    pay_date: '',
    status: '',
    priority: '0',
  });
  const [addDueBillError, setAddDueBillError] = useState<string | null>(null);
  const [addDueBillLoading, setAddDueBillLoading] = useState(false);
  const [addBankInstanceForm, setAddBankInstanceForm] = useState({
    bank_account: '',
    balance: '',
    due_date: '',
    pay_date: '',
    status: '',
  });
  const [addBankInstanceError, setAddBankInstanceError] = useState<string | null>(null);
  const [addBankInstanceLoading, setAddBankInstanceLoading] = useState(false);

  // Fetch all data
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([
      axios.get('/api/duebills/', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('/api/bankaccountinstances/', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('/api/bankaccounts/', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('/api/bills/', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('/api/statuses/', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('/api/recurrences/', { headers: { Authorization: `Bearer ${token}` } }),
    ])
      .then(([dueBillsRes, bankInstancesRes, accountsRes, billsRes, statusesRes, recurrencesRes]) => {
        setDueBills(dueBillsRes.data);
        setBankInstances(bankInstancesRes.data);
        setAccounts(accountsRes.data);
        setBills(billsRes.data);
        setStatuses(statusesRes.data);
        setRecurrences(recurrencesRes.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch data');
        setLoading(false);
      });
  }, [token]);

  // Filter by date range
  const filterByDate = <T extends { due_date: string }>(items: T[]) => {
    if (!dateRange.start || !dateRange.end) return items;
    return items.filter(item => item.due_date >= dateRange.start && item.due_date <= dateRange.end);
  };

  // Union and sort by due_date, then by priority
  const combinedRows = [
    ...filterByDate(dueBills).map(row => ({
      ...row,
      type: 'DueBill' as const,
      name: bills.find(b => b.id === row.bill)?.name || 'Unknown',
      statusObj: statuses.find(s => s.id === row.status),
      accountObj: accounts.find(a => a.id === row.draft_account),
    })),
    ...filterByDate(bankInstances).map(row => ({
      ...row,
      type: 'BankAccountInstance' as const,
      name: accounts.find(a => a.id === row.bank_account)?.name || 'Unknown',
      statusObj: statuses.find(s => s.id === row.status),
      accountObj: accounts.find(a => a.id === row.bank_account),
    })),
  ].sort((a, b) => {
    if (a.due_date !== b.due_date) return a.due_date.localeCompare(b.due_date);
    return (a.priority ?? 0) - (b.priority ?? 0);
  });

  // Add DueBill handlers
  const handleAddDueBillChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // If the bill is being changed, set defaults for recurrence and amount_due
    if (name === 'bill') {
      const selectedBill = bills.find(b => b.id === parseInt(value));
      setAddDueBillForm(form => ({
        ...form,
        bill: value,
        recurrence: selectedBill?.recurrence ? selectedBill.recurrence.toString() : '',
        amount_due: selectedBill?.default_amount_due ? selectedBill.default_amount_due.toString() : '',
      }));
    } else {
      setAddDueBillForm({ ...addDueBillForm, [name]: value });
    }
  };
  const handleAddDueBill = (e: React.FormEvent) => {
    e.preventDefault();
    setAddDueBillError(null);
    setAddDueBillLoading(true);
    if (!addDueBillForm.bill || !addDueBillForm.amount_due || !addDueBillForm.due_date) {
      setAddDueBillError('Bill, Amount Due, and Due Date are required');
      setAddDueBillLoading(false);
      return;
    }
    axios.post('/api/duebills/', {
      bill: parseInt(addDueBillForm.bill),
      recurrence: addDueBillForm.recurrence ? parseInt(addDueBillForm.recurrence) : null,
      amount_due: parseFloat(addDueBillForm.amount_due),
      draft_account: addDueBillForm.draft_account ? parseInt(addDueBillForm.draft_account) : null,
      due_date: addDueBillForm.due_date,
      pay_date: addDueBillForm.pay_date || null,
      status: addDueBillForm.status ? parseInt(addDueBillForm.status) : null,
      priority: addDueBillForm.priority ? parseInt(addDueBillForm.priority) : 0,
    }, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        setShowAddDueBill(false);
        setAddDueBillForm({ bill: '', recurrence: '', amount_due: '', draft_account: '', due_date: '', pay_date: '', status: '', priority: '0' });
        setAddDueBillLoading(false);
        setLoading(true);
        // Refresh data
        Promise.all([
          axios.get('/api/duebills/', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/bankaccountinstances/', { headers: { Authorization: `Bearer ${token}` } })
        ]).then(([dueBillsRes, bankInstancesRes]) => {
          setDueBills(dueBillsRes.data);
          setBankInstances(bankInstancesRes.data);
          setLoading(false);
        });
      })
      .catch(() => {
        setAddDueBillError('Failed to add due bill');
        setAddDueBillLoading(false);
      });
  };

  // Add BankAccountInstance handlers
  const handleAddBankInstanceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAddBankInstanceForm({ ...addBankInstanceForm, [e.target.name]: e.target.value });
  };
  const handleAddBankInstance = (e: React.FormEvent) => {
    e.preventDefault();
    setAddBankInstanceError(null);
    setAddBankInstanceLoading(true);
    if (!addBankInstanceForm.bank_account || !addBankInstanceForm.balance || !addBankInstanceForm.due_date) {
      setAddBankInstanceError('Bank Account, Balance, and Due Date are required');
      setAddBankInstanceLoading(false);
      return;
    }
    axios.post('/api/bankaccountinstances/', {
      bank_account: parseInt(addBankInstanceForm.bank_account),
      balance: parseFloat(addBankInstanceForm.balance),
      due_date: addBankInstanceForm.due_date,
      pay_date: addBankInstanceForm.pay_date || null,
      status: addBankInstanceForm.status ? parseInt(addBankInstanceForm.status) : null,
    }, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        setShowAddBankInstance(false);
        setAddBankInstanceForm({ bank_account: '', balance: '', due_date: '', pay_date: '', status: '' });
        setAddBankInstanceLoading(false);
        setLoading(true);
        // Refresh data
        Promise.all([
          axios.get('/api/duebills/', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/bankaccountinstances/', { headers: { Authorization: `Bearer ${token}` } })
        ]).then(([dueBillsRes, bankInstancesRes]) => {
          setDueBills(dueBillsRes.data);
          setBankInstances(bankInstancesRes.data);
          setLoading(false);
        });
      })
      .catch(() => {
        setAddBankInstanceError('Failed to add bank account instance');
        setAddBankInstanceLoading(false);
      });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Main Table</h1>
        <div className="flex gap-2 items-center">
          <button className="btn btn-primary" onClick={() => setShowAddDueBill(true)}>Add Due Bill</button>
          <button className="btn btn-secondary" onClick={() => setShowAddBankInstance(true)}>Add Bank Account Instance</button>
          <input
            type="date"
            value={dateRange.start}
            onChange={e => setDateRange(r => ({ ...r, start: e.target.value }))}
            className="input input-bordered"
            placeholder="Start date"
          />
          <input
            type="date"
            value={dateRange.end}
            onChange={e => setDateRange(r => ({ ...r, end: e.target.value }))}
            className="input input-bordered"
            placeholder="End date"
          />
        </div>
      </div>
      {/* Add Due Bill Modal */}
      {showAddDueBill && (
        <div className="modal modal-open z-50" onClick={() => setShowAddDueBill(false)}>
          <div className="modal-box w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setShowAddDueBill(false)}
              aria-label="Close"
            >✕</button>
            <h2 className="font-bold text-xl mb-4">Add Due Bill</h2>
            <form onSubmit={handleAddDueBill} className="flex flex-col gap-3">
              <div className="form-control">
                <label className="label"><span className="label-text">Bill</span></label>
                <select name="bill" value={addDueBillForm.bill} onChange={handleAddDueBillChange} required className="input input-bordered">
                  <option value="">Select bill</option>
                  {bills.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Recurrence</span></label>
                <select name="recurrence" value={addDueBillForm.recurrence} onChange={handleAddDueBillChange} className="input input-bordered">
                  <option value="">Select recurrence</option>
                  {recurrences?.map?.(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Amount Due</span></label>
                <input name="amount_due" value={addDueBillForm.amount_due} onChange={handleAddDueBillChange} required type="number" step="0.01" className="input input-bordered" />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Draft Account</span></label>
                <select name="draft_account" value={addDueBillForm.draft_account} onChange={handleAddDueBillChange} className="input input-bordered">
                  <option value="">Select account</option>
                  {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Due Date</span></label>
                <input name="due_date" value={addDueBillForm.due_date} onChange={handleAddDueBillChange} required type="date" className="input input-bordered" />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Pay Date</span></label>
                <input name="pay_date" value={addDueBillForm.pay_date} onChange={handleAddDueBillChange} type="date" className="input input-bordered" />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Status</span></label>
                <select name="status" value={addDueBillForm.status} onChange={handleAddDueBillChange} className="input input-bordered">
                  <option value="">Select status</option>
                  {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Priority</span></label>
                <input name="priority" value={addDueBillForm.priority} onChange={handleAddDueBillChange} type="number" className="input input-bordered" />
              </div>
              <div className="flex gap-2 mt-2">
                <button type="submit" disabled={addDueBillLoading} className="btn btn-primary w-full">Add</button>
              </div>
              {addDueBillError && <div className="text-error text-center">{addDueBillError}</div>}
            </form>
          </div>
        </div>
      )}
      {/* Add Bank Account Instance Modal */}
      {showAddBankInstance && (
        <div className="modal modal-open z-50" onClick={() => setShowAddBankInstance(false)}>
          <div className="modal-box w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setShowAddBankInstance(false)}
              aria-label="Close"
            >✕</button>
            <h2 className="font-bold text-xl mb-4">Add Bank Account Instance</h2>
            <form onSubmit={handleAddBankInstance} className="flex flex-col gap-3">
              <div className="form-control">
                <label className="label"><span className="label-text">Bank Account</span></label>
                <select name="bank_account" value={addBankInstanceForm.bank_account} onChange={handleAddBankInstanceChange} required className="input input-bordered">
                  <option value="">Select account</option>
                  {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Balance</span></label>
                <input name="balance" value={addBankInstanceForm.balance} onChange={handleAddBankInstanceChange} required type="number" step="0.01" className="input input-bordered" />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Due Date</span></label>
                <input name="due_date" value={addBankInstanceForm.due_date} onChange={handleAddBankInstanceChange} required type="date" className="input input-bordered" />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Pay Date</span></label>
                <input name="pay_date" value={addBankInstanceForm.pay_date} onChange={handleAddBankInstanceChange} type="date" className="input input-bordered" />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Status</span></label>
                <select name="status" value={addBankInstanceForm.status} onChange={handleAddBankInstanceChange} className="input input-bordered">
                  <option value="">Select status</option>
                  {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="flex gap-2 mt-2">
                <button type="submit" disabled={addBankInstanceLoading} className="btn btn-primary w-full">Add</button>
              </div>
              {addBankInstanceError && <div className="text-error text-center">{addBankInstanceError}</div>}
            </form>
          </div>
        </div>
      )}
      {loading && <div className="flex justify-center"><span className="loading loading-spinner loading-lg"></span></div>}
      {error && <div className="alert alert-error mb-4">{error}</div>}
      {!loading && !error && (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Type</th>
                <th>Name</th>
                <th>Amount/Balance</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Account</th>
              </tr>
            </thead>
            <tbody>
              {combinedRows.map(row => (
                <tr
                  key={row.type + '-' + row.id}
                  style={{
                    background: row.statusObj?.highlight_color || undefined,
                    color: row.accountObj?.font_color || undefined,
                  }}
                >
                  <td>{row.type === 'DueBill' ? 'Due Bill' : 'Account Instance'}</td>
                  <td>{row.name}</td>
                  <td>{row.type === 'DueBill' ? row.amount_due : row.balance}</td>
                  <td>{row.due_date}</td>
                  <td>{row.statusObj?.name || '-'}</td>
                  <td>{row.accountObj?.name || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MainPage; 