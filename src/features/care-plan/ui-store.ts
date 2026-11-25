import { createStore } from '@/lib/store';

type Sheet = 'upload' | 'attached' | 'lab-link' | null;

type State = {
  sheet: Sheet;
  encounterId: string | null;
  // A single test the sheet was opened from, so it starts with that test picked.
  testId: string | null;
};

const store = createStore<State>({ sheet: null, encounterId: null, testId: null });

export const useCarePlanUi = store.use;

export const openUploadResults = (encounterId: string, testId: string | null = null) =>
  store.set({ sheet: 'upload', encounterId, testId });

export const openAttachedResults = (encounterId: string) =>
  store.set({ sheet: 'attached', encounterId, testId: null });

export const openLabLink = (encounterId: string, testId: string | null = null) =>
  store.set({ sheet: 'lab-link', encounterId, testId });

// The ids stay while a sheet slides away, so its content doesn't vanish mid-animation.
export const closeCarePlanSheet = () => store.set((state) => ({ ...state, sheet: null }));
