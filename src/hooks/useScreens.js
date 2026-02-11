import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useScreens() {
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchScreens = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('screens')
        .select('*')
        .order('cinemabranch', { ascending: true })
        .order('screennumber', { ascending: true });

      if (err) throw err;
      setScreens(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScreens();
  }, [fetchScreens]);

  async function createScreen(screen) {
    const { data, error } = await supabase
      .from('screens')
      .insert(screen)
      .select()
      .single();
    if (error) throw error;
    await fetchScreens();
    return data;
  }

  async function updateScreen(id, updates) {
    const { data, error } = await supabase
      .from('screens')
      .update(updates)
      .eq('screenid', id)
      .select()
      .single();
    if (error) throw error;
    await fetchScreens();
    return data;
  }

  async function deleteScreen(id) {
    const { error } = await supabase
      .from('screens')
      .delete()
      .eq('screenid', id);
    if (error) throw error;
    await fetchScreens();
  }

  return {
    screens,
    loading,
    error,
    fetchScreens,
    createScreen,
    updateScreen,
    deleteScreen,
  };
}
