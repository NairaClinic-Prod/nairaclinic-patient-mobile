import * as SecureStore from 'expo-secure-store';

const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export const KEYS = {
  session: 'nc_session',
  biometrics: 'nc_biometrics',
  lastPhone: 'nc_last_phone',
  biometricsOffered: 'nc_biometrics_offered',
} as const;

type Key = (typeof KEYS)[keyof typeof KEYS];

export async function readSecure<T>(key: Key): Promise<T | null> {
  try {
    const raw = await SecureStore.getItemAsync(key, OPTIONS);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function writeSecure(key: Key, value: unknown) {
  await SecureStore.setItemAsync(key, JSON.stringify(value), OPTIONS);
}

export async function removeSecure(key: Key) {
  try {
    await SecureStore.deleteItemAsync(key, OPTIONS);
  } catch {}
}
