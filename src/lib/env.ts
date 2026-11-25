import Constants from 'expo-constants';

export type AppEnv = 'local' | 'development' | 'production';

const clean = (value: string | undefined) => value?.trim().replace(/\/+$/, '') || undefined;

// local: this Mac, on the same address the Expo server uses. development: the shared dev servers.
// production: the live app. Set EXPO_PUBLIC_APP_ENV to choose; a debug build defaults to local.
export const APP_ENV: AppEnv = (() => {
  const chosen = process.env.EXPO_PUBLIC_APP_ENV;
  if (chosen === 'local' || chosen === 'development' || chosen === 'production') return chosen;
  return __DEV__ ? 'local' : 'production';
})();

const host = Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost';

const ADDRESSES: Record<AppEnv, { api: string; site: string }> = {
  local: {
    api: `http://${host}:3004/api/v1`,
    site: `http://${host}:3001`,
  },
  development: {
    api:
      clean(process.env.EXPO_PUBLIC_DEVELOPMENT_API_URL) ??
      'https://nairaclinic-api.outray.app/api/v1',
    site:
      clean(process.env.EXPO_PUBLIC_DEVELOPMENT_SITE_URL) ??
      'https://nairaclinic-patient-dev.outray.app',
  },
  production: {
    api: 'https://api.nairaclinic.com/api/v1',
    site: 'https://www.nairaclinic.com',
  },
};

// The backend and the patient website for this environment. They always come as a pair, so a payment
// started on one backend returns to the website that talks to that same backend.
export const API_URL = clean(process.env.EXPO_PUBLIC_API_URL) ?? ADDRESSES[APP_ENV].api;
export const SITE_URL = clean(process.env.EXPO_PUBLIC_PATIENT_APP_URL) ?? ADDRESSES[APP_ENV].site;
