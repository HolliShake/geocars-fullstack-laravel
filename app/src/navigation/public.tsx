import LoginPage from '@/pages/auth/login/page';
import Page404 from '@/pages/status/page404';
import type { Route } from '../types/route';

const PUBLIC: readonly Route[] = Object.freeze<Route[]>([
  {
    key: 'Public.Root',
    title: 'Root',
    icon: null,
    path: '/',
    index: true,
    element: <LoginPage />,
    layout: 'default',
    sidebar: false,
  },
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
  // 404
  {
    key: 'Public.404',
    title: '404',
    icon: null,
    path: '*',
    index: false,
    sidebar: false,
    element: <Page404 />,
  },
]);

export default PUBLIC;
