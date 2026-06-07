import { useAuth } from '@/components/auth.provider';
import { Menu as OptionMenu } from '@/components/custom/menu.component';
import ThemeSwitcher from '@/components/custom/theme-switcher.component';
import CompanySelect from '@/components/shared/company-select.component';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RoleEnum } from '@/constants/role.constant';
import { RouteKey } from '@/navigation/route';
import useAuthStore from '@/store/auth.store';
import useSearchStore from '@/store/search.store';
import { useLogout } from '@rest/api';
import { Car, LogOut, Menu, Search, Settings2, User } from 'lucide-react';
import type React from 'react';
import { useNavigate } from 'react-router';

type HeaderProps = {
  setIsSidebarOpen?: (isOpen: boolean) => void;
};

export default function TopBar({ setIsSidebarOpen = undefined }: HeaderProps): React.ReactNode {
  const search = useSearchStore();
  const { role } = useAuth();

  const { mutateAsync: logoutAsync } = useLogout();

  const auth = useAuthStore();
  const navigate = useNavigate();

  return (
    <header className="relative h-20 flex items-center px-6 backdrop-blur-xl border-b border-border shadow-lg shadow-cyan-500/5">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 animate-pulse"></div>

      <div className="relative flex items-center justify-between w-full">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen?.(true)}
          className="lg:hidden w-12 h-12 rounded-lg hover:bg-accent text-foreground/70 hover:text-cyan-400 transition-all duration-300 hover:scale-110 border border-border hover:border-cyan-500/30"
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Search section */}
        <div className="flex-1 max-w-md mx-6 lg:mx-0">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-cyan-400 transition-colors duration-300" />
            <Input
              placeholder="Search across the platform..."
              value={search.searchQuery}
              onChange={(e) => search.setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-background/50 backdrop-blur-sm border-border focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 rounded-lg"
            />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/0 via-blue-500/0 to-purple-500/0 group-focus-within:from-cyan-500/10 group-focus-within:via-blue-500/10 group-focus-within:to-purple-500/10 transition-all duration-500 pointer-events-none"></div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex flex-row items-center gap-2">
          {role === RoleEnum.user && <CompanySelect />}
          <OptionMenu
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
                label: 'My Rentals',
                icon: <Car className="w-4 h-4" />,
                onClick: () => {
                  navigate(RouteKey.Renter.Renter.key);
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
          <ThemeSwitcher />
        </div>
      </div>

      {/* Bottom glow effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
    </header>
  );
}
