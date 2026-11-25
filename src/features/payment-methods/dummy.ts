import type { SavedCard } from './types';

export const DUMMY_CARDS: SavedCard[] = [
  { id: 'card-1', brand: 'visa', last4: '4081', expiry: '09/28', isDefault: true },
  { id: 'card-2', brand: 'mastercard', last4: '5512', expiry: '02/27', isDefault: false },
];
