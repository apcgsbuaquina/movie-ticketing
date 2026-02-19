import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase, hasSupabaseConfig } from '../lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null); // Customer profile
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  // Track whether the initial auth check has completed (user determined or null)
  const initialAuthResolved = useRef(false);
  const loadingRef = useRef(true);

  // Keep the ref in sync with loading state
  function stopLoading() {
    loadingRef.current = false;
    setLoading(false);
  }

  // ── 1. Auth state listener (synchronous state only — no Supabase DB calls) ──
  useEffect(() => {
    if (!hasSupabaseConfig || !supabase) {
      stopLoading();
      return;
    }

    // onAuthStateChange fires INITIAL_SESSION on setup (Supabase v2.39+).
    // For older versions, getSession() below acts as a fallback.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          // loading will be stopped by the profile-fetcher effect (Effect 2)
        } else {
          setUser(null);
          setProfile(null);
          setUserRole(null);
          // No user → no profile to fetch → stop loading immediately
          stopLoading();
        }
        initialAuthResolved.current = true;
      }
    );

    // Fallback for Supabase versions that don't fire INITIAL_SESSION.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!initialAuthResolved.current) {
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
          setProfile(null);
          setUserRole(null);
          stopLoading();
        }
        initialAuthResolved.current = true;
      }
    }).catch((err) => {
      console.error('Error getting session:', err);
      initialAuthResolved.current = true;
      stopLoading();
    });

    // Safety timeout — if nothing else resolves loading within 8s, force it
    const safetyTimeout = setTimeout(() => {
      if (loadingRef.current) {
        console.warn('Auth initialization timed out — forcing loading to false');
        stopLoading();
      }
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, []);

  // ── 2. Profile fetcher — runs OUTSIDE the auth listener to avoid deadlocks ──
  useEffect(() => {
    if (!hasSupabaseConfig || !supabase) return;

    // When initialAuthResolved is true but user is null → no session, stop loading.
    if (initialAuthResolved.current && !user) {
      stopLoading();
      return;
    }

    if (!user?.email) return;

    let cancelled = false;

    async function loadProfile() {
      try {
        await fetchProfile(user);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        if (!cancelled) stopLoading();
      }
    }

    loadProfile();

    return () => { cancelled = true; };
  }, [user]);

  async function fetchProfile(authUser) {
    const uid = authUser.id;    // UUID from auth.users
    const email = authUser.email;

    // 1. Get the user's role from the `users` table (keyed by auth UUID)
    const { data: userRow, error: userErr } = await supabase
      .from('users')
      .select('*')
      .eq('userid', uid)
      .maybeSingle();

    if (userErr) {
      console.error('Error fetching user role:', userErr);
    }

    const role = userRow?.role || 'Customer';
    setUserRole(role);

    // 2. If the user is a Customer, fetch their customer + loyalty profile
    if (role === 'Customer') {
      const { data: customer, error: customerErr } = await supabase
        .from('customers')
        .select('*, loyaltyprofiles(*)')
        .eq('customerid', uid)
        .maybeSingle();

      if (customerErr) {
        console.error('Error fetching customer profile:', customerErr);
      }

      if (customer) {
        setProfile({ ...customer, users: userRow });
      } else {
        setProfile({ users: userRow });
      }
    } else {
      // Staff / Admin — fetch staff profile and merge with users row
      const { data: staffProfile, error: staffErr } = await supabase
        .from('staff')
        .select('*')
        .eq('staffid', uid)
        .maybeSingle();

      if (staffErr) {
        console.error('Error fetching staff profile:', staffErr);
      }

      setProfile({ ...(staffProfile || {}), users: userRow });
    }
  }

  async function signUp({ email, password, firstName, middleName, lastName, suffix, phone, dateOfBirth }) {
    if (!hasSupabaseConfig) {
      throw new Error('Supabase environment variables are missing. Check your .env file.');
    }
    // 1. Create Supabase Auth user
    //    A DB trigger auto-creates the corresponding `users` row.
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    const userId = authData.user.id; // UUID from auth.users

    // 2. Create Customers record (customerid = auth UUID)
    const { error: customerError } = await supabase
      .from('customers')
      .insert({
        customerid: userId,
        firstname: firstName,
        middlename: middleName || null,
        lastname: lastName,
        suffix: suffix || null,
        email: email,
        phonenumber: phone,
        dateofbirth: dateOfBirth,
      });

    if (customerError) {
      // Translate unique constraint violations to user-friendly messages
      const msg = customerError.message || '';
      if (customerError.code === '23505' || msg.includes('duplicate key') || msg.includes('unique constraint')) {
        if (msg.includes('phonenumber')) {
          throw new Error('This phone number is already registered. Please use a different number.');
        }
        if (msg.includes('email')) {
          throw new Error('This email is already registered.');
        }
        throw new Error('An account with these details already exists.');
      }
      throw customerError;
    }

    // 3. Create LoyaltyProfile
    await supabase
      .from('loyaltyprofiles')
      .insert({
        customerid: userId,
        membershiptier: 'Classic',
        currentpoints: 0,
        totalspent: 0,
      });

    return authData;
  }

  async function signIn({ email, password }) {
    if (!hasSupabaseConfig) {
      throw new Error('Supabase environment variables are missing. Check your .env file.');
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    if (!hasSupabaseConfig) {
      throw new Error('Supabase environment variables are missing. Check your .env file.');
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setProfile(null);
    setUserRole(null);
  }

  const value = {
    user,
    profile,
    userRole,
    loading,
    supabaseReady: hasSupabaseConfig,
    signUp,
    signIn,
    signOut,
    refreshProfile: () => user && fetchProfile(user),
    isAdmin: userRole === 'Admin',
    isStaff: userRole === 'Staff' || userRole === 'Admin',
    isCustomer: userRole === 'Customer',
    customerId: profile?.customerid || null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
