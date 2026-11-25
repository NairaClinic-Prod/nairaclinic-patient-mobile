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

export const SAMPLE_TYPES = ['Blood', 'Urine', 'Other'] as const;

export const EXTERNAL_NEXT = {
  medication: [
    {
      value: 'order',
      title: 'Order medicines',
      description: 'Continue directly to order from a pharmacy.',
      cta: 'Order medicines',
    },
    {
      value: 'have',
      title: 'I have these medicines',
      description: 'Set reminders on the Reminders page.',
      cta: 'Save',
    },
    {
      value: 'save',
      title: 'Just save the prescription',
      description: 'Come back to order or set reminders later.',
      cta: 'Save prescription',
    },
  ],
  test: [
    {
      value: 'order',
      title: 'Order tests',
      description: 'Continue directly to a laboratory order.',
      cta: 'Order tests',
    },
    {
      value: 'have',
      title: "I've booked / done these tests",
      description: 'Set reminders on the Reminders page.',
      cta: 'Save',
    },
    {
      value: 'save',
      title: 'Just save the order',
      description: 'Come back to order or set reminders later.',
      cta: 'Save order',
    },
  ],
} as const;

export const EXTERNAL_CONFIRM = {
  medication:
    'I checked the medicine names, strengths, doses, frequency and duration against my prescription.',
  test: 'I checked the test names against my test order.',
} as const;

export const IRREVERSIBLE_NOTE =
  'Once a medicine is ordered or marked as already owned, it cannot be ordered again from this prescription. A new prescription is needed for another course.';

export const EXTERNAL_SUMMARY = {
  medication: {
    order: "You're asking for a pharmacy price on every medicine listed.",
    have: "You're confirming that you already have every medicine listed.",
    save: "You're saving this prescription to come back to later.",
  },
  test: {
    order: "You're asking for a laboratory order for every test listed.",
    have: "You're confirming that you've booked or done every test listed.",
    save: "You're saving this order to come back to later.",
  },
} as const;
