import {
  cancelMembershipRenewal,
  toCurrentPlan,
  useMembershipAccount,
  type CurrentPlan,
} from '@/api/membership';
import { createStore } from '@/lib/store';
import * as React from 'react';

export type { CurrentPlan };

// The last membership the server sent, so the screen has something to show while offline.
const saved = createStore<{ current: CurrentPlan | null }>(
  { current: null },
  { persist: 'membership-v2', scope: 'account' }
);

export function useMembership() {
  const snapshot = saved.useValue();
  const query = useMembershipAccount();
  const current = query.data ? toCurrentPlan(query.data) : snapshot.current;
  React.useEffect(() => {
    if (query.data) saved.set({ current: toCurrentPlan(query.data) });
  }, [query.data]);
  return { current };
}

export const cancelRenewal = () => cancelMembershipRenewal();
