import React, { useEffect, useState } from 'react';
import { AppShell } from './layouts/AppShell';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuthStore } from './store/useAuthStore';

export const App: React.FC = () => {
  const [view, setView] = useState<'login' | 'register'>('login');
  const { fetchCurrentUser, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-400">Loading BizPilot AI session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return view === 'login' ? (
      <LoginPage onSwitchToRegister={() => setView('register')} />
    ) : (
      <RegisterPage onSwitchToLogin={() => setView('login')} />
    );
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <HomePage />
      </AppShell>
    </ProtectedRoute>
  );
};

export default App;
