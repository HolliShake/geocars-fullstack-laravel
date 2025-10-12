import { RoleEnum } from '@/constants/role.constant';
import RenterApplication from '@/pages/renter/browse/application/page';
import RenterBrowsePage from '@/pages/renter/browse/page';
import type { Route } from '@/types/route';
import { Home } from 'lucide-react';
import { RouteKey } from './route';

const RENTERROUTES: readonly Route[] = Object.freeze<Route[]>([
  {
    key: 'Renter.Browse',
    title: 'Browse',
    icon: <Home />,
    path: RouteKey.Renter.Browse.key,
    element: <RenterBrowsePage />,
    layout: 'topbar',
    roles: [RoleEnum.renter],
    sidebar: true,
  },
  {
    key: 'Renter.Application',
    title: 'Application',
    icon: <Home />,
    path: RouteKey.Renter.Application.key,
    element: <RenterApplication />,
    layout: 'topbar',
    roles: [RoleEnum.renter],
    sidebar: false,
  },
]);

export default RENTERROUTES;
