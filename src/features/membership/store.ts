import { createStore } from '@/lib/store';
import { DUMMY_CURRENT_PLAN } from './dummy';
import type { CurrentPlan } from './types';

const store = createStore<{ current: CurrentPlan | null }>({ current: DUMMY_CURRENT_PLAN });

export const useMembership = store.use;

export const cancelRenewal = () =>
  store.set((state) =>
    state.current ? { current: { ...state.current, renewalCancelled: true } } : state
  );
