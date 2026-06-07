import { RoleEnum } from '@/constants/role.constant';
import RenterApplication from '@/pages/renter/browse/application/page';
import RenterBrowsePage from '@/pages/renter/browse/page';
import RenterCheckoutCancelPage from '@/pages/renter/checkout/cancel/page';
import RenterCheckoutSuccessPage from '@/pages/renter/checkout/success/page';
import RenterRentalDetailPage from '@/pages/renter/rental/detail/page';
import RenterRentalHistoryPage from '@/pages/renter/rental/page';
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
  {
    key: 'Renter.CheckoutSuccess',
    title: 'Payment success',
    icon: <Home />,
    path: RouteKey.Renter.CheckoutSuccess.key,
    element: <RenterCheckoutSuccessPage />,
    layout: 'topbar',
    roles: [RoleEnum.renter],
    sidebar: false,
  },
  {
    key: 'Renter.CheckoutCancel',
    title: 'Payment cancelled',
    icon: <Home />,
    path: RouteKey.Renter.CheckoutCancel.key,
    element: <RenterCheckoutCancelPage />,
    layout: 'topbar',
    roles: [RoleEnum.renter],
    sidebar: false,
  },
  {
    key: 'Renter.Rental',
    title: 'My Rentals',
    icon: <Home />,
    path: RouteKey.Renter.Renter.key,
    element: <RenterRentalHistoryPage />,
    layout: 'dashboard',
    roles: [RoleEnum.renter],
    sidebar: true,
  },
  {
    key: 'Renter.RentalDetail',
    title: 'Rental Details',
    icon: <Home />,
    path: RouteKey.Renter.RentalDetail.key,
    element: <RenterRentalDetailPage />,
    layout: 'dashboard',
    roles: [RoleEnum.renter],
    sidebar: false,
  },
]);

export default RENTERROUTES;
