import { RoleEnum } from '@/constants/role.constant';
import UserQuickCarPage from '@/pages/user/car-management/page';
import UserCarPostingPage from '@/pages/user/car-posting/page';
import UserCarRentalPage from '@/pages/user/car-rental/page';
import UserCompanyCarPage from '@/pages/user/company-config/cars/page';
import UserCompanyConfigPage from '@/pages/user/company-config/page';
import UserDashboardPage from '@/pages/user/dashboard/page';
import type { Route } from '@/types/route';
import {
  LucideBuilding2,
  LucideCar,
  LucideLayoutDashboard,
  LucideMapPinPlus,
  LucidePodcast,
} from 'lucide-react';
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
    key: 'User.CarRental',
    title: 'Car Rental',
    path: RouteKey.User.CarRental.key,
    icon: <LucideMapPinPlus />,
    element: <UserCarRentalPage />,
    layout: 'dashboard',
    roles: [RoleEnum.user],
  },
  {
    key: 'User.CarPosting',
    title: 'Car Posting',
    path: RouteKey.User.CarPosting.key,
    icon: <LucidePodcast />,
    element: <UserCarPostingPage />,
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
