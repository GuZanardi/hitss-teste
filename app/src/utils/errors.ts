import axios from 'axios';

interface ApiErrorResponse {
  error?: {
    message?: string;
  };
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data.error?.message ?? error.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
