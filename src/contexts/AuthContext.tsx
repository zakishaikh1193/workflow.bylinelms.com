import React, { createContext, useContext, useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiUser {
  id: number;
  email: string;
  name: string;
  avatar_url?: string;
  is_active: boolean;
  last_login_at?: string;
  skills?: string[];
}

interface AuthSession {
  user: ApiUser;
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

interface AuthContextType {
  user: ApiUser | null;
  session: AuthSession | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const signUp = async () => {
    return {
      data: null,
      error: { message: 'Admin registration is not available.' }
    };
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const { user: userData, access_token, refresh_token, expires_in } = result.data;

        localStorage.setItem('access_token', access_token);
        localStorage.setItem('user_data', JSON.stringify(userData));
        if (refresh_token) {
          localStorage.setItem('refresh_token', refresh_token);
        }

        const sessionData = {
          user: userData,
          access_token,
          refresh_token: refresh_token || '',
          expires_in
        };

        setUser(userData);
        setSession(sessionData);

        return { data: { user: userData, session: sessionData }, error: null };
      } else {
        return { data: { user: null, session: null }, error: { message: result.message || 'Login failed' } };
      }
    } catch (error) {
      return { data: { user: null, session: null }, error: { message: 'Network error' } };
    }
  };

  const signOut = async () => {
    localStorage.clear();
    setUser(null);
    setSession(null);
    return { error: null };
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}