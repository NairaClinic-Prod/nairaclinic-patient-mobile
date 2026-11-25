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
  settings: {
    title: 'Settings',
    description: 'Security, notifications and how the app looks.',
  },
  wallet: {
    title: 'Wallet',
    description: 'Your balance, and every naira in and out of it.',
  },
  membership: {
    title: 'Membership',
    description: 'Straightforward plans for you, your household, or your team.',
  },
  'lab-tests': {
    title: 'Lab tests',
    description: 'Book tests at verified laboratories, pay once, and get results on your record.',
  },
  notifications: {
    title: 'Notifications',
    description: 'Updates, reminders, and follow-through.',
  },
  refer: {
    title: 'Refer someone',
    description: 'Invite friends and family to NairaClinic.',
  },
  'doctor-plans': {
    title: 'My doctor plans',
    description: 'Monthly plans you hold with your doctors and the visits left this month.',
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

export const REFERRAL_STEPS = [
  { title: 'Share your invite', text: 'Send your personal link or code to friends and family.' },
  {
    title: 'They create an account',
    text: 'The invitation is credited when a new patient registers through your link.',
  },
  {
    title: 'Privacy stays protected',
    text: 'You see the referral count, never another patient’s health information.',
  },
] as const;

export const REFERRAL_FAQ = [
  {
    question: 'What can I see about referrals?',
    answer:
      'Only your referral count is available. Health and private account details are never shared.',
  },
  {
    question: 'Does my link expire?',
    answer:
      'Your patient referral link is reusable. If it stops working, reopen this page to get the current link.',
  },
  {
    question: 'Where are coin rewards shown?',
    answer:
      'Your coin balance shows on your Wallet. Coins are applied when you choose an offer and pay.',
  },
] as const;

export const PLAN_AUDIENCES = [
  { value: 'individual', label: 'Individual' },
  { value: 'family', label: 'Family' },
  { value: 'enterprise', label: 'Business' },
] as const;
