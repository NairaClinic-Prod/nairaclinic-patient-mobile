import { useBookingProfile } from '@/api/booking';
import { ageFrom } from './utils';

// Name, age and sex come from the account, which was set up when the patient signed up. The booking
// forms never ask for them again; the backend fills in anything it already has.
export function useBookingIdentity() {
  const profile = useBookingProfile();
  const saved = profile.data;
  const name = [saved?.firstName, saved?.lastName].filter(Boolean).join(' ').trim();
  const age = ageFrom(saved?.dateOfBirth);
  return {
    name,
    age: age !== null ? String(age) : '',
    sex: saved?.sexAtBirth?.trim() ?? '',
    loading: profile.isPending,
  };
}

export type BookingIdentity = ReturnType<typeof useBookingIdentity>;
