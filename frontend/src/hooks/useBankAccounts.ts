import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export interface BankAccount {
  id: number;
  name: string;
  font_color: string;
}

export default function useBankAccounts(token: string) {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(() => {
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

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return { accounts, loading, error, refresh: fetchAccounts };
} 