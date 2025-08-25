import { useAuth } from '@/components/auth.provider';
import ThemeSwitcher from '@/components/custom/theme-switcher.component';
import CompanySelect from '@/components/shared/company-select.component';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RoleEnum } from '@/constants/role.constant';
import useSearchStore from '@/store/search.store';
import { Menu, Search } from 'lucide-react';
import type React from 'react';

type HeaderProps = {
  setIsSidebarOpen?: (isOpen: boolean) => void;
};

export default function Header({ setIsSidebarOpen = undefined }: HeaderProps): React.ReactNode {
  const search = useSearchStore();
  const { role } = useAuth();

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
          <ThemeSwitcher />
        </div>
      </div>

      {/* Bottom glow effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
    </header>
  );
}
