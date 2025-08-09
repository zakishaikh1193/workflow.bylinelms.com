import React, { useState } from 'react';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { useAuth } from '../contexts/AuthContext';

export function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await signIn(email, password);
      console.log('Sign in result:', { data, error });
      if (error) {
        console.error('Sign in error:', error);
        setError(error.message);
        return;
      }
      if (data?.user) {
        console.log('Sign in successful:', data.user);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Welcome Back
          </CardTitle>
          <p className="text-gray-600">
            Sign in to your project management account
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
                minLength={6}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              loading={loading}
              icon={loading ? <Loader2 className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>
        </CardContent>
        
        {/* Demo Credentials Info */}
        <CardContent className="pt-0">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Demo Credentials</h4>
            <div className="text-sm text-blue-700">
              <p className="mb-2">Use these demo credentials to test the system:</p>
              <p className="mb-1"><strong>Email:</strong> admin@demo.com</p>
              <p><strong>Password:</strong> demo123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}