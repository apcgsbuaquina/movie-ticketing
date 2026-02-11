import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('movies')
        .select('*')
        .order('createdat', { ascending: false });

      if (err) throw err;
      setMovies(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  async function getMovie(id) {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .eq('movieid', id)
      .single();
    if (error) throw error;
    return data;
  }

  async function createMovie(movie) {
    const { data, error } = await supabase
      .from('movies')
      .insert(movie)
      .select()
      .single();
    if (error) throw error;
    await fetchMovies();
    return data;
  }

  async function updateMovie(id, updates) {
    const { data, error } = await supabase
      .from('movies')
      .update(updates)
      .eq('movieid', id)
      .select()
      .single();
    if (error) throw error;
    await fetchMovies();
    return data;
  }

  async function deleteMovie(id) {
    const { error } = await supabase
      .from('movies')
      .delete()
      .eq('movieid', id);
    if (error) throw error;
    await fetchMovies();
  }

  return {
    movies,
    loading,
    error,
    fetchMovies,
    getMovie,
    createMovie,
    updateMovie,
    deleteMovie,
  };
}
