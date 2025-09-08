/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
import { RoleEnum } from '@/constants/role.constant';
import Routes from '@/navigation';
import { RouteKey } from '@/navigation/route';
import type { AuthStore } from '@/store/auth.store';
import useAuthStore from '@/store/auth.store';
import type { Role } from '@/types/role';
import type { Route } from '@/types/route';
import { api } from '@rest/axios';
import type React from 'react';
import { createContext, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';

const match = (pattern: string, actual: string): boolean => {
  const clean = (p: string) =>
    p.split('?')[0].split('#')[0].replace(/\/+$/, '').split('/').filter(Boolean);

  const patternParts = clean(pattern);
  const pathParts = clean(actual);

  if (patternParts.length !== pathParts.length) return false;

  return patternParts.every((part, i) => part.startsWith(':') || part === pathParts[i]);
};

const AuthContext = createContext<AuthStore | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Load credentials from localStorage on mount
  useEffect(() => {
    auth.initialize(true);
  }, []);

  useEffect(() => {
    if (!auth.initialized) return;

    const { pathname } = location;
    const loggedIn = auth.isLoggedIn && !auth.isLoggedOut;

    const isLogin = pathname === RouteKey.Auth.Login.key;
    const isSignup = pathname === RouteKey.Auth.Signup.key;
    const isAuthPage = isLogin || isSignup || pathname === '/';

    // Redirect logged-in users away from login/signup
    if (loggedIn && isAuthPage) {
      switch (auth.role) {
        case RoleEnum.admin:
          navigate(RouteKey.Admin.Dashboard.key, { replace: true });
          return;
        case RoleEnum.user:
          navigate(RouteKey.User.Dashboard.key, { replace: true });
          return;
        case RoleEnum.renter:
          navigate(RouteKey.Renter.Browse.key, { replace: true });
          return;
        default:
          auth.clearCredentials();
          navigate(RouteKey.Auth.Login.key, { replace: true });
          return;
      }
    }

    // Check access to current route
    const route = Routes.find((r: Route) => match(r.path, pathname));
    const accessible = route ? (route.roles?.includes(auth.role as Role) ?? true) : false;

    if (loggedIn && !accessible) {
      // If route not found -> 404, else -> 403
      navigate(route ? RouteKey.Public.Forbidden.key : RouteKey.Public.NotFound.key, {
        replace: true,
      });
      return;
    }

    // If logged out but not on login/signup
    if (auth.isLoggedOut && !isAuthPage) {
      navigate(RouteKey.Auth.Login.key, { replace: true });
      return;
    }
  }, [location, auth, navigate]);

  // Keep session alive
  useEffect(() => {
    const fetchSession = async () => {
      if (!auth.isLoggedIn) return;
      try {
        const response = await api.get('api/Auth/session');
        auth.setCredentials(response.data.data.token, response.data.data.role);
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };
    fetchSession();
  }, [auth.isLoggedIn]);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
