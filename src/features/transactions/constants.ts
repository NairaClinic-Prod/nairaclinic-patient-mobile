import type { TransactionKind } from './types';

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
