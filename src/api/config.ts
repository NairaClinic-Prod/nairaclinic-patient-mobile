export { API_URL } from '@/lib/env';

export const REQUEST_TIMEOUT_MS = 20_000;

// Lets the server's bot check know this is the real app, which cannot solve a browser challenge.
export const MOBILE_APP_KEY = process.env.EXPO_PUBLIC_MOBILE_APP_KEY?.trim() || undefined;
