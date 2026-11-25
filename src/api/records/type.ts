export type PageMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
};

export type VitalHistoryEntry = {
  atUtc: string;
  value: string;
  id?: string;
  timing?: string;
  note?: string;
  source?: 'typed' | 'upload';
};

// One saved vital as the backend keeps it. Blood pressure, heart rate and sugar are the ones the app edits.
export type VitalRow = {
  id?: string;
  name?: string;
  value?: string;
  unit?: string;
  status?: 'normal' | 'abnormal' | 'unknown';
  trend?: 'up' | 'down' | 'stable';
  history?: VitalHistoryEntry[];
};

export type PrescriptionRecord = { id: string; status?: string; itemsJson: unknown };

export type ConsultationRecord = {
  id: string;
  scheduledAtUtc?: string | null;
  createdAt?: string | null;
  status?: string | null;
  diagnosis?: string | null;
  reason?: string | null;
  labTests?: string[] | null;
  doctorMedications?: unknown[] | null;
  prescription?: PrescriptionRecord | null;
  doctor?: { name?: string | null; specialty?: string | null } | null;
};

export type ConsultationsReply = { consultations: ConsultationRecord[]; meta?: PageMeta };

export type ReferralsReply = { referrals: unknown[]; meta?: PageMeta };

export type ProfileVitalsReply = { patientProfile: { vitalsJson: unknown } | null };

export type HealthRecordsPage = {
  vitalsJson: unknown;
  referrals: unknown[];
  consultations: ConsultationRecord[];
  meta: PageMeta | undefined;
};

export type MedicationState = 'available' | 'owned' | 'ordered';

export type SourceFile = { url: string; name: string; type: string };

export type ExternalNext = 'order' | 'have' | 'save';

export type ExternalMedicine = {
  name: string;
  dose: string;
  frequency: string;
  route: string;
  durationDays: number | null;
  startDate: string;
};

export type ExternalTestItem = { name: string; sample: 'Blood' | 'Urine' | 'Other' };

export type ExternalRecord =
  | {
      id: string;
      kind: 'medication';
      clinic: string;
      date: string;
      items: ExternalMedicine[];
      next: ExternalNext;
      sourceFiles?: SourceFile[];
      createdAt: string;
    }
  | {
      id: string;
      kind: 'test';
      clinic: string;
      date: string;
      items: ExternalTestItem[];
      next: ExternalNext;
      sourceFiles?: SourceFile[];
      createdAt: string;
    };

export type NewExternalRecord =
  | {
      kind: 'medication';
      clinic: string;
      date: string;
      items: ExternalMedicine[];
      next: ExternalNext;
      replaceId?: string;
      sourceFiles?: SourceFile[];
    }
  | {
      kind: 'test';
      clinic: string;
      date: string;
      items: ExternalTestItem[];
      next: ExternalNext;
      replaceId?: string;
      sourceFiles?: SourceFile[];
    };

export type TestResultFile = {
  id: string;
  testIds: string[];
  encounterId: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
};

export type TestOrder = {
  id: string;
  encounterId: string;
  testIds: string[];
  mode: 'visit' | 'home';
  recipient: string;
  phone: string;
  date: string;
  address: string;
  subtotalNgn: number;
  feeNgn: number;
  coinsUsed: number;
  createdAt: string;
};

export type NewTestOrder = Omit<TestOrder, 'id' | 'createdAt'>;

export type LabLink = {
  id: string;
  slug: string;
  encounterId: string;
  testIds: string[];
  labName: string;
  labEmail: string;
  url: string;
  accessCode: string;
  expiresAt: string;
  createdAt: string;
  usedAt?: string | null;
  revokedAt?: string | null;
};

export type NewLabLink = Omit<LabLink, 'id' | 'createdAt' | 'usedAt' | 'revokedAt'>;

export type CarePlanStore = {
  owned: Record<string, MedicationState>;
  externals: ExternalRecord[];
  results: TestResultFile[];
  orders: TestOrder[];
  labLinks: LabLink[];
  // Item key -> when the patient ticked it off.
  done: Record<string, string>;
};

// A file picked on the phone, ready to upload.
export type UploadFile = { uri: string; name: string; type: string };

export type ExtractedReading = {
  kind: 'bp' | 'sugar';
  systolic: number | null;
  diastolic: number | null;
  pulse: number | null;
  sugar: number | null;
  unit: 'mg/dL' | 'mmol/L';
  takenAt: string;
  asWritten: string;
  warnings: string[];
};

export type ScanWarning = { item: number | null; message: string };

export type ExtractedItem = {
  name?: string;
  dose?: string;
  frequency?: string;
  route?: string;
  durationDays?: number | null;
  startDate?: string;
  sample?: 'Blood' | 'Urine' | 'Other';
  asWritten?: string;
};

export type Extraction = {
  kind: 'medication' | 'test';
  clinic: string;
  date: string;
  items: ExtractedItem[];
  sourceFile?: SourceFile;
  transcript?: string;
  warnings?: ScanWarning[];
};
