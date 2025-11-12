import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase env missing. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.'
  );
}

let supabase;
try {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  // Create a mock client to prevent crashes
  supabase = {
    auth: {
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: null } }),
      signInWithPassword: async () => ({ error: new Error('Supabase not initialized') }),
      signUp: async () => ({ error: new Error('Supabase not initialized') }),
      signOut: async () => ({ error: new Error('Supabase not initialized') }),
      updateUser: async () => ({ error: new Error('Supabase not initialized') }),
    },
    storage: {},
    channel: () => ({ on: () => ({}), subscribe: () => {} }),
    removeChannel: () => {},
  };
}

export { supabase };

export const POSTS_BUCKET = process.env.EXPO_PUBLIC_POSTS_BUCKET || 'posts';
export const AVATARS_BUCKET = process.env.EXPO_PUBLIC_AVATARS_BUCKET || 'avatars';
