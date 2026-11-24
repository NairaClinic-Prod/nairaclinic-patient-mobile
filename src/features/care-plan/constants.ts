export const CARE_PLAN_TABS = [
  { value: 'all', label: 'All' },
  { value: 'medication', label: 'Prescriptions' },
  { value: 'test', label: 'Test' },
  { value: 'referral', label: 'Referral' },
] as const;

export const TEST_NOTE = 'Ask your laboratory about preparation and bring the test order.';
export const OWNED_NOTE =
  'Ordering is complete for this prescription. A new prescription is needed to order this medicine again.';
export const DEFAULT_MED_NOTE = 'Use only as directed in your prescription.';

export const ISSUED_BY = {
  all: 'By',
  medication: 'Prescribed by',
  test: 'Requested by',
  referral: 'Referred by',
} as const;
