import { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({
  session: null,
  sessionLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(data?.session || null);
      } catch (e) {
        console.warn('Auth session load failed:', e?.message || e);
        if (mounted) setSession(null);
      } finally {
        if (mounted) setSessionLoading(false);
      }
    })();

    let unsubscribe;
    try {
      const { data: authListener } = supabase.auth.onAuthStateChange((_event, sess) => {
        if (mounted) setSession(sess || null);
      });
      unsubscribe = authListener?.subscription;
    } catch (e) {
      console.warn('Auth listener setup failed:', e?.message || e);
    }

    return () => {
      mounted = false;
      unsubscribe?.unsubscribe?.();
    };
  }, []);

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert('Login error', error.message);
  };

  const signUp = async (email, password, name) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) Alert.alert('Signup error', error.message);
    else Alert.alert('Check your email to confirm your account');
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert('Logout error', error.message);
  };

  return (
    <AuthContext.Provider value={{ session, sessionLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
