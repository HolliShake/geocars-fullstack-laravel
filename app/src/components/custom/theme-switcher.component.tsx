import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import type { Theme } from '@/types/theme';
import { Moon, Sun } from 'lucide-react';
import type React from 'react';

export default function ThemeSwitcher(): React.ReactNode {
  const { theme, setTheme } = useTheme();

  const themes = [
    { name: 'light', icon: Sun, label: 'Light' },
    { name: 'dark', icon: Moon, label: 'Dark' },
  ] as const;

  return (
    <div className="relative group">
      <div className="flex items-center space-x-1 p-1 rounded-lg bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg">
        {/* Gradient background overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 rounded-lg pointer-events-none" />

        {themes.map(({ name, icon: Icon, label }) => (
          <Button
            key={name}
            variant="ghost"
            size="sm"
            onClick={() => {
              setTheme(name as Theme);
            }}
            className={`
              relative z-10 h-8 w-8 p-0 rounded-md transition-all duration-300 hover:scale-105
              ${
                theme === name
                  ? 'bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 text-white shadow-lg shadow-cyan-500/25'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }
            `}
            aria-label={`Switch to ${label} theme`}
          >
            <Icon className="h-4 w-4" />
            {theme === name && (
              <div className="absolute inset-0 rounded-md bg-gradient-to-br from-cyan-400/20 to-purple-600/20 animate-pulse pointer-events-none" />
            )}
          </Button>
        ))}
      </div>

      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none -z-10" />
    </div>
  );
}
