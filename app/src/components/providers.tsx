/* eslint-disable @typescript-eslint/no-explicit-any */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'sonner';
import AuthProvider from './auth.provider';
import { ConfirmProvider } from './confirm.provider';
import { ThemeProvider } from './theme.provider';
import { Toaster } from './ui/sonner';

const captureErrorMessage = (error: any): string => {
  // Check for Axios/HTTP response errors
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  if (error?.response?.data) {
    return typeof error.response.data === 'string'
      ? error.response.data
      : JSON.stringify(error.response.data);
  }

  // Check for network/request errors
  if (error?.request && !error?.response) {
    return 'Network error - please check your connection';
  }

  // Check for standard Error objects
  if (error?.message) {
    return error.message;
  }

  // Check for string errors
  if (typeof error === 'string') {
    return error;
  }

  // Check for objects with error property
  if (error?.error) {
    return typeof error.error === 'string' ? error.error : JSON.stringify(error.error);
  }

  // Try to stringify if it's an object
  if (typeof error === 'object' && error !== null) {
    try {
      return JSON.stringify(error);
    } catch {
      return error.toString();
    }
  }

  // Fallback for any other cases
  return 'An unexpected error occurred';
};

export default function Providers({ children }: { children: React.ReactNode }): React.ReactNode {
  const query = new QueryClient({
    defaultOptions: {
      queries: {
        throwOnError(error) {
          toast.error(captureErrorMessage(error));
          return false;
        },
      },
      mutations: {
        throwOnError(error) {
          toast.error(captureErrorMessage(error));
          return false;
        },
      },
    },
  });
  return (
    <ThemeProvider>
      <QueryClientProvider client={query}>
        <AuthProvider>
          <ConfirmProvider>{children}</ConfirmProvider>
        </AuthProvider>
      </QueryClientProvider>
      <Toaster position="top-right" richColors />
    </ThemeProvider>
  );
}
