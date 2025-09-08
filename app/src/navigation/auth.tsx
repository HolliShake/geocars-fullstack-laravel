import LoginPage from '@/pages/auth/login/page';
import SignupPage from '@/pages/auth/signup/page';
import ProfilePage from '@/pages/profile/page';
import type { Route } from '@/types/route';
import { LucideUser } from 'lucide-react';
import { RouteKey } from './route';

const AUTHROUTES: readonly Route[] = Object.freeze<Route[]>([
  {
    key: 'Public.Login',
    title: 'Login',
    icon: null,
    path: '/auth/login',
    index: true,
    element: <LoginPage />,
    layout: 'default',
    sidebar: false,
  },
  {
    key: 'Public.Signup',
    title: 'Signup',
    icon: null,
    path: '/auth/signup',
    index: true,
    element: <SignupPage />,
    layout: 'default',
    sidebar: false,
  },
  {
    key: 'Auth.Profile',
    title: 'Profile',
    path: RouteKey.Auth.Profile.key,
    icon: <LucideUser />,
    element: <ProfilePage />,
    layout: 'dashboard',
    sidebar: true,
  },
]);

export default AUTHROUTES;
