import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

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
    axios.get('/api/categories/', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setCategories(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch categories');
        setLoading(false);
      });
  }, [token]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refresh: fetchCategories };
} 