import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { DueBill, BankAccountInstance, BankAccount, Bill, Status, Recurrence, Category } from '../types';

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

  const fetchAll = useCallback(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([
      axios.get('/api/duebills/', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('/api/bankaccountinstances/', { headers: { Authorization: `Bearer ${token}` } }),
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
      })
      .catch((error) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          setError('Your session has expired. Please log in again.');
        } else {
          setError('Failed to fetch data');
        }
        setLoading(false);
      });
  }, [token]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

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
  };
} 