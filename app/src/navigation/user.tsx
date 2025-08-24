import { RoleEnum } from '@/constants/role.constant';
import UserCarsPage from '@/pages/user/company-config/cars/page';
import UserCompanyConfigPage from '@/pages/user/company-config/page';
import UserDashboardPage from '@/pages/user/dashboard/page';
import type { Route } from '@/types/route';
import { LucideBuilding2, LucideCar, LucideLayoutDashboard } from 'lucide-react';
import { RouteKey } from './route';

const USERROUTES: readonly Route[] = Object.freeze<Route[]>([
  {
    title: 'Dashboard',
    path: RouteKey.User.Dashboard.key,
    icon: <LucideLayoutDashboard />,
    element: <UserDashboardPage />,
    layout: 'dashboard',
    roles: [RoleEnum.user],
  },
  {
    title: 'Company Config',
    path: RouteKey.User.CompanyConfig.key,
    icon: <LucideBuilding2 />,
    element: <UserCompanyConfigPage />,
    layout: 'dashboard',
    roles: [RoleEnum.user],
  },
  {
    title: 'Company Cars',
    path: RouteKey.User.CompanyCars.key,
    icon: <LucideCar />,
    element: <UserCarsPage />,
    layout: 'dashboard',
    sidebar: false,
    roles: [RoleEnum.user],
  },
]);

export default USERROUTES;
