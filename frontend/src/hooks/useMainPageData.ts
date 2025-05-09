import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { DueBill, BankAccountInstance, BankAccount, Bill, Status, Recurrence, Category } from '../types';

function calculateDefaultDateRange(bankInstances: BankAccountInstance[]): { start: string; end: string } {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Find the most recent account instance pay date before today
  const lastInstanceBeforeToday = bankInstances
    .filter(instance => instance.pay_date && new Date(instance.pay_date) < today)
    .sort((a, b) => new Date(b.pay_date!).getTime() - new Date(a.pay_date!).getTime())[0];

  // If no instances before today, use 1st of current month
  const startDate = lastInstanceBeforeToday 
    ? new Date(lastInstanceBeforeToday.pay_date!)
    : new Date(currentYear, currentMonth, 1);

  // Calculate end date (last day of current month if at least 28 days away, otherwise last day of next month)
  const daysFromStart = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const endDate = new Date(currentYear, currentMonth + (daysFromStart < 28 ? 1 : 0) + 1, 0);

  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0]
  };
}

export default function useMainPageData(token: string) {
  const [dueBills, setDueBills] = useState<DueBill[]>([]);
  const [bankInstances, setBankInstances] = useState<BankAccountInstance[]>([]);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [recurrences, setRecurrences] = useState<Recurrence[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load initial date range from localStorage or use empty object
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>(() => {
    const savedDateRange = localStorage.getItem('dateRange');
    return savedDateRange ? JSON.parse(savedDateRange) : { start: '', end: '' };
  });

  // Save date range to localStorage whenever it changes
  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      localStorage.setItem('dateRange', JSON.stringify(dateRange));
    }
  }, [dateRange]);

  const fetchAll = useCallback(() => {
    if (!token) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (dateRange.start && dateRange.end) {
      params.append('start_date', dateRange.start);
      params.append('end_date', dateRange.end);
    }
    Promise.all([
      axios.get(`/api/duebills/?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`/api/bankaccountinstances/?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('/api/bankaccounts/', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('/api/bills/', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('/api/statuses/', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('/api/recurrences/', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('/api/categories/', { headers: { Authorization: `Bearer ${token}` } }),
    ])
      .then(([dueBillsRes, bankInstancesRes, accountsRes, billsRes, statusesRes, recurrencesRes, categoriesRes]) => {
        setDueBills(dueBillsRes.data);
        setBankInstances(bankInstancesRes.data);
        setAccounts(accountsRes.data);
        setBills(billsRes.data);
        setStatuses(statusesRes.data);
        setRecurrences(recurrencesRes.data);
        setCategories(categoriesRes.data);
        setLoading(false);

        // Set default date range after first load if not already set
        if (!dateRange.start && !dateRange.end) {
          setDateRange(calculateDefaultDateRange(bankInstancesRes.data));
        }
      })
      .catch((error) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          // Let the axios interceptor handle the session expiration
          setError('Your session has expired. Please log in again.');
          // Clear any stored data
          setDueBills([]);
          setBankInstances([]);
          setAccounts([]);
          setBills([]);
          setStatuses([]);
          setRecurrences([]);
          setCategories([]);
        } else {
          setError('Failed to fetch data');
        }
        setLoading(false);
      });
  }, [token, dateRange]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const clearDateRange = useCallback(() => {
    const newDateRange = calculateDefaultDateRange(bankInstances);
    setDateRange(newDateRange);
    localStorage.removeItem('dateRange'); // Clear saved date range when resetting
  }, [bankInstances]);

  return {
    dueBills,
    bankInstances,
    accounts,
    bills,
    statuses,
    recurrences,
    categories,
    loading,
    error,
    refresh: fetchAll,
    dateRange,
    setDateRange,
    clearDateRange,
  };
} 