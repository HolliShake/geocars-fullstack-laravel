import type { Role } from '@/types/role';
import { create } from 'zustand';

export type AuthStore = {
  token?: string;
  role?: Role;
  initialized: boolean;
  isLoggedIn: boolean;
  isLoggedOut: boolean;
  initialize: (state: boolean) => void;
  setCredentials: (token: string | undefined, role: Role | undefined) => void;
  clearCredentials: () => void;
};

const useAuthStore = create<AuthStore>((set) => ({
  token: undefined,
  role: undefined,
  initialized: false,
  isLoggedIn: false,
  isLoggedOut: true,
  initialize: (state: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role') as Role | null;
      const hasValidCredentials = !!(token && role);

      set({
        initialized: state,
        token: token || undefined,
        role: role || undefined,
        isLoggedIn: hasValidCredentials,
        isLoggedOut: !hasValidCredentials,
      });
    } catch (error) {
      console.error('Error initializing auth store:', error);
      set({
        initialized: state,
        token: undefined,
        role: undefined,
        isLoggedIn: false,
        isLoggedOut: true,
      });
    }
  },
  setCredentials: (token: string | undefined, role: Role | undefined) => {
    const hasCredentials = !!(token && role);

    set({
      token,
      role,
      isLoggedIn: hasCredentials,
      isLoggedOut: !hasCredentials,
    });

    if (hasCredentials) {
      try {
        localStorage.setItem('token', token!);
        localStorage.setItem('role', role!);
      } catch (error) {
        console.error('Error setting credentials:', error);
      }
    }
  },
  clearCredentials: () => {
    set({
      token: undefined,
      role: undefined,
      isLoggedIn: false,
      isLoggedOut: true,
    });

    try {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
    } catch (error) {
      console.error('Error clearing credentials:', error);
    }
  },
}));

export default useAuthStore;
