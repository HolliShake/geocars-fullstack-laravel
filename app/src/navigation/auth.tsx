import ProfilePage from '@/pages/profile/page';
import type { Route } from '@/types/route';
import { LucideUser } from 'lucide-react';
import { RouteKey } from './route';

const AUTHROUTES: readonly Route[] = Object.freeze<Route[]>([
  {
    key: 'Auth.Profile',
    title: 'Profile',
    path: RouteKey.Auth.Profile.key,
    icon: <LucideUser />,
    element: <ProfilePage />,
    layout: 'dashboard',
    sidebar: false,
  },
]);

export default AUTHROUTES;
