import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';


// Check if we're in demo mode (no proper Supabase config or demo values)
const isDemoMode = !import.meta.env.VITE_SUPABASE_URL || 
                   !import.meta.env.VITE_SUPABASE_ANON_KEY ||
                   import.meta.env.VITE_SUPABASE_URL === 'https://demo.supabase.co' ||
                   import.meta.env.VITE_SUPABASE_ANON_KEY === 'demo-key' ||
                   import.meta.env.VITE_SUPABASE_URL === 'your_supabase_project_url' ||
                   import.meta.env.VITE_SUPABASE_ANON_KEY === 'your_supabase_anon_key';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemoMode) {
      // In demo mode, just set loading to false
      setLoading(false);
    } else {
      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    if (isDemoMode) {
      return { data: null, error: { message: 'Sign up not available in demo mode' } };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (data.user && !error) {
      // Create profile
      await supabase.from('profiles').insert({
        id: data.user.id,
        name,
        email,
      });
    }

    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    // Handle demo mode
    if (isDemoMode) {
      if (email === 'admin@demo.com' && password === 'demo123') {
        const mockUser = {
          id: 'demo-admin-id',
          email: 'admin@demo.com',
          user_metadata: { name: 'Demo Admin' },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          email_confirmed_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString(),
          role: 'authenticated',
          confirmation_sent_at: null,
          confirmed_at: new Date().toISOString(),
          recovery_sent_at: null,
          email_change_sent_at: null,
          new_email: null,
          invited_at: null,
          action_link: null,
          phone: null,
          phone_confirmed_at: null,
          phone_change_sent_at: null,
          new_phone: null,
          identities: []
        };

        const mockSession = {
          access_token: 'demo-access-token',
          refresh_token: 'demo-refresh-token',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: 'bearer',
          user: mockUser
        };

        setUser(mockUser);
        setSession(mockSession);
        return { data: { user: mockUser, session: mockSession }, error: null };
      } else {
        return { 
          data: { user: null, session: null }, 
          error: { message: 'Invalid login credentials. Use admin@demo.com / demo123 for demo access.' }
        };
      }
    }

    // Use real Supabase authentication
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    if (isDemoMode) {
      setUser(null);
      setSession(null);
      return { error: null };
    }
    return await supabase.auth.signOut();
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };
}