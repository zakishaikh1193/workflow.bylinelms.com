import { useState, useEffect } from 'react';

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

export function useAuth() {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on page load
    const checkExistingSession = async () => {
      const token = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user_data');
      
      if (token && userData) {
        try {
          // Verify token is still valid
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
              // Invalid session, clear storage
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('user_data');
            }
          } else {
            // Token expired or invalid, clear storage
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
    // Admin registration is not allowed - admins are created manually
    return { 
      data: null, 
      error: { message: 'Admin registration is not available. Please contact system administrator.' } 
    };
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Call backend API for admin login
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
        
        // Store tokens in localStorage
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('user_data', JSON.stringify(user));
        if (refresh_token) {
          localStorage.setItem('refresh_token', refresh_token);
        }

        // Create session object
        const session = {
          user,
          access_token,
          refresh_token: refresh_token || '',
          expires_in
        };

        // Update state
        setUser(user);
        setSession(session);

        return { 
          data: { user, session }, 
          error: null 
        };
      } else {
        // Login failed
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
        // Call backend logout API
        await fetch(`${API_URL}/auth/admin/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
      
      // Clear localStorage and state regardless of API call result
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      
      setUser(null);
      setSession(null);
      
      return { error: null };
    } catch (error) {
      console.error('Logout error:', error);
      
      // Still clear localStorage and state even if API call fails
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      
      setUser(null);
      setSession(null);
      
      return { error: null };
    }
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