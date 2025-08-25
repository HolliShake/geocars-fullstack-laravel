import { RoleEnum } from '@/constants/role.constant';
import UserQuickCarPage from '@/pages/user/cars/page';
import UserCompanyCarPage from '@/pages/user/company-config/cars/page';
import UserCompanyConfigPage from '@/pages/user/company-config/page';
import UserDashboardPage from '@/pages/user/dashboard/page';
import type { Route } from '@/types/route';
import { LucideBuilding2, LucideCar, LucideLayoutDashboard } from 'lucide-react';
import { RouteKey } from './route';

const USERROUTES: readonly Route[] = Object.freeze<Route[]>([
  {
    key: 'User.Dashboard',
    title: 'Dashboard',
    path: RouteKey.User.Dashboard.key,
    icon: <LucideLayoutDashboard />,
    element: <UserDashboardPage />,
    layout: 'dashboard',
    roles: [RoleEnum.user],
  },
  {
    key: 'User.QuickCar',
    title: 'Car Management',
    path: RouteKey.User.QuickCar.key,
    icon: <LucideCar />,
    element: <UserQuickCarPage />,
    layout: 'dashboard',
    roles: [RoleEnum.user],
  },
  {
    key: 'User.CompanyConfig',
    title: 'Company Config',
    path: RouteKey.User.CompanyConfig.key,
    icon: <LucideBuilding2 />,
    element: <UserCompanyConfigPage />,
    layout: 'dashboard',
    roles: [RoleEnum.user],
  },
  {
    key: 'User.CompanyCar',
    title: 'Company Car',
    path: RouteKey.User.CompanyCar.key,
    icon: <LucideCar />,
    element: <UserCompanyCarPage />,
    layout: 'dashboard',
    sidebar: false,
    roles: [RoleEnum.user],
  },
]);

export default USERROUTES;
