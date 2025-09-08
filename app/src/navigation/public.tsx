import Page403 from '@/pages/status/page403';
import Page404 from '@/pages/status/page404';
import type { Route } from '../types/route';

const PUBLIC: readonly Route[] = Object.freeze<Route[]>([
  {
    key: 'Public.403',
    title: '404',
    icon: null,
    path: '/403',
    index: false,
    sidebar: false,
    element: <Page403 />,
  },
  // 404
  {
    key: 'Public.404',
    title: '404',
    icon: null,
    path: '/404',
    index: false,
    sidebar: false,
    element: <Page404 />,
  },
  {
    key: 'Auto.404',
    title: '404',
    icon: null,
    path: '*',
    index: false,
    sidebar: false,
    element: <Page404 />,
  },
]);

export default PUBLIC;
