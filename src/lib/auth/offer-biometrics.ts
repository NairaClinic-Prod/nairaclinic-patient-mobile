import { createStore } from '@/lib/store';
import { biometricLabel, biometricSupport, type BiometricKind } from './biometrics';
import { getSession, takeBiometricsOffer } from './session';

type Offer = { open: boolean; kind: BiometricKind };

const store = createStore<Offer>({ open: false, kind: null });

export const useBiometricsOffer = store.useValue;
export const closeBiometricsOffer = () => store.set((state) => ({ ...state, open: false }));
export { biometricLabel };

// After a PIN login on a phone with Face ID or fingerprint, offers it once for next time.
export async function offerBiometrics() {
  if (getSession().biometrics) return;
  const support = await biometricSupport();
  if (!support.available) return;
  if (!(await takeBiometricsOffer())) return;
  store.set({ open: true, kind: support.kind });
}
