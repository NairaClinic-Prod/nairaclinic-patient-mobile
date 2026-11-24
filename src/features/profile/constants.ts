import type { AccountSection, TransactionKind } from './types';

export const SECTION_COPY: Record<AccountSection, { title: string; description: string }> = {
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
  'payment-methods': {
    title: 'Payment methods',
    description:
      'Add a card, or pay with one and we keep it. Pay with a saved card in a tap, and if a renewal fails on one card we try the others.',
  },
  transactions: {
    title: 'Transactions',
    description:
      "Consultations, pharmacy orders and plans you've paid for. Unpaid bookings never appear here.",
  },
  security: {
    title: 'Privacy & security',
    description: 'Your medical records remain private and access-controlled.',
  },
};

export const SEX_OPTIONS = ['Female', 'Male', 'Intersex', 'Prefer not to say'] as const;
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
export const GENOTYPES = ['AA', 'AS', 'AC', 'SS', 'SC'] as const;
export const YES_NO = ['No', 'Sometimes', 'Yes'] as const;

export const KIND_LABEL: Record<TransactionKind, string> = {
  consultation: 'Consultation',
  pharmacy: 'Pharmacy',
  subscription: 'Membership',
  doctor_plan: 'Doctor plan',
  credits: 'Credits',
  community: 'Community',
  files: 'Files',
  other: 'Other',
};

export const CARD_CHECK_NAIRA = 50;
export const PIN_LENGTH = 5;
export const PRIVACY_URL = 'https://nairaclinic.com/privacy-policy';
export const TERMS_URL = 'https://nairaclinic.com/terms';
export const LOCKED_NOTE =
  "Your saved name, date of birth and sex can't be changed here. Contact NairaClinic support if something is wrong.";
