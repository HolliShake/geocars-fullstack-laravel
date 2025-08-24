import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { MoreVertical } from 'lucide-react';

type MenuItem = {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
};

interface MenuProps {
  icon?: React.ReactNode;
  items: MenuItem[];
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'outline';
  className?: string;
}

export function Menu({
  items,
  icon = <MoreVertical className={cn('transition-transform duration-300 h-4 w-4')} />,
  size = 'md',
  variant = 'ghost',
  className,
}: MenuProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size="icon"
          className={cn(
            'relative rounded-lg transition-all duration-300 ease-out',
            'hover:scale-110 hover:shadow-lg',
            'border border-transparent hover:border-border',
            'backdrop-blur-sm',
            sizeClasses[size],
            variant === 'ghost' && 'hover:bg-accent/50 hover:text-accent-foreground',
            variant === 'outline' && 'border-border hover:bg-accent/30',
            className
          )}
        >
          {icon}

          {/* Subtle glow effect on hover */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/0 via-blue-500/0 to-purple-500/0 opacity-0 transition-all duration-300 hover:from-cyan-500/10 hover:via-blue-500/10 hover:to-purple-500/10 hover:opacity-100" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className={cn(
          'min-w-48 p-2 rounded-lg backdrop-blur-xl',
          'bg-popover/95 border border-border shadow-2xl',
          'shadow-cyan-500/5',
          'animate-in fade-in-0 zoom-in-95 slide-in-from-top-2',
          'duration-300 ease-out'
        )}
      >
        {items.map((item, index) => (
          <DropdownMenuItem
            key={index}
            onClick={(e) => {
              if (!item.disabled) {
                item.onClick?.();
              }
              e.stopPropagation();
            }}
            disabled={item.disabled}
            className={cn(
              'group relative flex items-center gap-3 px-3 py-2.5 rounded-md',
              'cursor-pointer transition-all duration-200 ease-out',
              'text-sm font-medium',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
              item.variant === 'destructive'
                ? 'text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10'
                : 'text-popover-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent',
              item.disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent'
            )}
          >
            {/* Hover gradient effect */}
            <div
              className={cn(
                'absolute inset-0 rounded-md opacity-0 transition-all duration-300',
                'group-hover:opacity-100',
                item.variant === 'destructive'
                  ? 'bg-gradient-to-r from-red-500/5 to-red-600/5'
                  : 'bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5',
                item.disabled && 'group-hover:opacity-0'
              )}
            />

            {item.icon && (
              <span
                className={cn(
                  'relative flex items-center justify-center transition-all duration-200',
                  'group-hover:scale-110',
                  item.variant === 'destructive' && 'text-destructive',
                  item.disabled && 'group-hover:scale-100'
                )}
              >
                {item.icon}
              </span>
            )}

            <span className="relative font-medium">{item.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
