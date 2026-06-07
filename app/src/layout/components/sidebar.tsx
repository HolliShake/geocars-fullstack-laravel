import { useAuth } from '@/components/auth.provider';
import { Menu } from '@/components/custom/menu.component';
import { Button } from '@/components/ui/button';
import Routes from '@/navigation';
import { RouteKey } from '@/navigation/route';
import useAuthStore from '@/store/auth.store';
import type { Role } from '@/types/role';
import type { Route } from '@/types/route';
import { useLogout } from '@rest/api';
import { LogOut, Settings2, User } from 'lucide-react';
import type React from 'react';
import { useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';

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

  const { initialized, isLoggedIn, role } = useAuth();

  const { mutateAsync: logoutAsync } = useLogout();

  const auth = useAuthStore();

  const isActiveRoute = (routePath: string) => {
    return location.pathname.startsWith(routePath);
  };

  const isLoading = useMemo(() => {
    return !initialized || !isLoggedIn;
  }, [initialized, isLoggedIn]);

  const computedRoutes = useMemo(() => {
    if (isLoading) return [];
    return Routes.filter((route) => {
      if (!route.sidebar) return false;
      // No roles means public route
      if (!route.roles || route.roles.length === 0) return true;
      // Check if user has one of the required roles
      return (route.roles ?? []).some((r: Role) => r === role);
    });
  }, [isLoading, role]);

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-30 w-72 
        bg-sidebar border-r border-sidebar-border
        transform transition-all duration-500 ease-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        shadow-sm
      `}
    >
      {/* Header */}
      <div className="relative flex items-center justify-between h-20 px-6 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg border border-sidebar-border bg-accent flex items-center justify-center">
            <span className="text-sm font-semibold text-sidebar-foreground">GC</span>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-sidebar-foreground">GeoCars</h2>
            <p className="text-xs text-sidebar-foreground/70">Management</p>
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
      <nav className="relative p-3 space-y-1 flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted">
        {isLoading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="group relative flex items-center p-2 rounded-lg border border-transparent"
              >
                <div className="relative flex items-center justify-center w-11 h-11 mr-4 rounded-lg border border-sidebar-border bg-accent/30">
                  <div className="w-5 h-5 bg-gradient-to-r from-muted via-muted-foreground/20 to-muted rounded animate-pulse"></div>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-gradient-to-r from-muted via-muted-foreground/20 to-muted rounded animate-pulse"></div>
                  <div className="h-3 w-3/4 bg-gradient-to-r from-muted via-muted-foreground/20 to-muted rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {computedRoutes.map((route: Route, index: number) => {
          const isActive = isActiveRoute(route.path);

          return (
            <div key={index} className="space-y-1">
              <Link
                to={route.path}
                className={`group flex items-center p-1.5 rounded-md transition-colors duration-200 border ${
                  isActive
                    ? 'bg-accent border-sidebar-border text-sidebar-foreground'
                    : 'hover:bg-accent border-transparent text-sidebar-foreground/80'
                }`}
              >
                {route.icon && (
                  <div
                    className={`flex items-center justify-center p-1.5 mr-3 rounded-md border transition-colors duration-200 ${
                      isActive
                        ? 'bg-background border-sidebar-border'
                        : 'bg-accent/30 border-sidebar-border'
                    }`}
                  >
                    <span
                      className={`transition-colors duration-200 ${
                        isActive
                          ? 'text-sidebar-foreground'
                          : 'text-sidebar-foreground/70 group-hover:text-sidebar-foreground'
                      }`}
                    >
                      {route.icon}
                    </span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <span
                    className={`block text-sm font-medium transition-colors duration-200 truncate ${
                      isActive
                        ? 'text-sidebar-foreground'
                        : 'text-sidebar-foreground/80 group-hover:text-sidebar-foreground'
                    }`}
                  >
                    {route.title}
                  </span>
                </div>

                <svg
                  className={`w-4 h-4 transition-opacity duration-200 ${
                    isActive
                      ? 'text-sidebar-foreground opacity-100'
                      : 'text-sidebar-foreground/60 opacity-0 group-hover:opacity-100'
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
              </Link>

              {/* Children routes */}
              {route.children && route.children.length > 0 && (
                <div className="ml-4 space-y-0.5">
                  {route.children.map((child: Route, childIndex: number) => {
                    const isChildActive = isActiveRoute(child.path);

                    return (
                      <Link
                        key={childIndex}
                        to={child.path}
                        className={`group relative flex items-center p-2 rounded-sm transition-all duration-200 border ${
                          isChildActive
                            ? 'bg-accent/70 border-cyan-500/50 text-cyan-400'
                            : 'hover:bg-accent border-transparent hover:border-sidebar-border'
                        }`}
                      >
                        <div
                          className={`absolute left-0 w-0.5 h-5 bg-gradient-to-b transition-all duration-200 rounded-full ${
                            isChildActive
                              ? 'from-sidebar-foreground to-sidebar-foreground'
                              : 'from-sidebar-foreground/30 to-sidebar-foreground/30'
                          }`}
                        ></div>

                        {child.icon && (
                          <span
                            className={`flex items-center justify-center w-6 h-6 mr-2 transition-all duration-200 ${
                              isChildActive
                                ? 'text-sidebar-foreground'
                                : 'text-sidebar-foreground/70 group-hover:text-sidebar-foreground'
                            }`}
                          >
                            {child.icon}
                          </span>
                        )}

                        <span
                          className={`text-xs font-medium transition-colors truncate ${
                            isChildActive
                              ? 'text-sidebar-foreground'
                              : 'text-sidebar-foreground/70 group-hover:text-sidebar-foreground'
                          }`}
                        >
                          {child.title}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom profile actions */}
      <div className="relative p-4">
        <div className="p-4 bg-accent/40 rounded-lg border border-sidebar-border">
          <div className="relative flex items-center space-x-4">
            <div className="w-12 h-12 rounded-lg border border-sidebar-border bg-background flex items-center justify-center">
              <User className="w-5 h-5 text-sidebar-foreground/70" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <div className="px-2 py-0.5 bg-green-500/10 border border-green-500/30 rounded-full">
                  <span className="text-xs font-medium text-green-600">Online</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 mt-1">
                <p className="text-xs text-sidebar-foreground/70">Account settings</p>
              </div>
            </div>

            {/* Settings button */}
            <Menu
              icon={<Settings2 className="w-4 h-4" />}
              items={[
                {
                  label: 'Profile',
                  icon: <User className="w-4 h-4" />,
                  onClick: () => {
                    navigate(RouteKey.Auth.Profile.key);
                  },
                },
                {
                  label: 'Logout',
                  icon: <LogOut className="w-4 h-4" />,
                  onClick: async () => {
                    try {
                      await logoutAsync();
                      auth.clearCredentials();
                    } catch (error) {
                      console.error(error);
                    }
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
