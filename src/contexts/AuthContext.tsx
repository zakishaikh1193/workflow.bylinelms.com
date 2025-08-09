import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Backend API configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Custom user type for our backend
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

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkExistingSession = async () => {
      const token = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user_data');

      if (token && userData) {
        try {
          const response = await fetch(`${API_URL}/auth/admin/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              const user = result.data;
              const session = {
                user,
                access_token: token,
                refresh_token: localStorage.getItem('refresh_token') || '',
                expires_in: 24 * 60 * 60
              };
              setUser(user);
              setSession(session);
            } else {
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('user_data');
            }
          } else {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_data');
          }
        } catch (error) {
          console.error('Session check failed:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_data');
        }
      }
      setLoading(false);
    };

    checkExistingSession();
  }, []);

  const signUp = async (_email: string, _password: string, _name: string) => {
    return {
      data: null,
      error: { message: 'Admin registration is not available. Please contact system administrator.' }
    };
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const { user, access_token, refresh_token, expires_in } = result.data;

        localStorage.setItem('access_token', access_token);
        localStorage.setItem('user_data', JSON.stringify(user));
        if (refresh_token) {
          localStorage.setItem('refresh_token', refresh_token);
        }

        const session = {
          user,
          access_token,
          refresh_token: refresh_token || '',
          expires_in
        };

        console.log('🔧 Setting user state:', user);
        setUser(user);
        setSession(session);

        console.log('✅ Login successful, user state should be set');

        return {
          data: { user, session },
          error: null
        };
      } else {
        return {
          data: { user: null, session: null },
          error: { message: result.message || 'Login failed' }
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        data: { user: null, session: null },
        error: { message: 'Network error. Please check your connection.' }
      };
    }
  };

  const signOut = async () => {
    try {
      const token = localStorage.getItem('access_token');

      if (token) {
        await fetch(`${API_URL}/auth/admin/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }

      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');

      setUser(null);
      setSession(null);

      return { error: null };
    } catch (error) {
      console.error('Logout error:', error);

      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');

      setUser(null);
      setSession(null);

      return { error: null };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
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
