import type { ProfileDetailSection } from './types';

export const DETAIL_COPY: Record<ProfileDetailSection, { title: string; description: string }> = {
  personal: {
    title: 'Personal information',
    description: 'The contact and identity details used across your care.',
  },
  health: {
    title: 'Health profile',
    description: 'Core medical details clinicians may use when providing care.',
  },
  preferences: {
    title: 'Preferences',
    description: 'Help us communicate with you appropriately.',
  },
};

export const SEX_OPTIONS = ['Female', 'Male', 'Intersex', 'Prefer not to say'] as const;
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
export const GENOTYPES = ['AA', 'AS', 'AC', 'SS', 'SC'] as const;
export const YES_NO = ['No', 'Sometimes', 'Yes'] as const;

export const LOCKED_NOTE =
  "Your saved name, date of birth and sex can't be changed here. Contact NairaClinic support if something is wrong.";
