import LoginPage from '@/pages/auth/login/page';
import type { Route } from '../types/route';

const PUBLIC: readonly Route[] = Object.freeze<Route[]>([
  {
    title: 'Root',
    icon: null,
    path: '/',
    index: true,
    element: <LoginPage />,
    layout: 'default',
    sidebar: false,
  },
  {
    title: 'Login',
    icon: null,
    path: '/auth/login',
    index: true,
    element: <LoginPage />,
    layout: 'default',
    sidebar: false,
  },
]);

export default PUBLIC;
