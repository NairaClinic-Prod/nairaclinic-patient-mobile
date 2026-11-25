export type MedicationState = 'available' | 'owned' | 'ordered';

export type CareMedication = {
  id: string;
  encounterId: string;
  prescriptionId: string | null;
  rx: number;
  name: string;
  strength: string;
  dose: string;
  frequency: string;
  route: string;
  durationDays: number | null;
  startIso: string;
  endIso: string | null;
  instruction: string;
  external: boolean;
  state: MedicationState;
};

export type TestStatus = 'awaiting' | 'resulted';

export type CareTest = {
  id: string;
  encounterId: string;
  n: number;
  name: string;
  sample: string;
  requestedIso: string;
  note: string;
  external: boolean;
  status: TestStatus;
};

export type CareReferral = {
  id: string;
  title: string;
  hospital: string;
  reason: string;
  status?: string;
  dateIso: string;
  referredBy?: string;
  onPlatform: boolean;
};

export type Encounter = {
  id: string;
  ref: string;
  title: string;
  dateIso: string;
  doctor: string;
  prescriptionId?: string | null;
  external: boolean;
  clinic: string;
  active: boolean;
  medications: CareMedication[];
  tests: CareTest[];
};

export type PersonalTodo = {
  id: string;
  title: string;
  note: string;
  done: boolean;
};

export type CarePlanData = {
  encounters: Encounter[];
  referrals: CareReferral[];
  todos: PersonalTodo[];
  done: Record<string, boolean>;
};

export type CarePlanTab = 'all' | 'medication' | 'test' | 'referral';
