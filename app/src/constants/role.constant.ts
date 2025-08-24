import type { Role } from '@/types/role';

export const RoleEnum: Record<Role, Role> = Object.freeze({
  admin: 'admin',
  user: 'user',
  renter: 'renter',
});
