import { createStore } from '@/lib/store';
import { DUMMY_DOCTOR_PLANS } from './dummy';

const store = createStore(
  { plans: DUMMY_DOCTOR_PLANS },
  { persist: 'doctor-plans', scope: 'account' }
);

export const useDoctorPlans = store.useValue;

export const turnOffAutoRenew = (id: string) =>
  store.set((state) => ({
    plans: state.plans.map((plan) =>
      plan.id === id ? { ...plan, status: 'ending', nextChargeKobo: null } : plan
    ),
  }));
