import { createStore } from '@/lib/store';

const store = createStore({ requestId: null as string | null, nonce: 0 });

export const useRequestOpener = store.useValue;

// Asks the Orders tab to open one request's pharmacy replies.
export const showRequest = (requestId: string) =>
  store.set((state) => ({ requestId, nonce: state.nonce + 1 }));
