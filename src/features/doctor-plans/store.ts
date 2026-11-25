import { cancelDoctorPlan, useMyDoctorSubscriptions, type DoctorPlan } from '@/api/doctor-plans';
import { createStore } from '@/lib/store';
import * as React from 'react';

export type { DoctorPlan };

// The last plans the server sent, so the screen has something to show while offline.
const saved = createStore<{ plans: DoctorPlan[] }>(
  { plans: [] },
  { persist: 'doctor-plans-v2', scope: 'account' }
);

export function useDoctorPlans() {
  const snapshot = saved.useValue();
  const query = useMyDoctorSubscriptions();
  React.useEffect(() => {
    if (query.data) saved.set({ plans: query.data });
  }, [query.data]);
  return { plans: query.data ?? snapshot.plans };
}

export const turnOffAutoRenew = (id: string) => cancelDoctorPlan(id);
