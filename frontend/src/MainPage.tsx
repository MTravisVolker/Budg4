import { useEffect, useState } from 'react';
import axios from 'axios';

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
}

interface Status {
  id: number;
  name: string;
  highlight_color: string;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });

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
    ])
      .then(([dueBillsRes, bankInstancesRes, accountsRes, billsRes, statusesRes]) => {
        setDueBills(dueBillsRes.data);
        setBankInstances(bankInstancesRes.data);
        setAccounts(accountsRes.data);
        setBills(billsRes.data);
        setStatuses(statusesRes.data);
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Main Table</h1>
        <div className="flex gap-2">
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