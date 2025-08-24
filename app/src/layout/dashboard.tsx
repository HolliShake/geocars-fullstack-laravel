import Providers from '@/components/providers';
import type React from 'react';
import { useState } from 'react';
import Header from './components/header';
import SideBar from './components/sidebar';

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps): React.ReactNode {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Providers>
      <div className="flex h-screen w-screen">
        {/* Mobile overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <SideBar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header setIsSidebarOpen={setIsSidebarOpen} />

          {/* Main content area */}
          <main className="flex-1 overflow-y-auto p-10">{children}</main>
        </div>
      </div>
    </Providers>
  );
}
