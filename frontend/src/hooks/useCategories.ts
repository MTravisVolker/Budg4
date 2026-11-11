import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { parseApiError } from '../utils/apiError';

export interface Category {
  id: number;
  name: string;
}

export default function useCategories(token: string) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    axios.get('/api/categories/', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setCategories(res.data);
        setLoading(false);
      })
      .catch((error) => {
        setError(parseApiError(error).message);
        setLoading(false);
      });
  }, [token]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refresh: fetchCategories };
} 