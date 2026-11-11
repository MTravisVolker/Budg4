import { useEffect, useState } from 'react';
import axios from 'axios';
import { parseApiError } from '../utils/apiError';

interface PlannedBill {
  bill: number;
  name: string;
  amount_due: string;
  total_balance: string;
  draft_account: number | null;
  recurrence: number | null;
  priority: number;
  due_date: string;
  pay_date: string | null;
  status: number | null;
  selected: boolean;
  already_exists: boolean;
  note: string;
}

interface PlannedAccount {
  bank_account: number;
  name: string;
  balance: string;
  due_date: string;
  pay_date: string | null;
  status: number | null;
  selected: boolean;
  already_exists: boolean;
  note: string;
}

interface MonthPlan {
  message: string;
  target_label: string | null;
  bills: PlannedBill[];
  accounts: PlannedAccount[];
}

interface PlanMonthModalProps {
  show: boolean;
  token: string;
  onClose: () => void;
  onCreated: (range: { start: string; end: string }) => void;
}

export default function PlanMonthModal({ show, token, onClose, onCreated }: PlanMonthModalProps) {
  const [plan, setPlan] = useState<MonthPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!show) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPlan(null);
    axios.get('/api/month-plan/', { headers: { Authorization: `Bearer ${token}` } })
      .then(response => {
        if (!cancelled) setPlan(response.data);
      })
      .catch(loadError => {
        if (!cancelled) {
          const parsed = parseApiError(loadError);
          if (parsed.message) setError(parsed.message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [show, token]);

  if (!show) return null;

  const updateBill = (index: number, patch: Partial<PlannedBill>) => {
    setPlan(current => current && ({
      ...current,
      bills: current.bills.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row),
    }));
  };

  const updateAccount = (index: number, patch: Partial<PlannedAccount>) => {
    setPlan(current => current && ({
      ...current,
      accounts: current.accounts.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row),
    }));
  };

  const createSelected = async () => {
    if (!plan) return;
    const bills = plan.bills.filter(row => row.selected && !row.already_exists);
    const accounts = plan.accounts.filter(row => row.selected && !row.already_exists);
    if (bills.length === 0 && accounts.length === 0) {
      setError('Choose at least one bill or account.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const response = await axios.post('/api/month-plan/', { bills, accounts }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onCreated({ start: response.data.start, end: response.data.end });
    } catch (saveError) {
      const parsed = parseApiError(saveError);
      if (parsed.message) setError(parsed.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal modal-open z-50" onClick={onClose}>
      <div className="modal-box w-full max-w-5xl relative" onClick={event => event.stopPropagation()}>
        <button
          type="button"
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
          aria-label="Close"
        >✕</button>
        <h2 className="font-bold text-xl mb-2">Plan next month</h2>
        {plan?.message && <p className="mb-4">{plan.message} Uncheck anything you do not want, then create the rest.</p>}
        {loading && <div className="flex justify-center py-8"><span className="loading loading-spinner loading-lg"></span></div>}
        {error && <div className="alert alert-error mb-4">{error}</div>}
        {plan && !loading && plan.bills.length === 0 && plan.accounts.length === 0 && (
          <p>Nothing from the last two months can be carried forward.</p>
        )}
        {plan && plan.accounts.length > 0 && (
          <section className="mb-6">
            <h3 className="font-bold mb-2">Bank accounts</h3>
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th></th>
                    <th>Account</th>
                    <th>Due</th>
                    <th>Pay</th>
                    <th>Balance</th>
                    <th>Why</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.accounts.map((row, index) => (
                    <tr key={`${row.bank_account}-${row.due_date}`}>
                      <td>
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={row.selected}
                          disabled={row.already_exists}
                          aria-label={`Include ${row.name}`}
                          onChange={event => updateAccount(index, { selected: event.target.checked })}
                        />
                      </td>
                      <td>{row.name}</td>
                      <td><input type="date" className="input input-bordered input-sm" value={row.due_date} onChange={event => updateAccount(index, { due_date: event.target.value })} /></td>
                      <td><input type="date" className="input input-bordered input-sm" value={row.pay_date || ''} onChange={event => updateAccount(index, { pay_date: event.target.value })} /></td>
                      <td><input type="number" step="0.01" className="input input-bordered input-sm w-28" value={row.balance} onChange={event => updateAccount(index, { balance: event.target.value })} /></td>
                      <td className="text-sm">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
        {plan && plan.bills.length > 0 && (
          <section className="mb-6">
            <h3 className="font-bold mb-2">Bills</h3>
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th></th>
                    <th>Bill</th>
                    <th>Due</th>
                    <th>Pay</th>
                    <th>Amount</th>
                    <th>Why</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.bills.map((row, index) => (
                    <tr key={`${row.bill}-${row.due_date}-${index}`}>
                      <td>
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={row.selected}
                          disabled={row.already_exists}
                          aria-label={`Include ${row.name}`}
                          onChange={event => updateBill(index, { selected: event.target.checked })}
                        />
                      </td>
                      <td>{row.name}</td>
                      <td><input type="date" className="input input-bordered input-sm" value={row.due_date} onChange={event => updateBill(index, { due_date: event.target.value })} /></td>
                      <td><input type="date" className="input input-bordered input-sm" value={row.pay_date || ''} onChange={event => updateBill(index, { pay_date: event.target.value })} /></td>
                      <td><input type="number" step="0.01" className="input input-bordered input-sm w-28" value={row.amount_due} onChange={event => updateBill(index, { amount_due: event.target.value })} /></td>
                      <td className="text-sm">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
        <div className="modal-action">
          <button type="button" className="btn btn-primary" disabled={saving || loading || !plan} onClick={createSelected}>
            {saving ? 'Creating...' : `Create ${plan?.target_label || 'month'}`}
          </button>
        </div>
      </div>
    </div>
  );
}
