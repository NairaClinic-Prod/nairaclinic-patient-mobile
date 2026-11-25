import type { BiometricDevice } from './types';

const DAY = 86_400_000;
const at = (days: number) => new Date(Date.now() - days * DAY).toISOString();

export const DUMMY_DEVICES: BiometricDevice[] = [
  { id: 'dev-1', deviceName: 'iPhone', createdAt: at(40), lastUsedAt: at(1) },
];
