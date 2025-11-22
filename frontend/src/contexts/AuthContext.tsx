import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/api';
import { UserRole } from '@/lib/auth';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  role: UserRole | null;
  loading: boolean;
}

declare global {
  function atob(input: string): string;
}

function decodeJWT(token: string) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      userId: payload.userId,
      role: payload.role,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: () => { },
  role: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setRole(userData.role);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    try {
      await api.post('/auth/register', { name, email, password, role });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setRole(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      const payload = decodeJWT(token);
      if (payload && new Date() < new Date(payload.exp * 1000)) {
        const userData = JSON.parse(userStr);
        setUser(userData);
        setRole(userData.role);
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
