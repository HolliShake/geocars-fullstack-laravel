import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import Routes from '@/navigation';
import type { Route } from './types/route';
import DashboardLayout from './layout/dashboard';
import DefaultLayout from './layout/default';

const router = createBrowserRouter(
  Routes.map((data: Route) => ({
    path: data.path,
    index: data.index === true,
    element:
      data.layout === 'dashboard' ? (
        <DashboardLayout>{data.element}</DashboardLayout>
      ) : (
        <DefaultLayout>{data.element}</DefaultLayout>
      ),
  }))
);

function App(): React.ReactNode {
  return <RouterProvider router={router} />;
}

export default App;
