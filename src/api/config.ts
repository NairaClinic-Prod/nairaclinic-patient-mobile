import Constants from 'expo-constants';

const PRODUCTION_API = 'https://api.nairaclinic.com/api/v1';
const DEV_API_PORT = 3004;

// In development the phone reaches the backend on the same machine as the Expo server.
function devApiUrl() {
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  return host ? `http://${host}:${DEV_API_PORT}/api/v1` : `http://localhost:${DEV_API_PORT}/api/v1`;
}

export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL || (__DEV__ ? devApiUrl() : PRODUCTION_API)
).replace(/\/+$/, '');

export const REQUEST_TIMEOUT_MS = 20_000;
