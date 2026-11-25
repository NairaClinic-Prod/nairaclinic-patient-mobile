import { EMPTY_PROFILE, saveProfileData, useProfileQuery, type ProfileData } from '@/api/profile';
import { createStore } from '@/lib/store';
import * as React from 'react';

export type { ProfileData };

// The last profile the server sent, so the screen has something to show while offline.
const snapshot = createStore<{ profile: ProfileData }>(
  { profile: EMPTY_PROFILE },
  { persist: 'profile-v2', scope: 'account' }
);

export function useProfile() {
  const saved = snapshot.useValue();
  const query = useProfileQuery();
  React.useEffect(() => {
    if (query.data) snapshot.set({ profile: query.data });
  }, [query.data]);
  return {
    profile: query.data ?? saved.profile,
    isPending: query.isPending && !saved.profile.firstName && !saved.profile.email,
    isError: query.isError && !query.data && !saved.profile.firstName && !saved.profile.email,
    refetch: query.refetch,
  };
}

export const saveProfile = (profile: ProfileData) => saveProfileData(profile);

export function initialsOf(profile: ProfileData) {
  return (
    [profile.firstName, profile.lastName]
      .filter(Boolean)
      .map((value) => value[0])
      .join('')
      .toUpperCase() || 'NC'
  );
}

export function ageOf(dob: string) {
  const born = dob ? new Date(dob) : null;
  if (!born || Number.isNaN(born.getTime())) return null;
  const now = new Date();
  let years = now.getFullYear() - born.getFullYear();
  const birthday = new Date(now.getFullYear(), born.getMonth(), born.getDate());
  if (now < birthday) years -= 1;
  return years >= 0 ? years : null;
}

export const fullName = (profile: ProfileData) =>
  [profile.firstName, profile.lastName].filter(Boolean).join(' ');

// How much of the profile is filled in, and what is still missing.
export function completion(profile: ProfileData, hasPhoto: boolean) {
  const checks: [string, boolean][] = [
    ['A profile photo', hasPhoto],
    ['Email address', Boolean(profile.email.trim())],
    ['Blood group', Boolean(profile.bloodGroup)],
    ['Genotype', Boolean(profile.genotype)],
    ['Allergies', Boolean(profile.allergies.trim())],
    ['Current medicines', Boolean(profile.currentMedications.trim())],
    ['Past conditions', Boolean(profile.pastConditions.trim())],
    ['Preferred language', Boolean(profile.language.trim())],
    ['Smoking', Boolean(profile.smokingStatus)],
    ['Alcohol', Boolean(profile.alcoholUse)],
  ];
  const done = checks.filter(([, ok]) => ok).length;
  return {
    percent: Math.round((done / checks.length) * 100),
    missing: checks.filter(([, ok]) => !ok).map(([label]) => label),
  };
}
