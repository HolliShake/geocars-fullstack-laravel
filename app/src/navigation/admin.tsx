import PlanConfigPage from '@/pages/admin/plan-config';
import PlanFeaturesPage from '@/pages/admin/plan-config/features/page';
import UserCompanyConfigPage from '@/pages/admin/user-company-config/page';
import UserConfigPage from '@/pages/admin/user-config/page';
import type { Route } from '@/types/route';
import { LucideBuilding2, LucideRocket, LucideUsers } from 'lucide-react';
import { RouteKey } from './route';

const ADMINROUTES: readonly Route[] = Object.freeze<Route[]>([
  {
    title: 'User Configuration',
    icon: <LucideUsers />,
    path: RouteKey.Admin.UserConfig.key,
    element: <UserConfigPage />,
    layout: 'dashboard',
  },
  {
    title: 'Company Configuration',
    icon: <LucideBuilding2 />,
    path: RouteKey.Admin.CompanyConfig.key,
    element: <UserCompanyConfigPage />,
    layout: 'dashboard',
  },
  {
    title: 'Plan Configuration',
    icon: <LucideRocket />,
    path: RouteKey.Admin.PlanConfig.key,
    element: <PlanConfigPage />,
    layout: 'dashboard',
  },
  // subdir
  {
    title: 'Plan Features',
    icon: <LucideRocket />,
    path: RouteKey.Admin.PlanFeatureConfig.key,
    element: <PlanFeaturesPage />,
    layout: 'dashboard',
    sidebar: false,
  },
]);

export default ADMINROUTES;
