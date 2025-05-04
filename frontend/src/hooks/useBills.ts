import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export interface Bill {
  id: number;
  name: string;
  default_amount_due: string;
  url: string;
  draft_account: number;
  category: number;
  recurrence: number;
  priority: number;
}

export default function useBills(token: string) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBills = useCallback(() => {
    if (!token) return;
    setLoading(true);
    axios.get('/api/bills/', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setBills(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch bills');
        setLoading(false);
      });
  }, [token]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  return { bills, loading, error, refresh: fetchBills, setBills };
} 