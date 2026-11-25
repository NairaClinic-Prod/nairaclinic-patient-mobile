import { createStore } from '@/lib/store';

const store = createStore({ requestId: null as string | null, nonce: 0 });
const labStore = createStore({ labRequestId: null as string | null, nonce: 0 });

export const useRequestOpener = store.useValue;
export const useLabRequestOpener = labStore.useValue;

// Asks the Orders tab to open one request's pharmacy replies.
export const showRequest = (requestId: string) =>
  store.set((state) => ({ requestId, nonce: state.nonce + 1 }));

// Asks the Orders tab to open one lab price request's replies.
export const showLabRequest = (requestId: string) =>
  labStore.set((state) => ({ labRequestId: requestId, nonce: state.nonce + 1 }));
