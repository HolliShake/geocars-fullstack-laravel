import { RoleEnum } from '@/constants/role.constant';
import AdminPlanConfigPage from '@/pages/admin/plan-config';
import AdminPlanFeaturesPage from '@/pages/admin/plan-config/features/page';
import AdminUserCompanyConfigPage from '@/pages/admin/user-company-config/page';
import AdminUserConfigPage from '@/pages/admin/user-config/page';
import type { Route } from '@/types/route';
import { LucideBuilding2, LucideRocket, LucideUsers } from 'lucide-react';
import { RouteKey } from './route';

const ADMINROUTES: readonly Route[] = Object.freeze<Route[]>([
  {
    title: 'User Configuration',
    icon: <LucideUsers />,
    path: RouteKey.Admin.UserConfig.key,
    element: <AdminUserConfigPage />,
    layout: 'dashboard',
    roles: [RoleEnum.admin],
  },
  {
    title: 'Company Configuration',
    icon: <LucideBuilding2 />,
    path: RouteKey.Admin.CompanyConfig.key,
    element: <AdminUserCompanyConfigPage />,
    layout: 'dashboard',
    roles: [RoleEnum.admin],
  },
  {
    title: 'Plan Configuration',
    icon: <LucideRocket />,
    path: RouteKey.Admin.PlanConfig.key,
    element: <AdminPlanConfigPage />,
    layout: 'dashboard',
    roles: [RoleEnum.admin],
  },
  // subdir
  {
    title: 'Plan Features',
    icon: <LucideRocket />,
    path: RouteKey.Admin.PlanFeatureConfig.key,
    element: <AdminPlanFeaturesPage />,
    layout: 'dashboard',
    sidebar: false,
    roles: [RoleEnum.admin],
  },
]);

export default ADMINROUTES;
