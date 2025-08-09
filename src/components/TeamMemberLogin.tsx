import React, { useState } from 'react';
import { useEffect } from 'react';
import { LogIn, User, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { useApp } from '../contexts/AppContext';
import type { User as UserType } from '../types';

interface TeamMemberLoginProps {
  onLogin: (user: UserType) => void;
}

export function TeamMemberLogin({ onLogin }: TeamMemberLoginProps) {
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { state } = useApp();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Find user in the app state (created via admin panel)
      const user = state.users.find(u => 
        u.email === email && 
        u.passcode === passcode && 
        u.isActive !== false
      );

      if (user) {
        onLogin(user);
      } else {
        setError('Invalid email or passcode. Please check your credentials and ensure your account is active.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Debug function to check available users
  const debugUsers = () => {
    console.log('Available users:', state.users);
    console.log('Entered email:', email);
    console.log('Entered passcode:', passcode);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center">
              <User className="w-6 h-6 mr-2" />
              Team Member Portal
            </CardTitle>
            <p className="text-gray-600">
              Sign in to view your tasks and performance
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passcode
                </label>
                <input
                  type="password"
                  required
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your passcode"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                  <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                loading={loading}
                icon={<LogIn className="w-4 h-4" />}
                onClick={debugUsers}
              >
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Available Team Members for Testing */}
        {state.users && state.users.filter(u => u.passcode && u.isActive !== false).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Team Members (For Testing)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {state.users.filter(u => u.passcode && u.isActive !== false).map(user => (
                <div 
                  key={user.id} 
                  className="p-2 bg-gray-50 rounded text-sm cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setEmail(user.email);
                    setPasscode(user.passcode || '');
                  }}
                >
                  <div className="font-medium">{user.name}</div>
                  <div className="text-gray-600">Email: {user.email}</div>
                  <div className="text-gray-600">Passcode: {user.passcode}</div>
                  <div className="text-xs text-gray-500">Skills: {user.skills.join(', ')}</div>
                  <div className="text-xs text-blue-500 mt-1">Click to auto-fill credentials</div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        
        {/* Debug info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Debug Info</CardTitle>
          </CardHeader>
          <CardContent className="text-xs">
            <p>Total users in state: {state.users?.length || 0}</p>
            <p>Users with passcode: {state.users?.filter(u => u.passcode).length || 0}</p>
            <p>Active users with passcode: {state.users?.filter(u => u.passcode && u.isActive !== false).length || 0}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}