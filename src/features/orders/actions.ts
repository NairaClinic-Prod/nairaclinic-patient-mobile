import { ApiError } from '@/api/client';
import { Alert } from 'react-native';

export const messageOf = (error: unknown, fallback = 'Something went wrong. Please try again.') =>
  error instanceof ApiError || error instanceof Error ? error.message || fallback : fallback;

// Runs an action and tells the patient plainly if it fails. Resolves to the result, or undefined.
export async function attempt<T>(title: string, run: () => Promise<T>): Promise<T | undefined> {
  try {
    return await run();
  } catch (error) {
    Alert.alert(title, messageOf(error));
    return undefined;
  }
}
