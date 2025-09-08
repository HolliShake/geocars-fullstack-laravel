import Routes from '@/navigation';
import React from 'react';
import { createBrowserRouter, RouterProvider, type RouteObject } from 'react-router';
import DashboardLayout from './layout/dashboard';
import DefaultLayout from './layout/default';
import TopbarLayout from './layout/topbar';
import type { Route } from './types/route';

const router = createBrowserRouter(
  Routes.map<RouteObject>((data: Route) => ({
    key: data.key,
    path: data.path,
    index: data.index === true,
    element:
      data.layout === 'dashboard' ? (
        <DashboardLayout>{data.element}</DashboardLayout>
      ) : data.layout === 'topbar' ? (
        <TopbarLayout>{data.element}</TopbarLayout>
      ) : (
        <DefaultLayout>{data.element}</DefaultLayout>
      ),
  }))
);

function App(): React.ReactNode {
  return <RouterProvider router={router} />;
}

export default App;
