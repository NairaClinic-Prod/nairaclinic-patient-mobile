import { addCard, makeDefaultMethod, removeMethod, useMethodsQuery } from '@/api/payments';
import { createStore } from '@/lib/store';
import * as React from 'react';
import { Alert } from 'react-native';
import type { SavedCard } from './types';

// The last cards the server sent, so the list has something to show while offline.
const saved = createStore<{ cards: SavedCard[]; savedAt: number }>(
  { cards: [], savedAt: 0 },
  { persist: 'payment-methods-v2', scope: 'account' }
);

export function useCards() {
  const snapshot = saved.use();
  const query = useMethodsQuery();

  React.useEffect(() => {
    if (query.data) saved.set({ cards: query.data, savedAt: Date.now() });
  }, [query.data]);

  return {
    cards: query.data ?? snapshot.cards,
    loading: query.isPending && !snapshot.savedAt,
    failed: query.isError && !snapshot.savedAt,
  };
}

const tell = (title: string) => (error: unknown) =>
  Alert.alert(title, error instanceof Error ? error.message : 'Please try again.');

export const makeDefaultCard = (id: string) =>
  makeDefaultMethod(id).catch(tell("Couldn't change your default card"));

export const removeCard = (id: string) => removeMethod(id).catch(tell("Couldn't remove the card"));

// Opens Paystack's page for the small refunded charge that lets us keep the card.
export async function startAddCard() {
  try {
    const { added } = await addCard();
    Alert.alert(
      added ? 'Card added' : 'Card not added',
      added
        ? 'Your card is saved. The small charge is refunded, and your bank may take a few days to show it.'
        : "We didn't see a new card. If you completed the payment, pull down to refresh in a moment."
    );
  } catch (error) {
    tell("Couldn't add the card")(error);
  }
}
