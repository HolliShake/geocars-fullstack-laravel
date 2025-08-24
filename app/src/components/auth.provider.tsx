/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
import { RouteKey } from '@/navigation/route';
import type { AuthStore } from '@/store/auth.store';
import useAuthStore from '@/store/auth.store';
import type { Role } from '@/types/role';
import type React from 'react';
import { createContext, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router';

const AuthContext = createContext<AuthStore | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default function AuthProvider({ children }: { children: React.ReactNode }): React.ReactNode {
  const auth = useAuthStore();

  const navigate = useNavigate();

  // initialize
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role') as Role;
    if (token && role) {
      auth.setCredentials(token, role);
    }

    if (auth.isLoggedIn && location.pathname !== RouteKey.Auth.Login.key) {
      navigate(RouteKey.Admin.Dashboard.key);
    } else if (
      !auth.isLoggedIn &&
      location.pathname !== RouteKey.Auth.Login.key &&
      location.pathname !== RouteKey.Auth.Register.key
    ) {
      navigate(RouteKey.Auth.Login.key);
    }
  }, [auth]);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
