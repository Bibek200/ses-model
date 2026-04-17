import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'sales_agent' | 'viewer';
  phone?: string;
  avatar?: string;
  department?: string;
  isActive: boolean;
  lastLogin?: string;
  leadCount?: number;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('crm_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      const savedToken = localStorage.getItem('crm_token');
      if (!savedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        const data = await res.json();

        if (data.success && data.data?.user) {
          setUser(data.data.user);
          setToken(savedToken);
        } else {
          localStorage.removeItem('crm_token');
          setToken(null);
        }
      } catch {
        localStorage.removeItem('crm_token');
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success && data.data?.token) {
        localStorage.setItem('crm_token', data.data.token);
        setToken(data.data.token);
        setUser(data.data.user);
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Login failed' };
      }
    } catch {
      return { success: false, error: 'Network error. Is the server running?' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('crm_token');
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...userData } : null));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export type { User };
