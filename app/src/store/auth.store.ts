import type { Role } from '@/types/role';
import { create } from 'zustand';

export type AuthStore = {
  token?: string;
  role?: Role;
  isLoggedIn: boolean;
  setCredentials: (token: string, role: Role) => void;
  clearCredentials: () => void;
};

const useAuthStore = create<AuthStore>((set) => ({
  token: undefined,
  role: undefined,
  get isLoggedIn() {
    return (this.token !== undefined && this.role !== undefined) || (!!this.token && !!this.role);
  },
  setCredentials: (token: string, role: Role) => set({ token, role }),
  clearCredentials: () => set({ token: undefined, role: undefined }),
}));

export default useAuthStore;
