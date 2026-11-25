import { createStore } from '@/lib/store';
import { DUMMY_PROFILE } from '../dummy';
import type { ProfileData } from '../types';

const store = createStore({ profile: DUMMY_PROFILE }, { persist: 'profile', scope: 'account' });

export const useProfile = store.use;

export function saveProfile(profile: ProfileData) {
  store.set({ profile });
}

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
