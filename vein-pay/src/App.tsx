import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PersonalDashboard from './pages/PersonalDashboard';
import BusinessDashboard from './pages/BusinessDashboard';

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  if (!isAuthenticated) {
    return isLogin ? (
      <Login onSwitch={() => setIsLogin(false)} />
    ) : (
      <Signup onSwitch={() => setIsLogin(true)} />
    );
  }

  return user?.role === 'personal' ? <PersonalDashboard /> : <BusinessDashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
