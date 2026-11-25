import { createStore } from '@/lib/store';
import { DUMMY_CARDS } from './dummy';

const store = createStore({ cards: DUMMY_CARDS }, { persist: 'payment-methods', scope: 'account' });

export const useCards = store.use;

export function makeDefaultCard(id: string) {
  store.set((state) => ({
    cards: state.cards.map((card) => ({ ...card, isDefault: card.id === id })),
  }));
}

export function removeCard(id: string) {
  store.set((state) => {
    const cards = state.cards.filter((card) => card.id !== id);
    const hasDefault = cards.some((card) => card.isDefault);
    return {
      cards: cards.map((card, index) => ({
        ...card,
        isDefault: hasDefault ? card.isDefault : index === 0,
      })),
    };
  });
}
