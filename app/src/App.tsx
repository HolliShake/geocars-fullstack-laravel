import Routes from '@/navigation';
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import DashboardLayout from './layout/dashboard';
import DefaultLayout from './layout/default';
import type { Route } from './types/route';

const router = createBrowserRouter(
  Routes.map((data: Route) => ({
    key: data.title,
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
