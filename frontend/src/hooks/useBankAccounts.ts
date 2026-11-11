import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { parseApiError } from '../utils/apiError';

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
    setError(null);
    axios.get('/api/bankaccounts/', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setAccounts(res.data);
        setLoading(false);
      })
      .catch((error) => {
        setError(parseApiError(error).message);
        setLoading(false);
      });
  }, [token]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return { accounts, loading, error, refresh: fetchAccounts };
} 