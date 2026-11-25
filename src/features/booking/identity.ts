import { useBookingProfile } from '@/api/booking';
import * as React from 'react';
import { ageFrom } from './utils';

// Name, age and sex for the booking. What the account already has is shown and locked; anything
// missing is asked for once, because the first booking saves it for good.
export function useBookingIdentity() {
  const profile = useBookingProfile();
  const saved = profile.data;
  const savedName = [saved?.firstName, saved?.lastName].filter(Boolean).join(' ').trim();
  const savedAge = ageFrom(saved?.dateOfBirth);
  const savedSex = saved?.sexAtBirth?.trim() ?? '';

  const [name, setName] = React.useState('');
  const [age, setAge] = React.useState('');
  const [sex, setSex] = React.useState('');

  const value = {
    name: savedName || name.trim(),
    age: savedAge !== null ? String(savedAge) : age.trim(),
    sex: savedSex || sex,
  };
  const locked = { name: Boolean(savedName), age: savedAge !== null, sex: Boolean(savedSex) };
  const ageNumber = Number(value.age);
  const missing = [
    ...(value.name.length >= 2 ? [] : ['Your full name']),
    ...(value.age && Number.isInteger(ageNumber) && ageNumber >= 0 && ageNumber <= 150
      ? []
      : ['A valid age']),
    ...(value.sex ? [] : ['Your sex']),
  ];

  return {
    ...value,
    locked,
    missing,
    loading: profile.isPending,
    failed: profile.isError,
    retry: profile.refetch,
    set: (patch: Partial<{ name: string; age: string; sex: string }>) => {
      if (patch.name !== undefined) setName(patch.name);
      if (patch.age !== undefined) setAge(patch.age.replace(/\D/g, '').slice(0, 3));
      if (patch.sex !== undefined) setSex(patch.sex);
    },
  };
}

export type BookingIdentity = ReturnType<typeof useBookingIdentity>;
