import { createStore } from '@/lib/store';
import type { OrderKind } from './types';

export type MakeOrderRequest = {
  open: boolean;
  nonce: number;
  kind: OrderKind | null;
  sourceId: string | null;
  names: string[] | null;
};

const store = createStore<MakeOrderRequest>({
  open: false,
  nonce: 0,
  kind: null,
  sourceId: null,
  names: null,
});

export const useMakeOrderRequest = store.use;

type OpenOptions = { kind?: OrderKind; sourceId?: string; names?: string[] };

// Anything can start an order: a bare call asks "medicines or a test?", a kind skips that, a source and names preselect.
export function openMakeOrder(options: OpenOptions = {}) {
  store.set((state) => ({
    open: true,
    nonce: state.nonce + 1,
    kind: options.kind ?? null,
    sourceId: options.sourceId ?? null,
    names: options.names ?? null,
  }));
}

export function closeMakeOrder() {
  store.set((state) => ({ ...state, open: false }));
}
