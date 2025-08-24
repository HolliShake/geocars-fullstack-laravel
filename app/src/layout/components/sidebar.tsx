import { Menu } from '@/components/custom/menu.component';
import { Button } from '@/components/ui/button';
import Routes from '@/navigation';
import { RouteKey } from '@/navigation/route';
import useAuthStore from '@/store/auth.store';
import type { Route } from '@/types/route';
import { LogOut, Settings, Wifi } from 'lucide-react';
import type React from 'react';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';

type SideBarProps = {
  isSidebarOpen: boolean;
  setIsSidebarOpen?: (isOpen: boolean) => void;
};

export default function SideBar({
  isSidebarOpen,
  setIsSidebarOpen = undefined,
}: SideBarProps): React.ReactNode {
  const location = useLocation();

  const navigate = useNavigate();

  const auth = useAuthStore();

  const isActiveRoute = (routePath: string) => {
    return location.pathname.startsWith(routePath);
  };

  const computedRoutes = useMemo(() => {
    return Routes.filter((route) => route.sidebar !== false);
  }, []);

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-30 w-72 
        bg-sidebar backdrop-blur-xl border-r border-sidebar-border
        transform transition-all duration-500 ease-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        shadow-2xl shadow-cyan-500/5
      `}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 opacity-95"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 animate-pulse"></div>

      {/* Header */}
      <div className="relative flex items-center justify-between h-20 px-6 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          {/* Logo with Web3 styling */}
          <div className="relative w-10 h-10 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <div className="w-6 h-6 bg-sidebar rounded-sm flex items-center justify-center">
              <div className="w-3 h-3 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-sm"></div>
            </div>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-cyan-400/20 to-purple-600/20 animate-pulse"></div>
          </div>

          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              GeoCars
            </h2>
            <p className="text-xs text-sidebar-foreground/70 font-medium">Web3 Platform</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen?.(false)}
          className="relative lg:hidden w-10 h-10 rounded-lg hover:bg-accent text-sidebar-foreground/70 hover:text-cyan-400 transition-all duration-300 hover:scale-110 border border-sidebar-border hover:border-cyan-500/30"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </Button>
      </div>

      {/* Navigation */}
      <nav className="relative p-3 space-y-3 flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted">
        {computedRoutes.map((route: Route, index: number) => {
          const isActive = isActiveRoute(route.path);

          return (
            <div key={index} className="space-y-2">
              <a
                href={route.path}
                className={`group relative flex items-center p-2 rounded-lg transition-all duration-300 ease-out border backdrop-blur-sm ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 border-cyan-500/30 text-cyan-400'
                    : 'hover:bg-accent border-transparent hover:border-sidebar-border'
                }`}
              >
                {/* Hover glow effect */}
                <div
                  className={`absolute inset-0 rounded-lg bg-gradient-to-r transition-all duration-500 ${
                    isActive
                      ? 'from-cyan-500/10 via-blue-500/10 to-purple-500/10'
                      : 'from-cyan-500/0 via-blue-500/0 to-purple-500/0 group-hover:from-cyan-500/10 group-hover:via-blue-500/10 group-hover:to-purple-500/10'
                  }`}
                ></div>

                {/* Active indicator */}
                <div
                  className={`absolute left-0 w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-r-full transition-all duration-300 shadow-lg shadow-cyan-500/50 ${
                    isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                ></div>

                {route.icon && (
                  <div
                    className={`relative flex items-center justify-center w-11 h-11 mr-4 rounded-lg border transition-all duration-300 ${
                      isActive
                        ? 'bg-accent border-cyan-500/30'
                        : 'bg-accent/30 group-hover:bg-accent border-sidebar-border group-hover:border-cyan-500/30'
                    }`}
                  >
                    <span
                      className={`transition-all duration-300 ${
                        isActive
                          ? 'text-cyan-700 scale-110'
                          : 'text-sidebar-foreground/70 group-hover:text-cyan-400 group-hover:scale-110'
                      }`}
                    >
                      {route.icon}
                    </span>
                    <div
                      className={`absolute inset-0 rounded-lg bg-gradient-to-br transition-all duration-300 ${
                        isActive
                          ? 'from-cyan-500/20 to-blue-500/20'
                          : 'from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/20 group-hover:to-blue-500/20'
                      }`}
                    ></div>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <span
                    className={`relative block text-sm font-medium transition-all duration-300 truncate ${
                      isActive
                        ? 'text-primary-foreground'
                        : 'text-sidebar-foreground group-hover:text-cyan-400'
                    }`}
                  >
                    {route.title}
                  </span>
                </div>

                <svg
                  className={`w-5 h-5 transition-all duration-300 ${
                    isActive
                      ? 'text-cyan-400 opacity-100 translate-x-1'
                      : 'text-sidebar-foreground/70 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>

              {/* Children routes */}
              {route.children && route.children.length > 0 && (
                <div className="ml-6 space-y-1">
                  {route.children.map((child: Route, childIndex: number) => {
                    const isChildActive = isActiveRoute(child.path);

                    return (
                      <a
                        key={childIndex}
                        href={child.path}
                        className={`group relative flex items-center p-3 rounded-md transition-all duration-200 border ${
                          isChildActive
                            ? 'bg-accent/70 border-cyan-500/30 text-cyan-400'
                            : 'hover:bg-accent border-transparent hover:border-sidebar-border'
                        }`}
                      >
                        <div
                          className={`absolute left-0 w-0.5 h-6 bg-gradient-to-b transition-all duration-200 rounded-full ${
                            isChildActive
                              ? 'from-cyan-400 to-blue-500'
                              : 'from-sidebar-foreground/30 to-sidebar-foreground/30 group-hover:from-cyan-400 group-hover:to-blue-500'
                          }`}
                        ></div>

                        {child.icon && (
                          <span
                            className={`flex items-center justify-center w-8 h-8 mr-3 transition-all duration-200 ${
                              isChildActive
                                ? 'text-cyan-400'
                                : 'text-sidebar-foreground/70 group-hover:text-cyan-400'
                            }`}
                          >
                            {child.icon}
                          </span>
                        )}

                        <span
                          className={`text-sm font-medium transition-colors truncate ${
                            isChildActive
                              ? 'text-cyan-400'
                              : 'text-sidebar-foreground/70 group-hover:text-sidebar-foreground'
                          }`}
                        >
                          {child.title}
                        </span>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Enhanced bottom section with Web3 styling */}
      <div className="relative p-4">
        <div className="relative p-4 bg-accent/50 rounded-lg border border-sidebar-border backdrop-blur-sm overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 animate-pulse"></div>

          <div className="relative flex items-center space-x-4">
            {/* Avatar with Web3 styling */}
            <div className="relative w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <div className="w-8 h-8 bg-sidebar rounded-md flex items-center justify-center">
                <div className="w-4 h-4 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full"></div>
              </div>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-cyan-400/20 to-purple-600/20 animate-pulse"></div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <div className="px-2 py-0.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full">
                  <span className="text-xs font-medium text-green-400">ACTIVE</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 mt-1">
                <Wifi className="w-3 h-3 text-green-400 animate-pulse" />
                <p className="text-xs text-sidebar-foreground/70">Connected to Web3</p>
              </div>
            </div>

            {/* Settings button */}
            <Menu
              icon={<Settings className="w-4 h-4" />}
              items={[
                {
                  label: 'Settings',
                  icon: <Settings className="w-4 h-4" />,
                  onClick: () => {
                    console.log('Settings');
                  },
                },
                {
                  label: 'Logout',
                  icon: <LogOut className="w-4 h-4" />,
                  onClick: () => {
                    auth.clearCredentials();
                    navigate(RouteKey.Auth.Login.key);
                  },
                },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-sidebar to-transparent pointer-events-none"></div>
    </aside>
  );
}
