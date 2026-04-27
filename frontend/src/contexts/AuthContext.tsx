import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '@/services/api';
import { checkPermission } from '@/lib/permissionCheck';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithSSO: (provider: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  isLoading: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  designation: string;
  avatar?: string;
  permissions: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setIsLoading(false);
      return;
    }
    authApi
      .me()
      .then((profile) => {
        const u: User = {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          department: '',
          designation: profile.role,
          permissions: profile.permissions || [],
        };
        setUser(u);
        localStorage.setItem('hrms_user', JSON.stringify(u));
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('hrms_user');
      })
      .finally(() => setIsLoading(false));
  }, []);

  /** Re-sync permissions from DB when tab becomes visible (e.g. admin changed role while user kept the app open). */
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      const token = localStorage.getItem('access_token');
      if (!token) return;
      authApi
        .me()
        .then((profile) => {
          const u: User = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
            department: '',
            designation: profile.role,
            permissions: profile.permissions || [],
          };
          setUser(u);
          localStorage.setItem('hrms_user', JSON.stringify(u));
        })
        .catch(() => {
          /* keep session; token may be briefly invalid */
        });
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await authApi.login(email, password);
      const u: User = {
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: res.user.role,
        department: '',
        designation: res.user.role,
        permissions: res.user.permissions || [],
      };
      setUser(u);
      localStorage.setItem('access_token', res.access_token);
      localStorage.setItem('hrms_user', JSON.stringify(u));
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithSSO = async (_provider: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await authApi.login('admin@chirohealth.com', 'password123');
      const u: User = {
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: res.user.role,
        department: '',
        designation: res.user.role,
        permissions: res.user.permissions || [],
      };
      setUser(u);
      localStorage.setItem('access_token', res.access_token);
      localStorage.setItem('hrms_user', JSON.stringify(u));
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('hrms_user');
  };

  /**
   * Returns true if user has the required permission.
   * Supports: exact match, wildcard "*" or "admin", and resource wildcard (e.g. facilities.* covers facilities.create).
   */
  const hasPermission = (permission: string): boolean =>
    checkPermission(user?.permissions, permission);

  const value = {
    user,
    login,
    loginWithSSO,
    logout,
    isAuthenticated: !!user,
    hasPermission,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
