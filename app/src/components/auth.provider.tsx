/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
import { RoleEnum } from '@/constants/role.constant';
import { RouteKey } from '@/navigation/route';
import type { AuthStore } from '@/store/auth.store';
import useAuthStore from '@/store/auth.store';
import type React from 'react';
import { createContext, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';

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
  const location = useLocation();
  const navigate = useNavigate();

  // Load credentials from localStorage on mount
  useEffect(() => {
    auth.initialize(true);
  }, []);

  // Handle routing based on auth state
  useEffect(() => {
    if (!auth.initialized) return; // wait until store is ready

    console.log('LOGGED IN:', auth.isLoggedIn, '|', 'LOGGED OUT:', auth.isLoggedOut);

    const { pathname } = location;
    const isLoginPage = pathname === RouteKey.Auth.Login.key;
    const isRegisterPage = pathname === RouteKey.Auth.Register.key;
    const isAuthPage = isLoginPage || isRegisterPage || pathname === '/';

    // Loggedin but not logged out and on login page
    if (auth.isLoggedIn && !auth.isLoggedOut && isAuthPage) {
      switch (auth.role) {
        case RoleEnum.admin: {
          navigate(RouteKey.Admin.Dashboard.key, { replace: true });
          break;
        }
        case RoleEnum.user: {
          navigate(RouteKey.User.Dashboard.key, { replace: true });
          break;
        }
        case RoleEnum.renter: {
          // navigate(RouteKey.Renter.Dashboard.key, { replace: true });
          break;
        }
        default: {
          navigate(RouteKey.Auth.Login.key, { replace: true });
          auth.clearCredentials();
        }
      }
    }

    // Logged out and not on auth page
    if (auth.isLoggedOut && !isAuthPage) {
      navigate(RouteKey.Auth.Login.key, { replace: true });
      return;
    }
  }, [location, auth, navigate]);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
