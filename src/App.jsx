// ============================================================
//  App.jsx — Root Component
// ============================================================
import React, { useEffect, useState } from 'react';
import { AppProvider } from './context/AppContext';
import LoginScreen from './components/Auth/LoginScreen';
import RegisterScreen from './components/Auth/RegisterScreen';
import AppLayout from './components/Layout/AppLayout';
import { getAuthStatus } from './utils/storage';

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const valid = getAuthStatus();
      setIsAuthenticated(valid);
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1121]">
        <div className="w-8 h-8 border-3 border-[#38bdf8]/20 border-t-[#38bdf8] rounded-full animate-spin-loader" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <AppLayout />;
  }

  return (
    <>
      {showRegister ? (
        <RegisterScreen
          onRegister={() => setShowRegister(false)}
          onSwitchToLogin={() => setShowRegister(false)}
        />
      ) : (
        <LoginScreen
          onLogin={() => setIsAuthenticated(true)}
          onSwitchToRegister={() => setShowRegister(true)}
        />
      )}
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;