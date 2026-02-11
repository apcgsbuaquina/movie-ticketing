import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useSessions(movieId = null) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('sessions')
        .select('*, movies(*), screens(*)')
        .order('starttime', { ascending: true });

      if (movieId) {
        query = query.eq('movieid', movieId);
      }

      const { data, error: err } = await query;
      if (err) throw err;
      setSessions(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [movieId]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  async function getSession(id) {
    const { data, error } = await supabase
      .from('sessions')
      .select('*, movies(*), screens(*)')
      .eq('sessionid', id)
      .single();
    if (error) throw error;
    return data;
  }

  async function createSession(session) {
    const { data, error } = await supabase
      .from('sessions')
      .insert(session)
      .select('*, movies(*), screens(*)')
      .single();
    if (error) throw error;
    await fetchSessions();
    return data;
  }

  async function updateSession(id, updates) {
    const { data, error } = await supabase
      .from('sessions')
      .update(updates)
      .eq('sessionid', id)
      .select('*, movies(*), screens(*)')
      .single();
    if (error) throw error;
    await fetchSessions();
    return data;
  }

  async function deleteSession(id) {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('sessionid', id);
    if (error) throw error;
    await fetchSessions();
  }

  return {
    sessions,
    loading,
    error,
    fetchSessions,
    getSession,
    createSession,
    updateSession,
    deleteSession,
  };
}
