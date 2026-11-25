import { createStore } from '@/lib/store';

const store = createStore({ open: false });

export const useSignOutConfirm = store.useValue;
export const confirmSignOut = () => store.set({ open: true });
export const closeSignOutConfirm = () => store.set({ open: false });
