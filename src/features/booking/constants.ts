import { Sparkles, UserRoundSearch, type LucideIcon } from 'lucide-react-native';

export const REASON_OPTIONS = [
  { value: 'follow_up', label: 'Follow-up' },
  { value: 'new_complaint', label: 'New complaint' },
  { value: 'test_result_review', label: 'Test result review' },
  { value: 'prescription_refill', label: 'Prescription refill' },
  { value: 'medication_review', label: 'Medication review' },
  { value: 'symptom_check', label: 'Symptom check' },
  { value: 'chronic_care_review', label: 'Chronic care review' },
  { value: 'second_opinion', label: 'Second opinion' },
  { value: 'general_consultation', label: 'General consultation' },
  { value: 'preventive_advice', label: 'Preventive advice' },
  { value: 'others', label: 'Others' },
] as const;

export type BookingChoiceKey = 'smart' | 'doctor';

export const BOOKING_CHOICES: {
  key: BookingChoiceKey;
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    key: 'smart',
    title: 'Find me a doctor',
    description: "Tell us what's going on and we'll match you with the next available doctor.",
    icon: Sparkles,
  },
  {
    key: 'doctor',
    title: 'I have a doctor in mind',
    description: 'Search for them by name or link, then book a time that suits you.',
    icon: UserRoundSearch,
  },
];

export const MIN_QUERY = 2;
export const MAX_PHOTOS = 5;
export const SMART_FEE_NGN = 5000;
export const SMART_SERVICE_FEE_NGN = 100;
export const SMART_DURATION_MINS = 30;
export const BOOKING_DAYS = 7;
