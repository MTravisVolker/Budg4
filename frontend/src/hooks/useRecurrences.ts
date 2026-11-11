import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { parseApiError } from '../utils/apiError';

export interface Recurrence {
  id: number;
  name: string;
  calculation?: string;
}

export default function useRecurrences(token: string) {
  const [recurrences, setRecurrences] = useState<Recurrence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecurrences = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    axios.get('/api/recurrences/', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setRecurrences(res.data);
        setLoading(false);
      })
      .catch((error) => {
        setError(parseApiError(error).message);
        setLoading(false);
      });
  }, [token]);

  useEffect(() => {
    fetchRecurrences();
  }, [fetchRecurrences]);

  return { recurrences, loading, error, refresh: fetchRecurrences };
} 