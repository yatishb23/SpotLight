import { useCallback } from 'react';
import { toast } from 'sonner';

export function useApiError() {
  const handleError = useCallback((error: unknown, defaultMessage = 'Something went wrong') => {
    let message = defaultMessage;

    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      message = (error as { message: string }).message;
    }

    toast.error(message);
    console.error('[v0] API Error:', error);

    return message;
  }, []);

  return { handleError };
}
