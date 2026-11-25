import { focusManager, QueryClient } from '@tanstack/react-query';
import { AppState } from 'react-native';
import { ApiError } from './http';

// Tells React Query when the app is in the foreground, so polling pauses in the background
// and everything stale refreshes when the patient comes back.
AppState.addEventListener('change', (state) => focusManager.setFocused(state === 'active'));

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (count, error) =>
        count < 2 && !(error instanceof ApiError && error.status >= 400 && error.status < 500),
    },
    mutations: { retry: false },
  },
});
