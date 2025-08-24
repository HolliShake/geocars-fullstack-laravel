/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AxiosError, AxiosResponse } from 'axios';

export function getError(error: AxiosError | Error | any): Record<string, string[]> {
  if (error.response) {
    const response = error.response as AxiosResponse;

    // Validation errors (422) → return the errors bag directly
    if (response.status === 422 && response.data?.errors) {
      return response.data.errors as Record<string, string[]>;
    }

    // Other HTTP errors → normalize into { general: [message] }
    const message = response.data?.message || response.statusText || 'HTTP Error';

    return { general: [message] };
  }

  // Fallback for non-Axios errors → normalize into { general: [message] }
  return {
    general: [error.message || 'An unexpected error occurred'],
  };
}

export function renderError(
  error: AxiosError | Error | any,
  callback: (key: string | any, error: string | any) => void
) {
  const errors = getError(error);
  Object.entries(errors).forEach(([key, messages]) => {
    messages.forEach((message) => {
      callback(key, {
        type: 'value',
        message: message,
      });
    });
  });
}
