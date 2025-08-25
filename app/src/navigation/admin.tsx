import { RoleEnum } from '@/constants/role.constant';
import AdminCompanyCarPage from '@/pages/admin/company-config/cars/page';
import AdminCompanyConfigPage from '@/pages/admin/company-config/page';
import AdminDashboardPage from '@/pages/admin/dashboard/page';
import AdminPlanConfigPage from '@/pages/admin/plan-config';
import AdminPlanFeaturePage from '@/pages/admin/plan-config/features/page';
import AdminUserConfigPage from '@/pages/admin/user-config/page';
import type { Route } from '@/types/route';
import {
  LucideBuilding2,
  LucideCar,
  LucideLayoutDashboard,
  LucideRocket,
  LucideUsers,
} from 'lucide-react';
import { RouteKey } from './route';

const ADMINROUTES: readonly Route[] = Object.freeze<Route[]>([
  {
    key: 'Admin.Dashboard',
    title: 'Dashboard',
    icon: <LucideLayoutDashboard />,
    path: RouteKey.Admin.Dashboard.key,
    element: <AdminDashboardPage />,
    layout: 'dashboard',
    roles: [RoleEnum.admin],
  },
  {
    key: 'Admin.UserConfig',
    title: 'User Configuration',
    icon: <LucideUsers />,
    path: RouteKey.Admin.UserConfig.key,
    element: <AdminUserConfigPage />,
    layout: 'dashboard',
    roles: [RoleEnum.admin],
  },
  {
    key: 'Admin.CompanyConfig',
    title: 'Company Configuration',
    icon: <LucideBuilding2 />,
    path: RouteKey.Admin.CompanyConfig.key,
    element: <AdminCompanyConfigPage />,
    layout: 'dashboard',
    roles: [RoleEnum.admin],
  },
  // subdir
  {
    key: 'Admin.CompanyCar',
    title: 'Company Car',
    icon: <LucideCar />,
    path: RouteKey.Admin.CompanyCar.key,
    element: <AdminCompanyCarPage />,
    layout: 'dashboard',
    sidebar: false,
    roles: [RoleEnum.admin],
  },
  {
    key: 'Admin.PlanConfig',
    title: 'Plan Configuration',
    icon: <LucideRocket />,
    path: RouteKey.Admin.PlanConfig.key,
    element: <AdminPlanConfigPage />,
    layout: 'dashboard',
    roles: [RoleEnum.admin],
  },
  // subdir
  {
    key: 'Admin.PlanFeatureConfig',
    title: 'Plan Features',
    icon: <LucideRocket />,
    path: RouteKey.Admin.PlanFeatureConfig.key,
    element: <AdminPlanFeaturePage />,
    layout: 'dashboard',
    sidebar: false,
    roles: [RoleEnum.admin],
  },
]);

export default ADMINROUTES;
