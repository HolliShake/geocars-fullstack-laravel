import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import React, { useMemo } from 'react';

export type ModalState<T> = {
  isOpen: boolean;
  data: T | undefined;
  openFn: (data?: T) => void;
  closeFn: () => void;
};

// eslint-disable-next-line react-refresh/only-export-components
export function useModal<T>(): ModalState<T> {
  const [isOpen, setIsOpen] = React.useState(false);
  const [data, setData] = React.useState<T | undefined>(undefined);

  const openFn = (data: T | undefined) => {
    setData(data);
    setIsOpen(true);
  };

  const closeFn = () => {
    setData(undefined);
    setIsOpen(false);
  };

  return Object.freeze<ModalState<T>>({
    get data() {
      return data;
    },
    get isOpen() {
      return isOpen;
    },
    openFn,
    closeFn,
  });
}

type ModalComponentProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  controller: ModalState<any>;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'half' | 'full';
  className?: string;
  children?: React.ReactNode;
  closable?: boolean;
};

export default function Modal({
  controller,
  title = 'Modal',
  className = '',
  size = 'md',
  closable = false,
  children = undefined,
}: ModalComponentProps): React.ReactNode {
  const sizeClasses = useMemo(() => {
    switch (size) {
      case 'sm':
        return '!max-w-sm';
      case 'md':
        return '!max-w-md';
      case 'lg':
        return '!max-w-lg';
      case 'xl':
        return '!max-w-xl';
      case '2xl':
        return '!max-w-2xl';
      case '3xl':
        return '!max-w-3xl';
      case '4xl':
        return '!max-w-4xl';
      case '5xl':
        return '!max-w-5xl';
      case 'half':
        return '!max-w-[65vw]';
      case 'full':
        return '!max-w-[95vw] max-h-[95vh]';
      default:
        return '!max-w-md';
    }
  }, [size]);

  const handlePointerDownOutside = (e: Event) => {
    if (!closable) {
      e.preventDefault();
    }
  };

  const handleEscapeKeyDown = (e: KeyboardEvent) => {
    if (!closable) {
      e.preventDefault();
    }
  };

  return (
    <Dialog open={controller.isOpen} onOpenChange={controller.closeFn} modal>
      <DialogContent
        className={cn(
          'p-0 overflow-hidden flex flex-col rounded-xl bg-background w-full',
          'transition-all duration-300 ease-out',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          sizeClasses,
          size !== 'full' && 'max-h-[85vh]',
          className
        )}
        onPointerDownOutside={handlePointerDownOutside}
        onEscapeKeyDown={handleEscapeKeyDown}
      >
        {title && (
          <div className="px-6 py-4">
            <DialogTitle className={cn('text-lg leading-none tracking-tight')}>{title}</DialogTitle>
          </div>
        )}
        <div className={cn('flex-1 overflow-y-auto p-6', size === 'full' && 'p-8')}>{children}</div>
      </DialogContent>
    </Dialog>
  );
}
