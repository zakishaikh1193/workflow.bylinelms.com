import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      gcTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AppProvider>
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary>
            <Suspense fallback={<div className="p-6 text-gray-600">Loading...</div>}>
              <App />
            </Suspense>
          </ErrorBoundary>
        </QueryClientProvider>
      </AppProvider>
    </AuthProvider>
  </StrictMode>
);
