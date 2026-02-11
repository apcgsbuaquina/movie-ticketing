import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useLoyalty(customerId = null) {
  const [loyalty, setLoyalty] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchLoyalty = useCallback(async () => {
    if (!customerId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('loyaltyprofiles')
        .select('*')
        .eq('customerid', customerId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching loyalty:', error);
      }
      setLoyalty(data || null);
    } catch (err) {
      console.error('Error in fetchLoyalty:', err);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  const tierColors = {
    Classic: 'text-cinema-cream/70',
    Silver: 'text-gray-300',
    Gold: 'text-cinema-gold',
    Platinum: 'text-cyan-300',
  };

  const tierBorderColors = {
    Classic: 'border-cinema-cream/30',
    Silver: 'border-gray-400',
    Gold: 'border-cinema-gold',
    Platinum: 'border-cyan-400',
  };

  return {
    loyalty,
    loading,
    fetchLoyalty,
    tierColors,
    tierBorderColors,
  };
}
