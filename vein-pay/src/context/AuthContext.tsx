import React, { createContext, useState, useCallback, ReactNode } from 'react';

// Definitions moved here to solve the "module not found" error
export type UserRole = 'personal' | 'business';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  balance?: number;
  businessName?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, role: UserRole, businessName?: string) => boolean;
  signup: (username: string, password: string, role: UserRole, businessName?: string) => boolean;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Updated login to handle roles dynamically from the backend response
  const login = useCallback((username: string, role: UserRole, businessName?: string): boolean => {
    const newUser: User = {
      id: '1',
      username,
      role,
      balance: role === 'personal' ? 5000 : undefined,
      businessName: role === 'business' ? businessName : undefined,
    };
    setUser(newUser);
    return true;
  }, []);

  const signup = useCallback((username: string, password: string, role: UserRole, businessName?: string): boolean => {
    const newUser: User = {
      id: Math.random().toString(),
      username,
      role,
      balance: role === 'personal' ? 5000 : 0,
      businessName: role === 'business' ? businessName : undefined,
    };
    setUser(newUser);
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('access_token'); // Clean up token on logout
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}