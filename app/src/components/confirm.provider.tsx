/* eslint-disable react-refresh/only-export-components */
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

interface ConfirmContextProps {
  confirm: (onConfirm: () => Promise<void> | void, title?: string, description?: string) => void;
}

const ConfirmContext = createContext<ConfirmContextProps | undefined>(undefined);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error('useConfirm must be used within a ConfirmProvider');
  return context;
};

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [onConfirm, setOnConfirm] = useState<() => Promise<void> | void>(() => () => {});
  const [isProcessing, setIsProcessing] = useState(false);
  const [title, setTitle] = useState<string>('Confirm Action?');
  const [description, setDescription] = useState<string>('This action cannot be undone.');
  const [animateShake, setAnimateShake] = useState(false);

  const confirm = (
    onConfirm: () => Promise<void> | void,
    customTitle?: string,
    customDescription?: string
  ) => {
    setOnConfirm(() => onConfirm);
    setTitle(customTitle || 'Confirm Action?');
    setDescription(customDescription || 'This action cannot be undone.');
    setIsOpen(true);
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error('Operation failed:', error);
      // Add shake animation on error
      setAnimateShake(true);
      setTimeout(() => setAnimateShake(false), 500);
    } finally {
      setIsProcessing(false);
      setIsOpen(false);
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Dialog open={isOpen} onOpenChange={(open) => !isProcessing && setIsOpen(open)}>
        <DialogContent
          className={cn(
            'block max-w-md sm:max-w-[500px] rounded-2xl p-6 shadow-lg border border-destructive/10',
            'transform transition-all duration-200 ease-in-out',
            animateShake && 'animate-shake',
            isProcessing && 'opacity-95'
          )}
          onEscapeKeyDown={(e) => isProcessing && e.preventDefault()}
          onPointerDownOutside={(e) => isProcessing && e.preventDefault()}
        >
          <DialogHeader className="">
            <DialogTitle className="sr-only">Confirm Action</DialogTitle>
            <DialogDescription className="sr-only">
              A confirmation dialog to confirm an action.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 text-center space-y-4">
            <div
              className="relative mx-auto w-28 h-28 flex items-center justify-center 
                                                                                bg-destructive/5 rounded-full p-4 mb-2 transition-all
                                                                                group-hover:bg-destructive/10"
            >
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mx-auto transition-transform duration-200 group-hover:scale-110 text-destructive"
              >
                <path
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-destructive">{title}</h2>

            <p className="text-muted-foreground text-sm">{description}</p>
          </div>

          <div className="flex justify-center gap-3 mt-2 pt-2 border-t">
            <DialogClose asChild>
              <Button
                type="button"
                color="secondary"
                variant="outline"
                className="min-w-24 transition-all duration-200"
                onClick={() => setIsOpen(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              color="destructive"
              className={cn(
                'min-w-24 transition-all duration-200',
                isProcessing ? 'opacity-90' : 'hover:bg-destructive/90'
              )}
              disabled={isProcessing}
              onClick={handleConfirm}
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </span>
              ) : (
                'Confirm'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  );
};
