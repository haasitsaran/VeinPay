import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
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
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
