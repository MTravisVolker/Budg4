import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Bill } from '../types';
import { parseApiError } from '../utils/apiError';

export default function useBills(token: string) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBills = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    axios.get('/api/bills/', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setBills(res.data);
        setLoading(false);
      })
      .catch((error) => {
        setError(parseApiError(error).message);
        setLoading(false);
      });
  }, [token]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  return { bills, loading, error, refresh: fetchBills, setBills };
} 